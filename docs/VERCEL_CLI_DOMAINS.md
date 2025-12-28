# Управление доменами через Vercel CLI

## Что можно сделать через CLI

### ✅ Доступно через CLI:

1. **Добавить домен в проект**
2. **Просмотреть список доменов**
3. **Управлять alias (перенаправления)**
4. **Управлять переменными окружения**
5. **Деплоить в production и preview**
6. **Просматривать логи**

### ❌ Недоступно через CLI:

- **Назначение домена на Production/Preview окружение** - это делается только через Dashboard
- **Настройка DNS** - нужно делать у вашего DNS провайдера

---

## Команды для работы с доменами

### 1. Просмотр всех доменов

```bash
# Показать все домены в вашей команде
vercel domains list

# Показать домены текущего проекта
vercel domains list --project oracle
```

### 2. Добавление домена

```bash
# Добавить домен в проект
vercel domains add staging-oracle.example.com oracle

# Где:
# - staging-oracle.example.com - ваш домен
# - oracle - название проекта
```

**Важно:** Домен должен быть уже у вас во владении или куплен через Vercel.

### 3. Покупка домена через Vercel

```bash
# Купить новый домен
vercel domains buy example.com

# Это откроет процесс покупки домена
```

### 4. Просмотр информации о домене

```bash
# Информация о домене
vercel domains inspect staging-oracle.example.com
```

### 5. Удаление домена

```bash
# Удалить домен из проекта
vercel domains remove staging-oracle.example.com
```

---

## Настройка постоянных доменов для Production и Preview

### Шаг 1: Добавьте домены через CLI

```bash
# Добавить домен для production (если еще не добавлен)
vercel domains add new-year-oracle.vercel.app oracle

# Добавить кастомный домен для preview
vercel domains add staging-oracle.example.com oracle
```

### Шаг 2: Назначьте домены на окружения (через Dashboard)

⚠️ **Важно:** Назначение домена на Production/Preview окружение **нельзя сделать через CLI**, только через Dashboard:

1. Vercel Dashboard → ваш проект → **Settings** → **Domains**
2. Найдите домен `new-year-oracle.vercel.app`
3. Нажмите **"..."** → **"Configure"**
4. В разделе **Assignments** выберите:

   - ✅ **Production**

5. Найдите домен `staging-oracle.example.com`
6. Нажмите **"..."** → **"Configure"**
7. В разделе **Assignments** выберите:
   - ✅ **Preview**

### Шаг 3: Настройте переменные окружения через CLI

```bash
# Для Production
vercel env add NEXTAUTH_URL production
# Введите: https://new-year-oracle.vercel.app

# Для Preview
vercel env add NEXTAUTH_URL preview
# Введите: https://staging-oracle.example.com
```

### Шаг 4: Проверьте переменные окружения

```bash
# Показать все переменные окружения
vercel env ls

# Показать конкретную переменную
vercel env ls NEXTAUTH_URL
```

---

## Работа с Alias (перенаправления)

Alias позволяет перенаправлять один домен на другой deployment.

### Создание alias

```bash
# Создать alias для deployment
vercel alias set deployment-url.vercel.app staging-oracle.example.com

# Где:
# - deployment-url.vercel.app - URL deployment
# - staging-oracle.example.com - ваш кастомный домен
```

### Просмотр всех alias

```bash
# Показать все alias
vercel alias list
```

### Удаление alias

```bash
# Удалить alias
vercel alias remove staging-oracle.example.com
```

---

## Полный пример настройки через CLI

### 1. Убедитесь, что вы залогинены

```bash
vercel login
```

### 2. Свяжите проект (если еще не связан)

```bash
cd /path/to/oracle
vercel link
```

### 3. Добавьте домены

```bash
# Production домен (обычно уже есть)
vercel domains add new-year-oracle.vercel.app oracle

# Preview домен (кастомный)
vercel domains add staging-oracle.example.com oracle
```

### 4. Настройте переменные окружения

```bash
# Production
vercel env add NEXTAUTH_URL production
# Введите: https://new-year-oracle.vercel.app

# Preview
vercel env add NEXTAUTH_URL preview
# Введите: https://staging-oracle.example.com

# Общие переменные (для обоих окружений)
vercel env add POSTGRES_URL production,preview
# Введите: ваш connection string

vercel env add GOOGLE_CLIENT_ID production,preview
# Введите: ваш client ID

vercel env add GOOGLE_CLIENT_SECRET production,preview
# Введите: ваш client secret

vercel env add OPENAI_API_KEY production,preview
# Введите: ваш API key

vercel env add NEXTAUTH_SECRET production,preview
# Введите: ваш secret
```

### 5. Назначьте домены на окружения (через Dashboard)

⚠️ Это единственный шаг, который нужно сделать через Dashboard:

