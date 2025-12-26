# Настройка домена - Быстрая шпаргалка

## Цель

Настроить один домен для staging и production, чтобы добавить один Authorized redirect URI в Google OAuth.

## Быстрая настройка (5 шагов)

### 1. Добавьте домен в Vercel

```
Vercel Dashboard → Settings → Domains → Add Domain
Введите: oracle.example.com
```

### 2. Настройте DNS

**Для поддомена (oracle.example.com):**

```
Тип: CNAME
Имя: oracle
Значение: cname.vercel-dns.com. (с точкой в конце!)
```

### 3. Дождитесь активации

- Проверьте статус в Vercel Dashboard → Domains
- Должно быть: ✅ **Valid Configuration**
- Обычно занимает 5-30 минут

### 4. Обновите переменные окружения

```
NEXTAUTH_URL = https://oracle.example.com
```

Добавьте для **Production** и **Preview**.

### 5. Настройте Google OAuth

```
Google Cloud Console → Credentials → OAuth Client ID
Authorized redirect URIs:
https://oracle.example.com/api/auth/callback/google
```

## Проверка

```bash
# Проверьте DNS
dig oracle.example.com

# Проверьте сайт
curl -I https://oracle.example.com
```

## Важно

✅ Один домен работает для обоих окружений (production и preview)  
✅ Один redirect URI в Google OAuth  
✅ Vercel автоматически выдает SSL сертификат  
✅ После изменения переменных сделайте redeploy

## Подробная инструкция

📖 См. [CUSTOM_DOMAIN_SETUP.md](./CUSTOM_DOMAIN_SETUP.md) для детальной инструкции.
