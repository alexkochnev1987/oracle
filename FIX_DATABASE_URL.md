# Исправление ошибки подключения к базе данных

## Проблема

Ошибка: `Can't reach database server at localhost:5432`

**Причина:** В `.env` файле указан пример локальной базы данных, которой нет.

## Решение

### Вариант 1: Использовать Vercel Postgres (Рекомендуется)

1. **Создайте базу данных в Vercel:**
   - Зайдите на vercel.com
   - Откройте проект → **Storage** → **Create Database**
   - Выберите **Postgres** и создайте

2. **Получите строку подключения:**
   - В **Storage** → ваша БД → **Settings**
   - Скопируйте **Connection String**
   - Выглядит примерно так:
     ```
     postgres://default:password@ep-xxx-xxx.region.aws.neon.tech:5432/verceldb?sslmode=require
     ```

3. **Обновите .env файл:**
   ```bash
   # Откройте .env файл
   # Замените DATABASE_URL на реальную строку подключения
   DATABASE_URL="postgres://default:password@ep-xxx-xxx.region.aws.neon.tech:5432/verceldb?sslmode=require"
   ```

4. **Примените схему:**
   ```bash
   pnpm db:push
   ```

### Вариант 2: Использовать Neon Database

1. **Создайте проект на [neon.tech](https://neon.tech)**
2. **Скопируйте Connection String** из Neon Console
3. **Обновите .env:**
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"
   ```
4. **Примените схему:**
   ```bash
   pnpm db:push
   ```

### Вариант 3: Использовать Supabase

1. **Создайте проект на [supabase.com](https://supabase.com)**
2. **Получите Connection String:**
   - Settings → Database → Connection string → URI
3. **Обновите .env:**
   ```env
   DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
   ```
4. **Примените схему:**
   ```bash
   pnpm db:push
   ```

## Быстрая проверка

После обновления `DATABASE_URL`:

```bash
# Проверьте подключение
pnpm db:push

# Если успешно, увидите:
# ✅ The database is now in sync with your Prisma schema.
```

## Использование Vercel CLI для автоматической настройки

Если проект уже связан с Vercel:

```bash
# 1. Войдите в Vercel
vercel login

# 2. Свяжите проект (если еще не связан)
vercel link

# 3. Скачайте переменные окружения из Vercel
vercel env pull .env.local

# 4. Примените схему
pnpm db:push
```

Это автоматически скачает `DATABASE_URL` из Vercel.

## Важно

⚠️ **Не используйте локальную базу данных** (`localhost:5432`) если:
- Вы не установили PostgreSQL локально
- Вы не хотите управлять локальной БД
- Вы планируете деплоить на Vercel

✅ **Используйте облачную базу данных** (Vercel Postgres, Neon, Supabase) для:
- Простой настройки
- Автоматического бэкапа
- Работы в продакшене

## После успешного подключения

После `pnpm db:push` будут созданы все таблицы:
- ✅ User
- ✅ Account  
- ✅ Session
- ✅ Reading
- ✅ VerificationToken

Можно проверить через:
```bash
pnpm db:studio
```

