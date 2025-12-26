# Production и Preview - Быстрая настройка

## Текущие домены

- **Production:** `https://new-year-oracle.vercel.app/`
- **Preview:** `https://oracle-lwv2bpw2a-alexkochnev1987s-projects.vercel.app` (меняется!)

## ⚠️ Проблема

Preview URL в Vercel **меняется для каждого deployment**! Это означает:

- ❌ Нельзя использовать конкретный preview URL как постоянный
- ✅ Нужен кастомный домен для preview

## ✅ Решение: Кастомный домен для Preview

### 1. Добавьте домен для Preview

```
Vercel Dashboard → Settings → Domains → Add Domain
Введите: staging-oracle.example.com
```

### 2. Настройте DNS

```
CNAME: staging-oracle → cname.vercel-dns.com.
```

### 3. Назначьте Preview окружению

```
Domains → staging-oracle.example.com → Configure → Preview ✅
```

### 4. Обновите переменные окружения

**Production:**

```
NEXTAUTH_URL = https://new-year-oracle.vercel.app
```

**Preview:**

```
NEXTAUTH_URL = https://staging-oracle.example.com
```

### 5. Настройте Google OAuth

Добавьте оба redirect URI:

```
https://new-year-oracle.vercel.app/api/auth/callback/google
https://staging-oracle.example.com/api/auth/callback/google
```

## Результат

✅ **Production:** `https://new-year-oracle.vercel.app`  
✅ **Preview:** `https://staging-oracle.example.com` (постоянный!)  
✅ **Оба домена** работают с Google OAuth

## Подробная инструкция

📖 См. [PRODUCTION_PREVIEW_SETUP.md](./PRODUCTION_PREVIEW_SETUP.md)
