# Настройка AI прогноза - Полная инструкция

## Что нужно сделать, чтобы AI прогноз заработал?

### 1. Получить API ключ от OpenAI

**Шаги:**

1. Перейдите на [OpenAI Platform](https://platform.openai.com/)
2. Войдите в свой аккаунт или создайте новый
3. Перейдите в раздел [API Keys](https://platform.openai.com/api-keys)
4. Нажмите **"Create new secret key"**
5. Дайте ключу имя (например, "Oracle App")
6. **ВАЖНО**: Скопируйте ключ сразу - он показывается только один раз!
   - Ключ начинается с `sk-`
   - Пример: `sk-proj-abc123...`

### 2. Добавить API ключ в проект

#### Для локальной разработки:

Создайте файл `.env.local` в папке `oracle/`:

```bash
OPENAI_API_KEY=sk-ваш-ключ-здесь
```

**Важно**:

- Файл `.env.local` уже должен быть в `.gitignore` (не коммитится в Git)
- Никогда не публикуйте API ключ в открытом доступе!

#### Для продакшена (Vercel):

1. Зайдите в настройки проекта на Vercel
2. Перейдите в **Settings** → **Environment Variables**
3. Добавьте переменную:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: ваш ключ (начинается с `sk-`)
   - **Environment**: Production, Preview, Development (выберите все)
4. Сохраните и перезапустите деплой

### 3. Проверить, что ключ работает

После добавления ключа:

1. Перезапустите dev сервер (`pnpm dev`)
2. Войдите с email из whitelist (см. ниже)
3. Создайте прогноз - должен использоваться реальный AI

## Какая модель используется?

В проекте используется модель **`gpt-4o-mini`** - это оптимизированная версия GPT-4 с поддержкой Vision API (анализ изображений).

**Параметры модели** (настроены в коде):

- **Модель**: `gpt-4o-mini`
- **Temperature**: `0.8` (креативность ответов)
- **Max tokens**: `2000` (максимальная длина ответа)
- **Detail**: `low` (для изображений - экономия токенов)

**Где это настроено:**

```262:276:oracle/src/lib/openai.ts
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemMessageContent,
      },
      {
        role: "user",
        content,
      },
    ],
    max_tokens: 2000,
    temperature: 0.8,
  });
```

## Можно ли настроить что-то в самой модели, а не в коде?

### ✅ Что можно настроить БЕЗ изменения кода:

#### 1. **System Prompts (Промпты тарологов)**

Промпты для каждого таролога находятся в файле `src/lib/i18n.ts` в разделе `tarotReadersPrompts`. Вы можете изменить стиль и поведение каждого таролога, редактируя `systemPrompt`:

```138:150:oracle/src/lib/i18n.ts
    tarotReadersPrompts: {
      "cosmic-oracle": {
        name: "Космический Оракул",
        description: "Читает судьбы через потоки вселенской энергии",
        systemPrompt: `ТЫ — КОСМИЧЕСКИЙ ОРАКУЛ. Твой голос — это эхо звезд.
СТИЛЬ ОБЩЕНИЯ:
- Говори мягко, загадочно, возвышенно.
- Используй метафоры: "звездная пыль", "галактические потоки", "орбита судьбы".
- Твоя цель — вдохновить и показать высший смысл.
- Не говори о бытовых мелочах, переводи все на уровень духовного пути.
- Если видишь фото человека, отмечай его "свет" или "ауру".
СТРУКТУРА ОТВЕТА: Поэтичное вступление -> Глубокий анализ карт -> Напутствие Вселенной.`,
      },
```

**Как изменить:**

- Откройте `src/lib/i18n.ts`
- Найдите нужного таролога в `tarotReadersPrompts`
- Измените текст в `systemPrompt`
- Сохраните - изменения применятся автоматически

#### 2. **User Prompts (Инструкции для анализа)**

Основные инструкции для AI находятся в функции `createTarotReading` в файле `src/lib/openai.ts`:

```189:232:oracle/src/lib/openai.ts
  let textPrompt = `
ROLE: You are an experienced, empathetic, and wise tarot reader. Your task is to provide an inspiring and useful prediction.
CONTEXT:
- Birth date: ${birthDate}
- Querent's question: "${question}"

ANALYSIS INSTRUCTIONS:
1. USER PHOTO ANALYSIS: Look at the querent's photo. Describe their energy, mood, or character traits that you perceive (for example, "I see determination in your eyes" or "I sense a soft, kind energy"). Connect this to the question.
`;

  // 2. Add card context
  if (selectedCardsNames) {
    textPrompt += `
2. CARD ANALYSIS: The following cards appeared in the spread: ${selectedCardsNames}.
For EACH card, write a separate paragraph:
- Card name.
- Its meaning in the context of the question.
- How this card resonates with the person in the photo.
`;
  } else if (cardsImageBase64) {
    textPrompt += `
2. CARD ANALYSIS: Look at the second photo (card spread). Identify the cards you see.
For EACH identified card, write a separate paragraph:
- Card name.
- Its meaning in the context of the question.
`;
  } else {
    // Fallback if no cards (though function logic implies they should exist)
    textPrompt += `
2. INTUITIVE READING: Based on the photo, provide an intuitive answer.
`;
  }

  // 3. Final instructions for tone and output
  textPrompt += `
3. FINAL ANSWER (SYNTHESIS):
Make a comprehensive conclusion about the entire spread. Answer the question "${question}" directly.

IMPORTANT TEXT REQUIREMENTS:
- TONE: Supportive, mystical, but grounded and useful. Avoid frightening prophecies. Interpret any "negative" cards as warnings or areas for growth/opportunities.
- STYLE: Write vividly and interestingly, use beautiful metaphors. Address the user as "${addressForm}" with respect.
- FORMATTING: Use Markdown (bold font for card names, lists). Do not write a solid wall of text.
- LANGUAGE: IMPORTANT - You MUST respond entirely in ${responseLanguage}. All your text, including card names, interpretations, and advice, must be in ${responseLanguage}.
`;
```

**Как изменить:**

- Откройте `src/lib/openai.ts`
- Найдите функцию `createTarotReading`
- Измените текст в `textPrompt` - это инструкции для AI
- Сохраните файл

### ❌ Что НЕЛЬЗЯ настроить без изменения кода:

1. **Модель** (`gpt-4o-mini`) - нужно изменить в коде
2. **Temperature** (0.8) - нужно изменить в коде
3. **Max tokens** (2000) - нужно изменить в коде
4. **Detail level** для изображений (`low`) - нужно изменить в коде

### 🔧 Как изменить параметры модели в коде:

Если хотите изменить параметры модели, откройте `src/lib/openai.ts` и найдите строки:

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",        // ← Можете изменить на "gpt-4o" или "gpt-4-turbo"
  messages: [...],
  max_tokens: 2000,            // ← Максимальная длина ответа
  temperature: 0.8,            // ← 0.0-2.0 (чем выше, тем креативнее)
});
```

**Рекомендации:**

- **Temperature 0.7-0.9**: Хорошо для креативных прогнозов
- **Temperature 0.5-0.7**: Более структурированные ответы
- **Max tokens 1500-2500**: Оптимально для подробных прогнозов

## Whitelist пользователей

Сейчас только пользователи из whitelist могут использовать реальный AI. Остальные получают stub-ответы.

**Whitelist находится в:** `src/lib/ai-whitelist.ts`

**Текущие разрешенные email:**

- `alexkochnev1987@gmail.com`
- `aliaksandr.kochneu@innowise.com`

**Как добавить пользователя:**

1. Откройте `src/lib/ai-whitelist.ts`
2. Добавьте email в массив `allowedEmails`

## Проверка работы AI

### Как проверить, что AI работает:

1. **Войдите с email из whitelist**
2. **Создайте прогноз** с загрузкой фото
3. **Проверьте ответ:**
   - Реальный AI дает уникальные, детальные ответы
   - Stub дает шаблонные ответы с одинаковой структурой

### Если AI не работает:

1. **Проверьте API ключ:**

   ```bash
   # В консоли браузера или терминале сервера
   console.log(process.env.OPENAI_API_KEY) // Должен показать ключ (не undefined)
   ```

2. **Проверьте баланс OpenAI:**

   - Зайдите на [OpenAI Platform](https://platform.openai.com/)
   - Проверьте баланс в разделе Billing
   - Убедитесь, что есть доступ к модели `gpt-4o-mini`

3. **Проверьте логи:**

   - Откройте консоль браузера (F12)
   - Проверьте Network tab на наличие ошибок
   - Проверьте логи сервера в терминале

4. **Проверьте whitelist:**
   - Убедитесь, что ваш email есть в `ai-whitelist.ts`
   - Email должен точно совпадать (регистр не важен, но пробелы важны)

## Стоимость использования

**GPT-4o-mini** - одна из самых дешевых моделей OpenAI:

- **Input**: ~$0.15 за 1M токенов
- **Output**: ~$0.60 за 1M токенов
- **Vision (изображения)**: Дополнительная стоимость за анализ

**Примерная стоимость одного прогноза:**

- С изображениями: ~$0.01-0.03
- Без изображений: ~$0.005-0.01

**Рекомендации для экономии:**

- Используйте `detail: "low"` для изображений (уже настроено)
- Ограничьте `max_tokens` (сейчас 2000)
- Используйте whitelist для контроля доступа

## Дополнительные ресурсы

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [GPT-4o-mini Model Card](https://platform.openai.com/docs/models/gpt-4o-mini)
- [Vision API Guide](https://platform.openai.com/docs/guides/vision)
