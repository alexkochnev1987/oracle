# Деплой в Vercel - Пошаговая инструкция

## Подготовка

### 1. Убедитесь, что код в Git репозитории

```bash
# Если еще не инициализирован Git
git init
git add .
git commit -m "Initial commit"

# Создайте репозиторий на GitHub и добавьте remote
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

## Деплой в Vercel

### Шаг 1: Создание проекта в Vercel

1. Зайдите на [vercel.com](https://vercel.com) и войдите (или зарегистрируйтесь через GitHub)
2. Нажмите **"Add New..."** → **"Project"**
3. Импортируйте ваш GitHub репозиторий
4. Выберите репозиторий с проектом `oracle`

### Шаг 2: Настройка проекта

1. **Root Directory**: Если проект находится в подпапке `oracle`, укажите:

   ```
   Root Directory: oracle
   ```

2. **Framework Preset**: Vercel автоматически определит Next.js

3. **Build Command**: Оставьте по умолчанию или укажите:

   ```bash
   pnpm build
   ```

4. **Output Directory**: Оставьте по умолчанию (`.next`)

5. **Install Command**:
   ```bash
   pnpm install
   ```

### Шаг 3: Настройка переменных окружения

**ВАЖНО**: Добавьте все переменные окружения ДО первого деплоя!

В разделе **"Environment Variables"** добавьте следующие переменные:

#### Обязательные переменные:

1. **`POSTGRES_URL`**

   - Для Vercel Postgres:
     - В Vercel Dashboard → Storage → Create Database → Postgres
     - После создания базы данных, Vercel автоматически добавит переменную `POSTGRES_URL`
     - Или скопируйте Connection String из настроек базы данных
   - Для внешней базы (Supabase, Neon, etc.):
     - Формат: `postgresql://user:password@host:port/database?sslmode=require`
     - Пример: `postgresql://user:pass@db.example.com:5432/mydb?sslmode=require`

2. **`NEXTAUTH_SECRET`**

   - Сгенерируйте секретный ключ:
     ```bash
     openssl rand -base64 32
     ```
   - Или используйте онлайн генератор: https://generate-secret.vercel.app/32
   - Пример значения: `your-generated-secret-key-here`

3. **`NEXTAUTH_URL`**

   - Для продакшена: `https://your-app-name.vercel.app`
   - Vercel автоматически предоставит URL после первого деплоя
   - Можно обновить после первого деплоя, если нужно

