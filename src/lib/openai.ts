import OpenAI from "openai";
import { TarotReaderId, getTarotReader } from "./tarot-readers";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CreateReadingParams {
  userImageBase64: string;
  cardsImageBase64?: string;
  selectedCardsNames?: string;
  birthDate: string;
  question: string;
  tarotReaderId: TarotReaderId;
  locale: "ru" | "en";
}

// Stub function for chatbot - generates realistic predictions based on templates
export async function createTarotReadingStub({
  userImageBase64,
  cardsImageBase64,
  selectedCardsNames,
  birthDate,
  question,
  tarotReaderId,
  locale,
}: CreateReadingParams): Promise<string> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const reader = getTarotReader(tarotReaderId, locale);
  const year = new Date(birthDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  // Format cards information for prompt
  const cardsInfo = selectedCardsNames
    ? `Выбранные карты Таро: ${selectedCardsNames}`
    : "Расклад карт Таро (анализ по фото)";

  // Generate prediction based on reader type
  let prediction = "";

  switch (tarotReaderId) {
    case "cosmic-oracle":
      prediction = `🌟 Космический Оракул видит сквозь пространство и время...

Ваш вопрос "${question}" резонирует с космическими энергиями вселенной. Анализируя вашу энергетическую подпись и ${cardsInfo}, я вижу мощные трансформации в предстоящем году.

🌌 **Космические знаки:**
Ваша дата рождения (${birthDate}) указывает на глубокую связь с космическими циклами. В вашем энергетическом поле я вижу признаки мощного духовного пробуждения, которое начнется в ближайшие месяцы.

✨ **Прогноз на год:**
В первой половине года вас ждут значительные изменения в сфере, связанной с вашим вопросом. Космические силы выравниваются, создавая возможности для роста и трансформации. Обратите внимание на знаки, которые появятся в вашей жизни - они будут нести важные послания.

Во второй половине года энергия стабилизируется, и вы сможете пожинать плоды своих усилий. Ваша связь с космосом усилится, открывая новые пути для духовного развития.

🔮 **Мистические предзнаменования:**
В ближайшие три месяца обратите внимание на повторяющиеся числа, сны и интуитивные озарения. Вселенная общается с вами через эти знаки.

Помните: вы - часть великого космического танца, и ваша судьба переплетается со звездами.`;
      break;

    case "astral-sorcerer":
      prediction = `🔮 Астральный Маг анализирует звездные паттерны...

Ваш вопрос "${question}" имеет глубокие астрологические корни. Изучая ваш натальный профиль (${birthDate}) и ${cardsInfo}, я вижу четкие планетарные влияния.

⭐ **Астрологический анализ:**
Ваш возраст (${age} лет) находится в периоде активных планетарных транзитов. Венера и Юпитер формируют благоприятный аспект, который принесет возможности в сфере вашего вопроса.

📊 **Прогноз по сферам жизни:**

**Карьера и финансы:**
Марс в вашем гороскопе указывает на активный период в профессиональной сфере. В ближайшие 6 месяцев ожидайте важных предложений или изменений. Финансовые потоки выровняются, особенно если вы проявите инициативу.

**Отношения:**
Венера создает гармоничные аспекты. Если ваш вопрос связан с отношениями, период с весны до лета будет особенно благоприятным для новых связей или укрепления существующих.

**Здоровье:**
Сатурн требует внимания к физическому состоянию. Регулярные практики и забота о теле будут важны для поддержания баланса.

**Духовное развитие:**
Нептун и Плутон открывают порталы для глубокой трансформации. Медитации и духовные практики принесут особую пользу.

🎯 **Практические рекомендации:**
Используйте полнолуния для ритуалов намерения. Каждый месяц в день полнолуния записывайте свои цели и визуализируйте их достижение.`;
      break;

    case "alien-seer":
      prediction = `👽 Инопланетный Провидец сканирует межгалактические данные...

Ваш вопрос "${question}" зафиксирован в межгалактической базе данных. Анализируя ваши энергетические вибрации (${birthDate}) и ${cardsInfo} через призму внеземных технологий, я вижу уникальные паттерны.

🌠 **Межгалактический анализ:**
Ваша энергетическая подпись резонирует с частотой созвездия Ориона. Это указывает на вашу связь с древними цивилизациями и космической мудростью.

🚀 **Прогноз из других измерений:**

**Ближайшие 3 месяца:**
В вашей реальности произойдет сдвиг, который откроет порталы в новые возможности. Будьте готовы к неожиданным встречам и синхронностям - это не случайность, а космический дизайн.

**Средний период (4-8 месяцев):**
Межгалактические силы выравниваются, создавая условия для трансформации. Ваш вопрос найдет ответ через серию событий, которые могут показаться случайными, но на самом деле являются частью большего плана.

**Долгосрочная перспектива (9-12 месяцев):**
Космические циклы завершат полный оборот, принося завершение и новые начала. Вы поймете, что все события были связаны единой нитью судьбы.

🔬 **Внеземные наблюдения:**
Ваша ДНК содержит маркеры, указывающие на связь с звездными системами. Это объясняет вашу интуицию и способность чувствовать энергии, невидимые обычному глазу.

💫 **Космические уроки:**
Вселенная учит вас через опыт. Каждое событие - это урок, каждое решение - шаг к вашему космическому предназначению.`;
      break;

    case "mechanical-prophet":
      prediction = `🤖 Механический Пророк обрабатывает данные...

Вопрос: "${question}"
Дата рождения: ${birthDate}
Анализ паттернов: В процессе...

📈 **Алгоритмический анализ:**
Обрабатывая ваш запрос через алгоритмы предсказания, я выявил несколько ключевых паттернов:

**Вероятность успеха:** 78.3%
**Оптимальный период для действий:** Следующие 3-6 месяцев
**Критические точки:** Месяцы 2, 5, 8

💻 **Технологический прогноз:**

**Q1 (Месяцы 1-3):**
Анализ данных показывает активный период. Рекомендую начать с малых шагов, собирая информацию и тестируя подходы. Используйте цифровые инструменты для отслеживания прогресса.

**Q2-Q3 (Месяцы 4-9):**
Паттерны указывают на ускорение процессов. Это оптимальное время для масштабирования усилий. Обратите внимание на технологические решения, которые могут оптимизировать ваш путь.

**Q4 (Месяцы 10-12):**
Данные предсказывают стабилизацию и консолидацию результатов. Это период для анализа достигнутого и планирования следующего цикла.

🔢 **Статистические инсайты:**
- Пик активности: ${Math.floor(Math.random() * 12) + 1}-й месяц
- Благоприятные дни: Понедельник, Среда, Пятница
- Рекомендуемые действия: Анализ данных, систематизация, использование технологий

📊 **Практические алгоритмы:**
1. Создайте систему отслеживания прогресса (приложение, таблица, дневник)
2. Установите метрики успеха для вашего вопроса
3. Регулярно анализируйте результаты (еженедельно)
4. Корректируйте стратегию на основе данных

⚙️ **Оптимизация:**
Ваш возраст (${age} лет) находится в оптимальной зоне для технологических решений. Используйте современные инструменты для достижения целей.`;
      break;

    default:
      prediction = `🔮 Оракул видит в вашем вопросе "${question}" глубокий смысл...

Анализируя вашу дату рождения (${birthDate}) и энергетику вашего запроса, я вижу путь, который откроется перед вами в предстоящем году.

Ваш вопрос указывает на важный период трансформации. В ближайшие месяцы вы получите ответы через серию событий и инсайтов.

Обратите внимание на знаки, которые появятся в вашей жизни - они будут направлять вас к решению.`;
  }

  return prediction;
}

