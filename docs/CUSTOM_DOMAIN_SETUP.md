# Настройка кастомного домена для Staging и Production

## Цель

Настроить один домен, который будет работать для обоих окружений (staging/preview и production), чтобы можно было добавить один Authorized redirect URI в Google OAuth.

## Варианты настройки

### Вариант 1: Один домен для Production и Preview (Рекомендуется)

Vercel автоматически использует один кастомный домен для production и preview deployments. Это самый простой способ.

#### Шаг 1: Добавьте кастомный домен в Vercel

1. Vercel Dashboard → ваш проект → **Settings** → **Domains**
2. Нажмите **"Add"** или **"Add Domain"**
3. Введите ваш домен (например: `oracle.example.com`)
4. Нажмите **"Add"**

#### Шаг 2: Настройте DNS записи

Vercel покажет, какие DNS записи нужно добавить:

**Для корневого домена (example.com):**

- Тип: `A`
- Имя: `@` или оставьте пустым
- Значение: IP адрес от Vercel (например: `76.76.21.21`)

**Для поддомена (oracle.example.com):**

- Тип: `CNAME`
- Имя: `oracle` (или ваш поддомен)
- Значение: `cname.vercel-dns.com.`

**Или используйте ANAME/ALIAS (если поддерживается):**

- Тип: `ANAME` или `ALIAS`
- Имя: `oracle`
- Значение: `cname.vercel-dns.com.`

#### Шаг 3: Дождитесь активации домена

- Обычно занимает от нескольких минут до 24 часов
- Vercel покажет статус: **Valid Configuration** когда все готово
- Проверьте статус в разделе **Domains**

#### Шаг 4: Настройте переменные окружения

Обновите `NEXTAUTH_URL` для обоих окружений:

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. Найдите `NEXTAUTH_URL`
3. Обновите значение на ваш кастомный домен:
   ```
   https://oracle.example.com
   ```
4. Убедитесь, что переменная добавлена для:
   - ✅ **Production**
   - ✅ **Preview**

#### Шаг 5: Настройте Google OAuth

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите ваш проект
3. **APIs & Services** → **Credentials**
4. Найдите ваш OAuth 2.0 Client ID
5. Нажмите **Edit**
6. В разделе **Authorized redirect URIs** добавьте:
   ```
   https://oracle.example.com/api/auth/callback/google
   ```
7. Нажмите **Save**

**Важно:** Один домен будет работать для обоих окружений (production и preview), так как Vercel использует один домен для всех deployments.

---

### Вариант 2: Разные поддомены для Staging и Production

Если вы хотите явно разделить staging и production:

#### Структура:

- Production: `app.example.com` или `oracle.example.com`
- Staging: `staging.example.com` или `oracle-staging.example.com`

#### Шаг 1: Добавьте оба домена в Vercel

1. Vercel Dashboard → **Settings** → **Domains**
2. Добавьте первый домен (production): `oracle.example.com`
3. Добавьте второй домен (staging): `staging.example.com`

#### Шаг 2: Настройте Production домен

1. В разделе **Domains** найдите `oracle.example.com`
2. Нажмите **"..."** → **"Configure"**
3. Выберите **"Production"** в разделе **Assignments**
4. Настройте DNS записи (CNAME на `cname.vercel-dns.com.`)

#### Шаг 3: Настройте Staging домен

1. В разделе **Domains** найдите `staging.example.com`
2. Нажмите **"..."** → **"Configure"**
3. Выберите **"Preview"** в разделе **Assignments**
4. Настройте DNS записи (CNAME на `cname.vercel-dns.com.`)

#### Шаг 4: Настройте переменные окружения

**Для Production:**

- `NEXTAUTH_URL` = `https://oracle.example.com`

**Для Preview:**

- `NEXTAUTH_URL` = `https://staging.example.com`

**Или используйте одну переменную с условной логикой в коде.**

#### Шаг 5: Настройте Google OAuth

Добавьте оба redirect URI:

```
https://oracle.example.com/api/auth/callback/google
https://staging.example.com/api/auth/callback/google
```

---

### Вариант 3: Использование Vercel Preview Deployments с одним доменом

Vercel автоматически создает preview URLs для каждого PR/branch. Вы можете использовать один кастомный домен для всех preview deployments.

#### Настройка:

1. Добавьте кастомный домен (как в Варианте 1)
2. В настройках домена выберите:
   - **Production** → ваш основной домен
   - **Preview** → тот же домен (или оставьте preview URLs по умолчанию)

**Преимущество:** Один домен для production, preview URLs остаются автоматическими.

---

## Рекомендуемый подход: Вариант 1

**Используйте один домен для обоих окружений:**

1. ✅ Проще настроить
2. ✅ Один redirect URI в Google OAuth
3. ✅ Меньше DNS записей
4. ✅ Vercel автоматически управляет routing

### Пример настройки:

