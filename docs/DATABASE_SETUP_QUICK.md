# Быстрая настройка базы данных

## Варианты базы данных

Для этого проекта можно использовать:
1. **Vercel Postgres** (рекомендуется) - встроенная в Vercel
2. **Neon** - внешний сервис, интегрируется с Vercel
3. **Supabase** - альтернатива

## ⚠️ Важно для этого проекта

**Этот проект использует Prisma ORM**, поэтому:
- ❌ НЕ нужно устанавливать `@neondatabase/serverless`
- ✅ Prisma уже настроен и работает с любым PostgreSQL
- ✅ Просто подключите базу данных через `DATABASE_URL`

## Вариант 1: Vercel Postgres (Самый простой)

### Шаг 1: Создайте базу данных в Vercel

1. Зайдите на [vercel.com](https://vercel.com)
2. Откройте ваш проект
3. Перейдите в **Storage** → **Create Database**
4. Выберите **Postgres**
5. Создайте базу данных

### Шаг 2: Получите строку подключения

1. В **Storage** → ваша БД → **Settings**
2. Скопируйте **Connection String**

### Шаг 3: Добавьте в Environment Variables

1. В проекте Vercel → **Settings** → **Environment Variables**
2. Добавьте `DATABASE_URL` со значением из шага 2
3. Сохраните

### Шаг 4: Примените схему Prisma

```bash
# Локально (добавьте DATABASE_URL в .env)
pnpm db:push

# Или через Vercel CLI
vercel env pull .env.local
pnpm db:push
```

## Вариант 2: Neon Database

### Шаг 1: Создайте проект в Neon

1. Зайдите на [neon.tech](https://neon.tech)
2. Создайте аккаунт/войдите
3. Создайте новый проект
4. Выберите регион

### Шаг 2: Получите строку подключения

1. В Neon Console скопируйте **Connection String**
2. Формат: `postgresql://user:password@host/database`

### Шаг 3: Добавьте в Vercel

1. В Vercel → **Settings** → **Environment Variables**
2. Добавьте `DATABASE_URL`
3. Вставьте строку подключения из Neon

### Шаг 4: Примените схему

```bash
# Добавьте DATABASE_URL в локальный .env
pnpm db:push
```

## Применение схемы Prisma

После подключения базы данных выполните:

```bash
# 1. Убедитесь, что DATABASE_URL в .env файле
# 2. Примените схему
pnpm db:push

# Это создаст все таблицы:
# - User
# - Account
# - Session
# - Reading
# - VerificationToken
```

## Проверка подключения

```bash
# Откройте Prisma Studio для просмотра данных
pnpm db:studio

# Или проверьте через SQL
# В Neon/Vercel Postgres есть SQL Editor
```

## Использование Vercel CLI

```bash
# 1. Войдите в Vercel
vercel login

# 2. Свяжите проект
vercel link

# 3. Скачайте переменные окружения
vercel env pull .env.local

# 4. Примените схему
pnpm db:push
```

## Что НЕ нужно делать

❌ Устанавливать `@neondatabase/serverless` - Prisma уже работает  
❌ Создавать таблицы вручную - Prisma сделает это через `db:push`  
❌ Менять код подключения - Prisma уже настроен

## Структура базы данных

После `pnpm db:push` будут созданы таблицы:

- **User** - пользователи
- **Account** - аккаунты OAuth
- **Session** - сессии пользователей
- **Reading** - прогнозы таро
- **VerificationToken** - токены верификации

Все автоматически создастся через Prisma!