- `new-year-oracle.vercel.app` → **Production**
- `staging-oracle.example.com` → **Preview**

### 6. Деплой

```bash
# Деплой в preview
vercel

# Деплой в production
vercel --prod
```

---

## Полезные команды CLI

### Управление проектом

```bash
# Показать все проекты
vercel projects list

# Информация о проекте
vercel projects inspect oracle

# Показать все deployments
vercel ls

# Информация о deployment
vercel inspect [deployment-url]
```

### Управление переменными окружения

```bash
# Показать все переменные
vercel env ls

# Добавить переменную
vercel env add VARIABLE_NAME production,preview

# Удалить переменную
vercel env rm VARIABLE_NAME production

# Скачать переменные локально
vercel env pull .env.local
```

### Деплой

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod

# Redeploy существующего deployment
vercel redeploy [deployment-url]

# Промоутить preview в production
vercel promote [deployment-url]
```

### Логи

```bash
# Показать логи deployment
vercel logs [deployment-url]

# Следить за логами в реальном времени
vercel logs [deployment-url] --follow
```

---

## Скрипт для автоматической настройки

Создайте файл `setup-domains.sh`:

```bash
#!/bin/bash

# Настройка доменов для Production и Preview

PROJECT_NAME="oracle"
PROD_DOMAIN="new-year-oracle.vercel.app"
PREVIEW_DOMAIN="staging-oracle.example.com"

echo "🔧 Настройка доменов для проекта $PROJECT_NAME"

# Проверка авторизации
if ! vercel whoami &> /dev/null; then
    echo "❌ Вы не авторизованы. Запустите: vercel login"
    exit 1
fi

# Добавление доменов
echo "📝 Добавление доменов..."
vercel domains add $PROD_DOMAIN $PROJECT_NAME
vercel domains add $PREVIEW_DOMAIN $PROJECT_NAME

# Настройка переменных окружения
echo "🔐 Настройка переменных окружения..."
echo "Введите NEXTAUTH_URL для Production:"
read PROD_URL
vercel env add NEXTAUTH_URL production <<< "$PROD_URL"

echo "Введите NEXTAUTH_URL для Preview:"
read PREVIEW_URL
vercel env add NEXTAUTH_URL preview <<< "$PREVIEW_URL"

echo "✅ Настройка завершена!"
echo "⚠️  Не забудьте назначить домены на окружения через Dashboard:"
echo "   - $PROD_DOMAIN → Production"
echo "   - $PREVIEW_DOMAIN → Preview"
```

Использование:

```bash
chmod +x setup-domains.sh
./setup-domains.sh
```

---

## Проверка конфигурации

### Проверить домены

```bash
# Список всех доменов
vercel domains list

# Информация о конкретном домене
vercel domains inspect staging-oracle.example.com
```

### Проверить переменные окружения

```bash
# Все переменные
vercel env ls

# Конкретная переменная
vercel env ls NEXTAUTH_URL
```

### Проверить deployments

```bash
# Список всех deployments
vercel ls

# Информация о deployment
vercel inspect [deployment-url]
```

---

## Troubleshooting

### Проблема: Домен не добавляется

**Решение:**

```bash
# Проверьте, что вы залогинены
vercel whoami

# Проверьте, что проект связан
vercel link

# Проверьте права доступа к проекту
vercel projects inspect oracle
```

### Проблема: Переменные окружения не применяются

**Решение:**

```bash
# Проверьте переменные
vercel env ls

# Убедитесь, что переменные добавлены для правильных окружений
vercel env ls NEXTAUTH_URL

# После изменения переменных сделайте redeploy
vercel --prod
```

### Проблема: Домен не работает

**Решение:**

```bash
# Проверьте статус домена
vercel domains inspect staging-oracle.example.com

# Проверьте DNS (нужно делать у DNS провайдера)
dig staging-oracle.example.com
```

---

## Итоговая конфигурация через CLI

После выполнения всех команд у вас будет:

✅ **Домены добавлены** через CLI  
✅ **Переменные окружения настроены** через CLI  
✅ **Домены назначены на окружения** через Dashboard (обязательно!)  
✅ **Готово к деплою**

**Команды для деплоя:**

```bash
# Preview
vercel

# Production
vercel --prod
```

---

## Сравнение: CLI vs Dashboard

| Действие                        | CLI | Dashboard |
| ------------------------------- | --- | --------- |
| Добавить домен                  | ✅  | ✅        |
| Удалить домен                   | ✅  | ✅        |
| Назначить на Production/Preview | ❌  | ✅        |
| Настроить переменные окружения  | ✅  | ✅        |
| Деплой                          | ✅  | ✅        |
| Просмотр логов                  | ✅  | ✅        |

**Вывод:** Используйте CLI для автоматизации и быстрой настройки, но для назначения доменов на окружения используйте Dashboard.


