# AWS S3 Setup for Image Storage

This guide explains how to configure AWS S3 for storing user images.

## Overview

The application uses AWS S3 to store user-uploaded images. Images are uploaded in parallel with GPT analysis to optimize performance. If S3 upload fails, the application continues to work normally (images just won't be saved to S3).

## Prerequisites

- AWS account
- Basic knowledge of AWS S3 and IAM

## Step 1: Create S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click "Create bucket"
3. Configure bucket:
   - **Bucket name**: Choose a unique name (e.g., `oracle-tarot-images`)
   - **Region**: Choose your preferred region (e.g., `us-east-1`)
   - **Block Public Access**: Uncheck "Block all public access" if you want public URLs
     - ⚠️ **Note**: Modern S3 buckets don't support ACLs. Use bucket policies instead.
   - **Bucket Versioning**: Optional (recommended: Disabled)
   - **Default encryption**: Recommended (SSE-S3 or SSE-KMS)
4. Click "Create bucket"

## Step 2: Configure Bucket Policy (for Public Access)

If you want images to be publicly accessible via URL:

1. Go to your bucket → **Permissions** tab
2. Scroll to **Bucket policy**
3. Add the following policy (replace `your-bucket-name` with your actual bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

**Alternative**: If you want private images, skip this step and use presigned URLs (requires code changes).

## Step 3: Create IAM User

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Create user**
3. Enter username (e.g., `oracle-s3-uploader`)
4. Select **Provide user access to the AWS Management Console** → **I want to create an IAM user** (for programmatic access)
5. Click **Next**
6. Click **Attach policies directly**
7. Click **Create policy**
8. Use JSON editor and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

Replace `your-bucket-name` with your actual bucket name.

9. Name the policy (e.g., `OracleS3UploadPolicy`)
10. Click **Create policy**
11. Go back to user creation, refresh policies, select your new policy
12. Click **Next** → **Create user**

## Step 4: Generate Access Keys

1. Click on the created user
2. Go to **Security credentials** tab
3. Scroll to **Access keys**
4. Click **Create access key**
5. Select **Application running outside AWS**
6. Click **Next** → **Create access key**
7. **IMPORTANT**: Copy both:
   - **Access key ID**
   - **Secret access key** (shown only once!)

## Step 5: Configure Environment Variables

Add these variables to your `.env` file (or Vercel environment variables):

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-access-key-id-here
AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_S3_BUCKET_URL=https://your-bucket-name.s3.us-east-1.amazonaws.com
```

### Variable Descriptions

- `AWS_ACCESS_KEY_ID` - Access key ID from Step 4 (required)
- `AWS_SECRET_ACCESS_KEY` - Secret access key from Step 4 (required)
- `AWS_REGION` - AWS region where your bucket is located (required, default: `us-east-1`)
- `AWS_S3_BUCKET_NAME` - Name of your S3 bucket (required)
- `AWS_S3_BUCKET_URL` - Public URL of your bucket (optional, auto-generated if not provided)

## Step 6: Test the Setup

1. Restart your development server
2. Create a new reading with an image
3. Check your S3 bucket - you should see uploaded images in `{userId}/{timestamp}-{uuid}.jpg` format
4. Check the database - `userImageUrl` should contain the S3 URL

## Troubleshooting

### Error: "AccessControlListNotSupported"

**Solution**: Modern S3 buckets don't support ACLs. The code has been updated to not use ACLs. Make sure you're using the latest version and configure bucket policy instead (see Step 2).

### Error: "Access Denied"

**Possible causes**:
- IAM user doesn't have correct permissions
- Bucket policy is blocking access
- Access keys are incorrect

**Solution**: 
1. Verify IAM user has `s3:PutObject` and `s3:GetObject` permissions
2. Check bucket policy allows access
3. Verify access keys in environment variables

### Images Not Uploading but No Error

**Possible causes**:
- S3 credentials not set in environment
- Bucket name incorrect

**Solution**: 
1. Check environment variables are set correctly
2. Verify bucket name matches `AWS_S3_BUCKET_NAME`
3. Check server logs for S3 upload errors

### Images Upload but URLs Don't Work

**Possible causes**:
- Bucket policy doesn't allow public read access
- Incorrect `AWS_S3_BUCKET_URL` format

**Solution**:
1. Verify bucket policy allows `s3:GetObject` for public
2. Check `AWS_S3_BUCKET_URL` format: `https://bucket-name.s3.region.amazonaws.com`

## Security Best Practices

1. **Never commit access keys to Git** - Use environment variables only
2. **Use IAM roles in production** - Instead of access keys when possible (e.g., on EC2)
3. **Restrict IAM permissions** - Only grant `s3:PutObject` and `s3:GetObject` for the specific bucket
4. **Enable bucket encryption** - Use SSE-S3 or SSE-KMS
5. **Use presigned URLs for private images** - If images should be private, implement presigned URL generation
6. **Monitor S3 access** - Enable CloudTrail to track S3 access

## Cost Considerations

- **Storage**: ~$0.023 per GB/month (first 50 TB)
- **PUT requests**: ~$0.005 per 1,000 requests
- **GET requests**: ~$0.0004 per 1,000 requests

For typical usage (thousands of images), costs are minimal.

## Alternative: Private Images with Presigned URLs

If you want private images (not publicly accessible), you'll need to:

1. Remove bucket policy (Step 2)
2. Modify `src/lib/s3.ts` to generate presigned URLs instead of public URLs
3. Store only the S3 key in database, generate presigned URL on-demand

This requires additional code changes beyond the scope of this setup guide.

