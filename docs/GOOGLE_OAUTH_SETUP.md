# Как получить Google OAuth Credentials

## Пошаговая инструкция

### Шаг 1: Откройте Google Cloud Console

1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Войдите в свой Google аккаунт

### Шаг 2: Создайте проект (если его нет)

1. Нажмите на выпадающий список проектов вверху страницы
2. Нажмите **"New Project"** (Новый проект)
3. Введите название проекта (например, "Oracle App")
4. Нажмите **"Create"** (Создать)
5. Дождитесь создания проекта (может занять несколько секунд)

### Шаг 3: Включите Google+ API

1. В меню слева выберите **"APIs & Services"** → **"Library"** (Библиотека)
2. В поиске введите **"Google+ API"**
3. Нажмите на **"Google+ API"**
4. Нажмите кнопку **"Enable"** (Включить)

**Примечание:** Google+ API может быть устаревшим. Альтернативно можно использовать:

- **Google Identity Services API** (рекомендуется)
- Или просто пропустить этот шаг - OAuth будет работать и без него

### Шаг 4: Создайте OAuth 2.0 Credentials

1. В меню слева выберите **"APIs & Services"** → **"Credentials"** (Учетные данные)
2. Нажмите **"+ CREATE CREDENTIALS"** (Создать учетные данные)
3. Выберите **"OAuth client ID"** (OAuth клиент ID)

### Шаг 5: Настройте OAuth Consent Screen (если еще не настроен)

Если вы видите предупреждение о настройке Consent Screen:

1. Нажмите **"CONFIGURE CONSENT SCREEN"** (Настроить экран согласия)
2. Выберите **"External"** (Внешний) и нажмите **"CREATE"**
3. Заполните обязательные поля:
   - **App name** (Название приложения): Oracle
   - **User support email** (Email поддержки): ваш email
   - **Developer contact information** (Контакт разработчика): ваш email
4. Нажмите **"SAVE AND CONTINUE"** (Сохранить и продолжить)
5. На следующих экранах нажмите **"SAVE AND CONTINUE"** (можно пропустить)
6. На последнем экране нажмите **"BACK TO DASHBOARD"** (Вернуться на панель)

### Шаг 6: Создайте OAuth Client ID

1. Вернитесь в **"Credentials"** → **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Выберите **Application type** (Тип приложения): **"Web application"** (Веб-приложение)
3. Введите **Name** (Название): Oracle App (или любое другое)
4. В разделе **"Authorized redirect URIs"** (Авторизованные URI перенаправления) добавьте:

   **Для разработки:**

   ```
   http://localhost:3000/api/auth/callback/google
   ```

   **Для продакшена (после деплоя):**

   ```
   https://your-domain.com/api/auth/callback/google
   ```

   Нажмите **"+ ADD URI"** для каждого URI

5. Нажмите **"CREATE"** (Создать)

### Шаг 7: Скопируйте Credentials

После создания вы увидите модальное окно с:

- **Your Client ID** (Ваш Client ID) - это `GOOGLE_CLIENT_ID`
- **Your Client Secret** (Ваш Client Secret) - это `GOOGLE_CLIENT_SECRET`

**Важно:** Client Secret показывается только один раз! Обязательно скопируйте его.

### Шаг 8: Добавьте в .env файл

Откройте файл `.env` и вставьте значения:

```env
GOOGLE_CLIENT_ID="ваш-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="ваш-client-secret"
```

**Пример:**

```env
GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnopqrstuvwxyz"
```

### Шаг 9: Перезапустите сервер

```bash
# Остановите сервер (Ctrl+C) и запустите снова
pnpm dev
```

## Проверка

После настройки:

1. Откройте приложение в браузере
2. Нажмите "Войти" (Sign In)
3. Должна открыться страница авторизации Google
4. После входа вы будете перенаправлены обратно в приложение

## Troubleshooting

### Ошибка "redirect_uri_mismatch"

- Убедитесь, что URI в Google Console точно совпадает с вашим URL
- Проверьте, что нет лишних пробелов или слэшей
- Для localhost используйте `http://` (не `https://`)

### Ошибка "invalid_client"

- Проверьте, что Client ID и Client Secret скопированы правильно
- Убедитесь, что нет лишних кавычек в .env файле

### Client Secret не работает

- Если вы потеряли Client Secret, создайте новый OAuth Client ID
- Старый Client ID можно удалить или оставить

## Безопасность

⚠️ **Важно:**

- Никогда не коммитьте `.env` файл в Git
- Не делитесь Client Secret публично
- В продакшене используйте переменные окружения вашего хостинга (Vercel, etc.)
