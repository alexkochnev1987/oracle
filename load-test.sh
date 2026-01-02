#!/bin/bash

# Load testing script for QR code reading creation endpoint using curl
# Tests 100 concurrent requests to /api/qr/[token]
#
# Usage: ./load-test.sh <token>
# Example: ./load-test.sh 5fb51c5a-7fb5-4e88-a707-e3a05bf17327

BASE_URL="${BASE_URL:-https://new-year-oracle.vercel.app}"
CONCURRENT_REQUESTS=100
TIMEOUT=60

if [ -z "$1" ]; then
    echo "❌ Error: QR token is required"
    echo "Usage: ./load-test.sh <token>"
    echo "Example: ./load-test.sh 5fb51c5a-7fb5-4e88-a707-e3a05bf17327"
    exit 1
fi

TOKEN="$1"

echo "🚀 Starting load test..."
echo "📍 Target: ${BASE_URL}/api/qr/${TOKEN}"
echo "📊 Concurrent requests: ${CONCURRENT_REQUESTS}"
echo "⏱️  Timeout per request: ${TIMEOUT}s"
echo ""

# Create temporary directory for results
TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT

# Function to make a single request
make_request() {
    local request_num=$1
    local start_time=$(date +%s%N)
    
    # Random question
    questions=(
        "Что меня ждет в будущем?"
        "Какие изменения произойдут в моей жизни?"
        "Что нужно знать о моих отношениях?"
        "Какой путь мне выбрать?"
        "Что скрывает мое подсознание?"
    )
    question="${questions[$RANDOM % ${#questions[@]}]}"
    
    # Random birth date (dd-mm-yy)
    day=$(printf "%02d" $((RANDOM % 28 + 1)))
    month=$(printf "%02d" $((RANDOM % 12 + 1)))
    year=$(printf "%02d" $((RANDOM % 50 + 50)))
    birth_date="${day}-${month}-${year}"
    
    # Random 3 cards from Major Arcana
    cards=("major-0" "major-1" "major-2" "major-3" "major-4" "major-5" "major-6" "major-7" "major-8" "major-9" "major-10" "major-11" "major-12" "major-13" "major-14" "major-15" "major-16" "major-17" "major-18" "major-19" "major-20" "major-21")
    selected_cards=()
    for i in {1..3}; do
        selected_cards+=("${cards[$RANDOM % ${#cards[@]}]}")
    done
    
    # Create JSON array for cards
    cards_json="["
    for i in "${!selected_cards[@]}"; do
        if [ $i -gt 0 ]; then
            cards_json+=","
        fi
        cards_json+="\"${selected_cards[$i]}\""
    done
    cards_json+="]"
    
    # Make request
    response=$(curl -s -w "\n%{http_code}\n%{time_total}" \
        --max-time $TIMEOUT \
        -X POST \
        -F "selectedCards=${cards_json}" \
        -F "cardSelectionMode=random" \
        -F "birthDate=${birth_date}" \
        -F "question=${question}" \
        -F "tarotReaderId=default" \
        -F "locale=ru" \
        "${BASE_URL}/api/qr/${TOKEN}" 2>&1)
    
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    
    # Parse response
    http_code=$(echo "$response" | tail -n 2 | head -n 1)
    time_total=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -2)
    
    # Check if success
    if echo "$body" | grep -q '"success":true'; then
        echo "✅ Request #${request_num}: ${http_code} (${duration}ms)"
        echo "1" > "$TMP_DIR/success_${request_num}"
    else
        echo "❌ Request #${request_num}: ${http_code} (${duration}ms)"
        echo "1" > "$TMP_DIR/failed_${request_num}"
    fi
    
    echo "$http_code" > "$TMP_DIR/status_${request_num}"
    echo "$duration" > "$TMP_DIR/duration_${request_num}"
}

# Start all requests in background
start_time=$(date +%s%N)

for i in $(seq 1 $CONCURRENT_REQUESTS); do
    make_request $i &
done

# Wait for all background jobs
wait

end_time=$(date +%s%N)
total_duration=$(( (end_time - start_time) / 1000000 ))

# Calculate statistics
successful=$(ls -1 $TMP_DIR/success_* 2>/dev/null | wc -l)
failed=$(ls -1 $TMP_DIR/failed_* 2>/dev/null | wc -l)

# Calculate average duration
total_duration_sum=0
duration_count=0
for file in $TMP_DIR/duration_*; do
    if [ -f "$file" ]; then
        duration=$(cat "$file")
        total_duration_sum=$((total_duration_sum + duration))
        duration_count=$((duration_count + 1))
    fi
done

if [ $duration_count -gt 0 ]; then
    avg_duration=$((total_duration_sum / duration_count))
else
    avg_duration=0
fi

# Find min and max durations
min_duration=999999
max_duration=0
for file in $TMP_DIR/duration_*; do
    if [ -f "$file" ]; then
        duration=$(cat "$file")
        if [ $duration -lt $min_duration ]; then
            min_duration=$duration
        fi
        if [ $duration -gt $max_duration ]; then
            max_duration=$duration
        fi
    fi
done

# Print summary
echo ""
echo "============================================================"
echo "📈 LOAD TEST SUMMARY"
echo "============================================================"
echo "Total requests: ${CONCURRENT_REQUESTS}"
echo "✅ Successful: ${successful} ($(( successful * 100 / CONCURRENT_REQUESTS ))%)"
echo "❌ Failed: ${failed} ($(( failed * 100 / CONCURRENT_REQUESTS ))%)"
echo ""
echo "⏱️  Timing:"
echo "   Total time: ${total_duration}ms ($(echo "scale=2; $total_duration / 1000" | bc)s)"
echo "   Average response: ${avg_duration}ms"
echo "   Min response: ${min_duration}ms"
echo "   Max response: ${max_duration}ms"
if [ $total_duration -gt 0 ]; then
    requests_per_sec=$(echo "scale=2; $CONCURRENT_REQUESTS * 1000 / $total_duration" | bc)
    echo "   Requests/sec: ${requests_per_sec}"
fi
echo "============================================================"

# Status code breakdown
echo ""
echo "📊 HTTP Status Codes:"
for code in $(cat $TMP_DIR/status_* 2>/dev/null | sort | uniq); do
    count=$(grep -c "^${code}$" $TMP_DIR/status_* 2>/dev/null || echo "0")
    echo "   ${code}: ${count}"
done

# Final verdict
if [ $successful -ge $((CONCURRENT_REQUESTS * 90 / 100)) ]; then
    echo ""
    echo "🎉 SUCCESS: Server handled the load well!"
elif [ $successful -ge $((CONCURRENT_REQUESTS * 50 / 100)) ]; then
    echo ""
    echo "⚠️  WARNING: Server struggled with the load"
else
    echo ""
    echo "💥 CRITICAL: Server failed to handle the load"
fi

