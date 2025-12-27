# Настройка тестовых ключей Stripe

## Быстрая настройка

### Шаг 1: Переключитесь на тестовый режим в Stripe Dashboard

**Важно:** По умолчанию Stripe показывает **Live mode** (реальные ключи). Для разработки нужны **Test mode** ключи.

**Способ 1: Через сообщение в верхней части**
1. В верхней части Dashboard найдите сообщение **"Test mode has moved. Show me"**
2. Кликните на **"Show me"** или **"Test mode"**
3. Это переключит вас в тестовый режим

**Способ 2: Через переключатель режима**
1. Найдите переключатель в правом верхнем углу Dashboard
2. Переключите с **"Live mode"** на **"Test mode"**
3. Страница обновится, и вы увидите тестовые ключи

**Способ 3: Прямая ссылка**
1. Откройте [Stripe Dashboard в Test Mode](https://dashboard.stripe.com/test/apikeys)
2. Это автоматически переключит вас в тестовый режим

### Шаг 2: Получите тестовые ключи

После переключения на Test mode:

1. Перейдите в **Developers** → **API keys**
2. В разделе **"Standard keys"** вы увидите:
   - **Publishable key** (начинается с `pk_test_`) - скопируйте его
   - **Secret key** (начинается с `sk_test_`) - нажмите "Reveal test key" чтобы увидеть полный ключ, затем скопируйте
3. Убедитесь, что ключи начинаются с `pk_test_` и `sk_test_` (не `pk_live_` и `sk_live_`!)

### Шаг 3: Создайте или обновите файл `.env.local`

В корне проекта `oracle/` создайте файл `.env.local` (если его нет) и добавьте:

```bash
# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_ваш_секретный_ключ_здесь
STRIPE_PUBLISHABLE_KEY=pk_test_ваш_публичный_ключ_здесь
```

**⚠️ ВАЖНО:**
- Используйте **Secret key** (`sk_test_...`) для `STRIPE_SECRET_KEY`
- Используйте **Publishable key** (`pk_test_...`) для `STRIPE_PUBLISHABLE_KEY`
- **НЕ** путайте их местами!
- **НЕ** используйте publishable key в `STRIPE_SECRET_KEY` - это вызовет ошибку "Invalid API Key"

### Шаг 4: Перезапустите сервер разработки

После добавления ключей:

```bash
# Остановите сервер (Ctrl+C)
# Затем запустите снова
pnpm dev
```

## Проверка правильности ключей

### Правильный формат:

✅ **Правильно:**
```bash
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

❌ **Неправильно:**
```bash
# Использование publishable key в secret key
STRIPE_SECRET_KEY=pk_test_...  # ❌ ОШИБКА!

# Неполный ключ
STRIPE_SECRET_KEY=sk_test_...  # ❌ Ключ обрезан

# Ключи из production mode
STRIPE_SECRET_KEY=sk_live_...  # ❌ Используйте test ключи для разработки
```

## Настройка вебхука для локальной разработки

**⚠️ ВАЖНО:** Webhook secret для локальной разработки **меняется каждый раз**, когда вы запускаете `stripe listen`!

1. Установите Stripe CLI: https://stripe.com/docs/stripe-cli
2. Войдите в Stripe CLI:
   ```bash
   stripe login
   ```
3. Запустите пересылку вебхуков:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. В выводе терминала найдите строку вида:
   ```
   > Ready! Your webhook signing secret is whsec_...
   ```
5. Скопируйте **webhook signing secret** (начинается с `whsec_`)
6. Добавьте в `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_ваш_webhook_secret_здесь
   ```
7. **Важно:** Если вы остановите и перезапустите `stripe listen`, вы получите **НОВЫЙ** secret - обновите `.env.local` новым значением!

### Для Production (Vercel)

**⚠️ ВАЖНО:** Webhook secret для production **постоянный** для каждого endpoint.

1. Перейдите в [Stripe Dashboard](https://dashboard.stripe.com) (убедитесь, что вы в **Live mode**)
2. Перейдите в **Developers** → **Webhooks**
3. Нажмите **Add endpoint**
4. Введите URL вашего вебхука:
   ```
   https://ваш-домен.vercel.app/api/webhooks/stripe
   ```
5. Выберите события: `checkout.session.completed`
6. Нажмите **Add endpoint**
7. На странице endpoint нажмите **"Reveal"** рядом с **Signing secret**
8. Скопируйте signing secret
9. Добавьте в переменные окружения Vercel:
   - Vercel Dashboard → Ваш проект → Settings → Environment Variables
   - Добавьте `STRIPE_WEBHOOK_SECRET` с этим значением
   - **Этот secret НЕ изменится**, пока вы не удалите и не пересоздадите endpoint

## Пример полного `.env.local` файла

```bash
# Database
POSTGRES_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=ваш_secret_здесь

# Google OAuth
GOOGLE_CLIENT_ID=ваш_client_id
GOOGLE_CLIENT_SECRET=ваш_client_secret

# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_ваш_webhook_secret_здесь

# OpenAI (опционально)
OPENAI_API_KEY=sk-...
```

## Разница между локальным и production webhook secret

### Локальная разработка (stripe listen)

- **Меняется каждый раз** при запуске `stripe listen`
- Генерируется автоматически Stripe CLI
- Используется только для локальной разработки
- Формат: `whsec_...` (обычно длиннее)

**Что делать:**
1. Запустите `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Скопируйте новый secret из вывода терминала
3. Обновите `.env.local` с новым значением
4. Перезапустите сервер

### Production (Stripe Dashboard)

- **Постоянный** для каждого endpoint
- Создается один раз при создании webhook endpoint
- Не меняется, пока вы не удалите endpoint
- Формат: `whsec_...` (обычно короче)

**Что делать:**
1. Создайте endpoint в Stripe Dashboard
2. Скопируйте signing secret один раз
3. Добавьте в Vercel environment variables
4. Больше не нужно менять (если не пересоздаете endpoint)

## Устранение проблем

### Ошибка: "Invalid API Key provided"

**Причины:**
1. Ключ не установлен в `.env.local`
2. Используется publishable key вместо secret key
3. Ключ обрезан или содержит лишние пробелы
4. Используются production ключи вместо test

**Решение:**
1. Проверьте, что файл `.env.local` существует в корне `oracle/`
2. Убедитесь, что `STRIPE_SECRET_KEY` начинается с `sk_test_`
3. Убедитесь, что ключ полный (обычно ~100+ символов)
4. Перезапустите сервер после изменения `.env.local`

### Проверка, что ключи загружены

Добавьте временно в код (только для проверки):

```typescript
console.log("Stripe key exists:", !!process.env.STRIPE_SECRET_KEY);
console.log("Stripe key starts with sk_test_:", process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_"));
```

**⚠️ НЕ коммитьте это в git!** Удалите после проверки.

## Тестовые карты

После настройки ключей используйте тестовые карты:

- **Успешная оплата:** `4242 4242 4242 4242`
- **Отклоненная оплата:** `4000 0000 0000 0002`
- **Любая будущая дата истечения**
- **Любой 3-значный CVC**

## Дополнительная информация

- [Полная документация по настройке Stripe](./STRIPE_SETUP.md)
- [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
- [Stripe Test Cards](https://stripe.com/docs/testing)