```
Домен: oracle.example.com

Production deployments → oracle.example.com
Preview deployments → oracle.example.com (или preview URLs)
```

---

## Пошаговая инструкция (Вариант 1)

### 1. Приобретите домен (если еще нет)

- [Namecheap](https://www.namecheap.com/)
- [Google Domains](https://domains.google/)
- [Cloudflare](https://www.cloudflare.com/products/registrar/)
- [GoDaddy](https://www.godaddy.com/)

### 2. Добавьте домен в Vercel

```bash
# Через CLI
vercel domains add oracle.example.com

# Или через Dashboard
# Settings → Domains → Add Domain
```

### 3. Настройте DNS

**Для поддомена (oracle.example.com):**

| Тип   | Имя    | Значение              | TTL  |
| ----- | ------ | --------------------- | ---- |
| CNAME | oracle | cname.vercel-dns.com. | Auto |

**Для корневого домена (example.com):**

| Тип | Имя | Значение    | TTL  |
| --- | --- | ----------- | ---- |
| A   | @   | 76.76.21.21 | Auto |

**Или используйте ANAME/ALIAS (если поддерживается провайдером):**

| Тип   | Имя    | Значение              | TTL  |
| ----- | ------ | --------------------- | ---- |
| ANAME | oracle | cname.vercel-dns.com. | Auto |

### 4. Проверьте статус

В Vercel Dashboard → **Domains** вы увидите:

- ⏳ **Pending** - DNS еще не настроен
- ✅ **Valid Configuration** - домен готов к использованию
- ❌ **Invalid Configuration** - проверьте DNS записи

### 5. Обновите переменные окружения

```bash
# Через CLI
vercel env add NEXTAUTH_URL production
# Введите: https://oracle.example.com

vercel env add NEXTAUTH_URL preview
# Введите: https://oracle.example.com
```

Или через Dashboard:

- **Settings** → **Environment Variables**
- Обновите `NEXTAUTH_URL` для Production и Preview

### 6. Настройте Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Выберите ваш OAuth Client ID
4. **Authorized redirect URIs** → **Add URI**:
   ```
   https://oracle.example.com/api/auth/callback/google
   ```
5. **Save**

### 7. Обновите GOOGLE_CLIENT_SECRET (если нужно)

Если вы изменили redirect URI, убедитесь, что `GOOGLE_CLIENT_SECRET` актуален.

### 8. Сделайте Redeploy

После изменения переменных окружения:

```bash
vercel --prod
```

Или через Dashboard:

- **Deployments** → выберите деплой → **"..."** → **"Redeploy"**

---

## Проверка работы

### 1. Проверьте домен

```bash
# Проверьте DNS
dig oracle.example.com
# или
nslookup oracle.example.com
```

### 2. Проверьте SSL сертификат

Vercel автоматически выдает SSL сертификат через Let's Encrypt. Проверьте:

```
https://oracle.example.com
```

### 3. Протестируйте OAuth

1. Откройте `https://oracle.example.com`
2. Попробуйте войти через Google
3. Проверьте, что redirect работает корректно

---

## Troubleshooting

### Проблема: Домен не активируется

**Решение:**

- Проверьте DNS записи (может занять до 24 часов)
- Убедитесь, что CNAME указывает на `cname.vercel-dns.com.` (с точкой в конце!)
- Проверьте, что домен не используется в другом проекте Vercel

### Проблема: SSL сертификат не выдается

**Решение:**

- Подождите несколько минут (Vercel автоматически выдает сертификат)
- Проверьте, что DNS записи настроены правильно
- Убедитесь, что домен указывает на Vercel

### Проблема: OAuth не работает с новым доменом

**Решение:**

- Проверьте, что `NEXTAUTH_URL` обновлен в переменных окружения
- Убедитесь, что redirect URI добавлен в Google Cloud Console
- Сделайте redeploy после изменения переменных
- Проверьте логи в Vercel Dashboard

### Проблема: Preview deployments не используют кастомный домен

**Решение:**

- По умолчанию preview deployments используют автоматические URLs
- Если хотите использовать кастомный домен для preview, настройте его в **Domains** → **Configure** → выберите **Preview**

---

## Полезные команды

```bash
# Добавить домен через CLI
vercel domains add oracle.example.com

# Посмотреть все домены
vercel domains ls

# Удалить домен
vercel domains rm oracle.example.com

# Проверить DNS
dig oracle.example.com
nslookup oracle.example.com
```

---

## Итоговая конфигурация

После настройки у вас будет:

✅ **Один домен** для production и preview  
✅ **Один redirect URI** в Google OAuth  
✅ **Автоматический SSL** от Vercel  
✅ **Простая настройка** переменных окружения

**Пример:**

```
Домен: oracle.example.com
NEXTAUTH_URL: https://oracle.example.com
Google OAuth Redirect: https://oracle.example.com/api/auth/callback/google
```
