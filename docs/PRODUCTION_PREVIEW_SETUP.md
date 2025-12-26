# Настройка Production и Preview окружений

## Текущая конфигурация

- **Production:** `https://new-year-oracle.vercel.app/`
- **Preview/Dev:** `https://oracle-lwv2bpw2a-alexkochnev1987s-projects.vercel.app` (автоматический URL от Vercel)

## Важно о Preview URLs

⚠️ **Preview URLs в Vercel автоматические и меняются для каждого deployment!**

Каждый preview deployment получает уникальный URL вида:

```
https://oracle-{random-id}-{team-name}.vercel.app
```

Это означает, что:

- ❌ Нельзя использовать конкретный preview URL как постоянный домен
- ✅ Нужно использовать переменные окружения для динамического определения URL
- ✅ Или настроить кастомный домен для preview окружения

---

## Решение 1: Использование переменных окружения (Рекомендуется)

### Шаг 1: Настройте переменные окружения в Vercel

1. Vercel Dashboard → ваш проект → **Settings** → **Environment Variables**

2. **Для Production:**

   - Нажмите **"Add New"**
   - **Name:** `NEXTAUTH_URL`
   - **Value:** `https://new-year-oracle.vercel.app`
   - Выберите только **✅ Production**
   - Нажмите **"Save"**

3. **Для Preview:**

   - Нажмите **"Add New"** (или используйте существующую переменную)
   - **Name:** `NEXTAUTH_URL`
   - **Value:** `https://oracle-lwv2bpw2a-alexkochnev1987s-projects.vercel.app`
   - Выберите только **✅ Preview**
   - Нажмите **"Save"**

   ⚠️ **Важно:** Preview URL будет меняться! См. Решение 2 для постоянного домена.

### Шаг 2: Настройте Google OAuth

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Найдите ваш OAuth 2.0 Client ID
4. Нажмите **Edit**
5. В разделе **Authorized redirect URIs** добавьте оба URL:

   ```
   https://new-year-oracle.vercel.app/api/auth/callback/google
   https://oracle-lwv2bpw2a-alexkochnev1987s-projects.vercel.app/api/auth/callback/google
   ```

   ⚠️ **Проблема:** Preview URL меняется, поэтому нужно добавлять новый каждый раз!

6. Нажмите **Save**

### Шаг 3: Сделайте Redeploy

После изменения переменных окружения:

```bash
vercel --prod  # для production
vercel         # для preview
```

Или через Dashboard:

- **Deployments** → выберите деплой → **"..."** → **"Redeploy"**

---

## Решение 2: Кастомный домен для Preview (Лучшее решение)

Чтобы иметь постоянный домен для preview, настройте кастомный поддомен.

📖 **Также см.: [Управление доменами через Vercel CLI](./VERCEL_CLI_DOMAINS.md)**

### Шаг 1: Добавьте кастомный домен для Preview

1. Vercel Dashboard → ваш проект → **Settings** → **Domains**
2. Нажмите **"Add Domain"**
3. Введите поддомен для preview (например: `staging-oracle.example.com` или `dev-oracle.example.com`)
4. Нажмите **"Add"**

### Шаг 2: Настройте DNS

**Для поддомена (staging-oracle.example.com):**

| Тип   | Имя            | Значение              | TTL  |
| ----- | -------------- | --------------------- | ---- |
| CNAME | staging-oracle | cname.vercel-dns.com. | Auto |

### Шаг 3: Назначьте домен Preview окружению

1. В разделе **Domains** найдите ваш preview домен
2. Нажмите **"..."** → **"Configure"**
3. В разделе **Assignments** выберите:
   - ✅ **Preview** (для preview deployments)
   - ❌ **Production** (оставьте пустым или назначьте другой домен)

### Шаг 4: Обновите переменные окружения

**Для Production:**

- `NEXTAUTH_URL` = `https://new-year-oracle.vercel.app`

**Для Preview:**

- `NEXTAUTH_URL` = `https://staging-oracle.example.com` (ваш кастомный домен)

### Шаг 5: Настройте Google OAuth

Добавьте оба redirect URI:

```
https://new-year-oracle.vercel.app/api/auth/callback/google
https://staging-oracle.example.com/api/auth/callback/google
```

✅ Теперь у вас постоянные домены для обоих окружений!

---

## Решение 3: Использование VERCEL_URL (Динамическое определение)

Если хотите автоматически определять URL из переменной окружения Vercel:

### Шаг 1: Обновите код для использования VERCEL_URL

Vercel автоматически предоставляет переменную `VERCEL_URL` для каждого deployment.

Обновите `src/lib/auth.ts`:

```typescript
// Вместо жестко заданного NEXTAUTH_URL, используйте VERCEL_URL
const getBaseUrl = () => {
  // В production используйте кастомный домен
  if (process.env.NODE_ENV === "production") {
    return process.env.NEXTAUTH_URL || "https://new-year-oracle.vercel.app";
  }

  // В preview/dev используйте VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Для локальной разработки
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
};

export const authOptions = {
  // ...
  // Используйте getBaseUrl() вместо process.env.NEXTAUTH_URL
};
```

### Шаг 2: Настройте переменные окружения

**Для Production:**

- `NEXTAUTH_URL` = `https://new-year-oracle.vercel.app`

**Для Preview:**

- Не нужно добавлять `NEXTAUTH_URL` (будет использоваться `VERCEL_URL`)

### Шаг 3: Настройте Google OAuth

⚠️ **Проблема:** Все равно нужно добавлять каждый preview URL вручную, так как они меняются.

---

## Рекомендуемое решение

### ✅ Используйте кастомный домен для Preview (Решение 2)

**Преимущества:**

- ✅ Постоянный домен для preview
- ✅ Один раз настроить в Google OAuth
- ✅ Легко тестировать
- ✅ Профессиональный подход

**Структура:**

```
Production:  https://new-year-oracle.vercel.app
Preview:     https://staging-oracle.example.com (кастомный домен)
```

---

## Быстрая настройка (Решение 2)

### 1. Добавьте кастомный домен для Preview

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

```
https://new-year-oracle.vercel.app/api/auth/callback/google
https://staging-oracle.example.com/api/auth/callback/google
```

---

## Проверка

### Production

```bash
curl -I https://new-year-oracle.vercel.app
```

### Preview

```bash
curl -I https://staging-oracle.example.com
```

### Тест OAuth

1. Откройте production URL
2. Попробуйте войти через Google
3. Откройте preview URL
4. Попробуйте войти через Google

---

## Troubleshooting

### Проблема: Preview URL меняется каждый раз

**Решение:** Используйте кастомный домен для preview (Решение 2)

### Проблема: OAuth не работает на preview

**Решение:**

- Проверьте, что preview URL добавлен в Google OAuth
- Убедитесь, что `NEXTAUTH_URL` правильно настроен для Preview окружения
- Сделайте redeploy после изменения переменных

### Проблема: Нужно добавлять новый preview URL каждый раз

**Решение:** Настройте кастомный домен для preview - это решит проблему раз и навсегда!

---

## Итоговая конфигурация

После настройки у вас будет:

✅ **Production домен:** `https://new-year-oracle.vercel.app`  
✅ **Preview домен:** `https://staging-oracle.example.com` (кастомный)  
✅ **Два redirect URI** в Google OAuth (постоянные)  
✅ **Раздельные переменные окружения** для каждого окружения