4. **`GOOGLE_CLIENT_ID`**

   - Получите из [Google Cloud Console](https://console.cloud.google.com/)
   - Создайте OAuth 2.0 Client ID
   - Добавьте Authorized redirect URIs:
     - `https://your-app-name.vercel.app/api/auth/callback/google`

5. **`GOOGLE_CLIENT_SECRET`**

   - Получите из Google Cloud Console (тот же проект, где создали Client ID)

6. **`OPENAI_API_KEY`**
   - Получите из [OpenAI Platform](https://platform.openai.com/api-keys)
   - Формат: `sk-...`

### Шаг 4: Настройка базы данных

#### Вариант A: Vercel Postgres (Рекомендуется)

1. В Vercel Dashboard → **Storage** → **Create Database**
2. Выберите **Postgres**
3. Выберите план (Hobby - бесплатный для начала)
4. Выберите регион (ближайший к вашим пользователям)
5. Создайте базу данных
6. Vercel автоматически добавит переменную `POSTGRES_URL`

#### Вариант B: Внешняя база данных (Supabase, Neon, etc.)

1. Создайте базу данных на выбранном провайдере
2. Скопируйте Connection String
3. Добавьте в переменные окружения как `POSTGRES_URL`

### Шаг 5: Применение миграций базы данных

После первого деплоя нужно применить схему базы данных:

#### Способ 1: Через Vercel CLI (Рекомендуется)

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в Vercel
vercel login

# Перейдите в папку проекта
cd oracle

# Примените миграции
vercel env pull .env.local  # Скачайте переменные окружения
pnpm db:push
```

#### Способ 2: Через Vercel Dashboard

1. В Vercel Dashboard → ваш проект → **Settings** → **Build & Development Settings**
2. Добавьте в **Build Command**:
   ```bash
   pnpm install && pnpm db:push && pnpm build
   ```
3. Или используйте отдельный скрипт для миграций

#### Способ 3: Через GitHub Actions или отдельный деплой

Создайте отдельный скрипт для миграций, который будет запускаться после деплоя.

### Шаг 6: Деплой

1. Нажмите **"Deploy"** в Vercel
2. Дождитесь завершения билда
3. После успешного деплоя примените миграции базы данных (см. Шаг 5)

## Проверка после деплоя

### 1. Проверьте URL приложения

После деплоя Vercel предоставит URL вида: `https://your-app-name.vercel.app`

### 2. Проверьте переменные окружения

В Vercel Dashboard → ваш проект → **Settings** → **Environment Variables**

Убедитесь, что все переменные добавлены для окружения **Production** (и **Preview**, если нужно).

### 3. Проверьте базу данных

- Убедитесь, что миграции применены
- Проверьте подключение к базе данных

### 4. Протестируйте функционал

- Попробуйте войти через Google OAuth
- Создайте тестовое предсказание
- Проверьте работу AI (для разрешенных пользователей)

## Обновление переменных окружения

Если нужно обновить переменные:

1. Vercel Dashboard → ваш проект → **Settings** → **Environment Variables**
2. Найдите нужную переменную
3. Нажмите **Edit** или **Remove**
4. Добавьте новое значение
5. **ВАЖНО**: После изменения переменных нужно сделать **Redeploy**
   - Перейдите в **Deployments**
   - Найдите последний деплой
   - Нажмите **"..."** → **"Redeploy"**

## Настройка кастомного домена

### Для одного домена (staging и production вместе):

📖 **[Настройка кастомного домена для Staging и Production](./CUSTOM_DOMAIN_SETUP.md)**

### Для разных доменов (production и preview отдельно):

📖 **[Настройка Production и Preview окружений](./PRODUCTION_PREVIEW_SETUP.md)**

**Быстрая настройка:**

- Production: `https://new-year-oracle.vercel.app/`
- Preview: Добавьте кастомный домен (например: `staging-oracle.example.com`)

См. [PRODUCTION_PREVIEW_QUICK.md](./PRODUCTION_PREVIEW_QUICK.md) для быстрой инструкции.

## Troubleshooting

### Проблема: База данных не подключена

**Решение:**

- Проверьте `POSTGRES_URL` в переменных окружения
- Убедитесь, что база данных создана и доступна
- Проверьте, что миграции применены

### Проблема: OAuth не работает

**Решение:**

- Проверьте `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET`
- Убедитесь, что в Google Cloud Console добавлен правильный redirect URI:
  `https://your-app-name.vercel.app/api/auth/callback/google`
- Проверьте `NEXTAUTH_URL` - должен совпадать с URL приложения

### Проблема: AI не работает

**Решение:**

- Проверьте `OPENAI_API_KEY` в переменных окружения
- Убедитесь, что ключ действителен и имеет доступ к Vision API
- Проверьте логи в Vercel Dashboard → **Deployments** → выберите деплой → **Logs**

### Проблема: Ошибка билда "Command 'pnpm run build' exited with 1"

**Решение:**

- ✅ Убедитесь, что в `package.json` есть скрипт `postinstall: "prisma generate"`
- ✅ Убедитесь, что `build` скрипт включает генерацию Prisma: `"build": "prisma generate && next build"`
- ✅ Проверьте, что `prisma/schema.prisma` закоммичен в Git
- ✅ Убедитесь, что все переменные окружения добавлены (особенно `POSTGRES_URL`)
- ✅ Проверьте логи билда в Vercel Dashboard для деталей ошибки

**Если проблема с Prisma:**

```bash
# Локально проверьте, что Prisma генерируется
pnpm prisma generate
pnpm run build
```

### Проблема: Prisma Client не найден

**Решение:**

- Убедитесь, что `postinstall` скрипт добавлен в `package.json`
- Проверьте, что `prisma` находится в `devDependencies`
- После изменения `package.json` сделайте новый деплой

## Полезные команды Vercel CLI

📖 **Подробная инструкция:** [Управление доменами через Vercel CLI](./VERCEL_CLI_DOMAINS.md)

```bash
# Войти в Vercel
vercel login

# Деплой в preview окружение
vercel

# Деплой в production
vercel --prod

# Работа с доменами
vercel domains list                    # Показать все домены
vercel domains add domain.com project  # Добавить домен
vercel domains inspect domain.com      # Информация о домене

# Управление переменными окружения
vercel env ls                          # Показать все переменные
vercel env add VARIABLE_NAME env       # Добавить переменную
vercel env rm VARIABLE_NAME env        # Удалить переменную
vercel env pull .env.local             # Скачать переменные локально

# Просмотр логов
vercel logs [deployment-url]           # Логи deployment
```

## Чеклист перед деплоем

- [ ] Код закоммичен и запушен в GitHub
- [ ] В `package.json` есть скрипт `postinstall: "prisma generate"`
- [ ] В `package.json` скрипт `build` включает `prisma generate`
- [ ] `prisma/schema.prisma` закоммичен в Git
- [ ] Все переменные окружения добавлены в Vercel
- [ ] База данных создана и доступна
- [ ] Google OAuth настроен с правильными redirect URIs
- [ ] OpenAI API ключ получен и добавлен
- [ ] `NEXTAUTH_SECRET` сгенерирован
- [ ] `NEXTAUTH_URL` указан (можно обновить после первого деплоя)
- [ ] Миграции базы данных готовы к применению
- [ ] Локальный билд проходит успешно: `pnpm run build`

## После деплоя

- [ ] Применить миграции базы данных
- [ ] Протестировать вход через Google OAuth
- [ ] Протестировать создание предсказания
- [ ] Проверить работу AI для разрешенных пользователей
- [ ] Проверить логи на наличие ошибок
