# Vercel CLI - Быстрая шпаргалка

## Что можно сделать через CLI

### ✅ Доступно:

- Добавить/удалить домены
- Управлять переменными окружения
- Деплоить в production/preview
- Просматривать логи
- Управлять alias

### ❌ Недоступно:

- Назначение домена на Production/Preview (только через Dashboard)

---

## Быстрая настройка доменов

### 1. Добавить домены

```bash
# Production домен
vercel domains add new-year-oracle.vercel.app oracle

# Preview домен
vercel domains add staging-oracle.example.com oracle
```

### 2. Настроить переменные окружения

```bash
# Production
vercel env add NEXTAUTH_URL production
# Введите: https://new-year-oracle.vercel.app

# Preview
vercel env add NEXTAUTH_URL preview
# Введите: https://staging-oracle.example.com
```

### 3. Назначить домены на окружения (Dashboard)

⚠️ **Обязательно через Dashboard:**

- `new-year-oracle.vercel.app` → **Production**
- `staging-oracle.example.com` → **Preview**

### 4. Деплой

```bash
# Preview
vercel

# Production
vercel --prod
```

---

## Полезные команды

```bash
# Авторизация
vercel login
vercel whoami

# Проект
vercel link                    # Связать проект
vercel projects list           # Список проектов

# Домены
vercel domains list            # Все домены
vercel domains add domain.com  # Добавить домен
vercel domains inspect domain  # Информация о домене

# Переменные окружения
vercel env ls                  # Все переменные
vercel env add VAR env         # Добавить переменную
vercel env pull .env.local     # Скачать локально

# Деплой
vercel                         # Preview
vercel --prod                  # Production
vercel redeploy [url]          # Передеплой
vercel promote [url]           # Промоутить в production

# Логи
vercel logs [url]              # Логи deployment
vercel ls                      # Список deployments
```

---

## Полный пример

```bash
# 1. Авторизация
vercel login

# 2. Связывание проекта
cd oracle
vercel link

# 3. Добавление доменов
vercel domains add new-year-oracle.vercel.app oracle
vercel domains add staging-oracle.example.com oracle

# 4. Переменные окружения
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_URL preview

# 5. Назначить домены через Dashboard (обязательно!)

# 6. Деплой
vercel --prod
```

---

## Подробная инструкция

📖 [VERCEL_CLI_DOMAINS.md](./VERCEL_CLI_DOMAINS.md)