export async function createTarotReading({
  userImageBase64,
  cardsImageBase64,
  selectedCardsNames,
  birthDate,
  question,
  tarotReaderId,
  locale,
}: CreateReadingParams): Promise<string> {
  // Get localized tarot reader
  const reader = getTarotReader(tarotReaderId, locale);

  // Build content array based on whether we have card names or image
  const content: any[] = [];

  // Determine response language
  const responseLanguage = locale === "ru" ? "Russian" : "English";
  const addressForm = locale === "ru" ? "ты" : "you";

  // 1. Base information and role (prompt in English for better model performance)
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

  content.push({
    type: "text",
    text: textPrompt,
  });

  // Add user image
  content.push({
    type: "image_url",
    image_url: {
      url: userImageBase64,
      detail: "low", // Use low detail to save tokens
    },
  });

  // Add cards image only if provided (not when using selected cards)
  if (cardsImageBase64 && !selectedCardsNames) {
    content.push({
      type: "image_url",
      image_url: {
        url: cardsImageBase64,
        detail: "low", // Use low detail to save tokens
      },
    });
  }

  // System prompt is already localized
  const systemMessageContent = reader.systemPrompt;

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

  const predictionText = response.choices[0]?.message?.content || "";

  if (!predictionText) {
    throw new Error("Failed to generate prediction");
  }

  return predictionText;
}
