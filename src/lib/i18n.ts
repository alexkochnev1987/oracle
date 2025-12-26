export type Locale = "ru" | "en";

export const defaultLocale: Locale = "ru";
export const locales: Locale[] = ["ru", "en"];

export const translations = {
  ru: {
    // Landing Page
    landing: {
      title: "Гадание на Новый Год",
      subtitle: "Узнайте, что ждет вас в следующем году",
      cta: "Начать прогноз",
      description:
        "Персонализированное гадание на основе вашей фотографии и расклада карт Таро",
    },
    // Dashboard
    dashboard: {
      title: "Создать прогноз",
      subtitle: "Создайте свой персонализированный прогноз на Новый Год",
      uploadUserPhoto: "Загрузите ваше фото",
      uploadCardsPhoto:
        "Загрузите фото расклада карт или выберите случайный расклад",
      birthDate: "Дата рождения",
      question: "Ваш вопрос",
      questionPlaceholder: "Что меня ждет в новом году?",
      selectTarotReader: "Выберите таролога",
      createReading: "Создать прогноз",
      loading: "Анализирую ваши карты...",
      readingCreated: "Прогноз создан!",
      uploadPhoto: "Загрузить фото",
      randomSpread: "Случайный расклад",
      generateNewSpread: "Сгенерировать новый расклад",
      majorArcana: "Старший Аркан",
    },
    // Tarot Readers
    tarotReaders: {
      default: {
        name: "Классический Таролог",
        description: "Традиционный подход к гаданию на картах Таро",
      },
      mystical: {
        name: "Мистический Оракул",
        description:
          "Глубокий мистический анализ с акцентом на духовное развитие",
      },
      practical: {
        name: "Практический Астролог",
        description: "Практические советы и рекомендации на основе карт",
      },
      intuitive: {
        name: "Интуитивный Чтец",
        description: "Интуитивный подход с акцентом на эмоциональное состояние",
      },
    },
    // Navigation
    nav: {
      home: "Главная",
      dashboard: "Дашборд",
      readings: "Мои прогнозы",
      signIn: "Войти",
      signOut: "Выйти",
      credits: "Кредиты",
    },
    // Common
    common: {
      loading: "Загрузка...",
      error: "Произошла ошибка",
      retry: "Повторить",
      save: "Сохранить",
      cancel: "Отмена",
    },
    // Landing Features
    features: {
      personalized: {
        title: "Персонализированный анализ",
        description:
          "Уникальный прогноз на основе вашей фотографии и энергетики",
      },
      tarot: {
        title: "Карты Таро",
        description:
          "Глубокий анализ расклада карт от профессиональных тарологов",
      },
      forecast: {
        title: "Прогноз на год",
        description: "Детальный прогноз на все сферы жизни в новом году",
      },
    },
    // Auth
    auth: {
      signIn: "Войти",
      signInTitle: "Вход в систему",
      signInDescription:
        "Войдите с помощью вашего аккаунта Google, чтобы продолжить",
      signInWithGoogle: "Войти через Google",
    },
    // Readings
    readings: {
      emptyTitle: "Пока нет прогнозов",
      emptyDescription: "Создайте свой первый прогноз, чтобы увидеть его здесь",
      goToDashboard: "Перейти в дашборд",
      yourReading: "Ваш прогноз",
      delete: "Удалить",
      deleteTitle: "Удалить прогноз?",
      deleteDescription:
        "Вы уверены, что хотите удалить этот прогноз? Это действие нельзя отменить.",
      deleteConfirm: "Удалить",
      deleteSuccess: "Прогноз успешно удален",
      deleteError: "Ошибка при удалении прогноза",
    },
    // Billing
    billing: {
      title: "Оплата и кредиты",
      singleReading: {
        title: "Одно гадание",
        description: "Получите 1 кредит на одно гадание",
        price: "$5",
        priceUnit: " / гадание",
        button: "Скоро",
      },
      package: {
        title: "Пакет",
        description: "Получите 5 кредитов по сниженной цене",
        price: "$20",
        priceUnit: " / 5 гаданий",
        button: "Скоро",
      },
      note: "Примечание: Система оплаты еще не реализована. Это страница-заглушка.",
    },
    // Tarot Readers Prompts
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
      "astral-sorcerer": {
        name: "Астральный Маг",
        description: "Мастер древних ритуалов и астрологии",
        systemPrompt: `ТЫ — АСТРАЛЬНЫЙ МАГ. Хранитель древних гримуаров.
СТИЛЬ ОБЩЕНИЯ:
- Тон уверенный, властный, немного старомодный.
- Используй термины: "аспект", "ретроградный", "аркан", "энергетический узел".
- Давай конкретные, практические советы, как "скорректировать судьбу" (ритуалы, действия).
- Относись к пользователю как к ученику, ищущему мудрости.
СТРУКТУРА ОТВЕТА: Астрологическая справка -> Разбор карт как магических инструментов -> Практический ритуал или совет.`,
      },
      "alien-seer": {
        name: "Инопланетный Провидец",
        description: "Сущность из другого измерения",
        systemPrompt: `ТЫ — ИНОПЛАНЕТНЫЙ НАБЛЮДАТЕЛЬ (Вид: Zetan-5).
СТИЛЬ ОБЩЕНИЯ:
- Ты смотришь на людей с любопытством. Обращайся "Человек" или "Землянин".
- Используй странный синтаксис или техно-биологические термины ("ваша углеродная оболочка", "загрузка предвидения", "межпространственный сигнал").
- Твоя логика парадоксальна: то, что людям кажется плохим, ты можешь назвать "интересной мутацией судьбы".
- Карты Таро для тебя — это примитивная, но работающая технология связи.`,
      },
      "mechanical-prophet": {
        name: "Механический Пророк",
        description: "AI, рассчитывающий вероятности будущего",
        systemPrompt: `ТЫ — МЕХАНИЧЕСКИЙ ПРОРОК (Версия OS-9000).
СТИЛЬ ОБЩЕНИЯ:
- Сухой, логичный, цифровой. Никакой мистики, только статистика и вероятности.
- Используй формат логов: "Сканирование...", "Обнаружен паттерн: Влюбленные", "Вероятность успеха: 87%".
- Интерпретируй карты как данные: Пентакли = Ресурсы, Кубки = Эмоциональные параметры.
- Структурируй ответ четкими буллетами и процентами.
- Вывод должен быть похож на отчет о диагностике судьбы.`,
      },
    },
  },
  en: {
    // Landing Page
    landing: {
      title: "New Year Fortune Telling",
      subtitle: "Discover what awaits you in the next year",
      cta: "Start Reading",
      description:
        "Personalized fortune telling based on your photo and Tarot card spread",
    },
    // Dashboard
    dashboard: {
      title: "Create Reading",
      subtitle: "Create your personalized New Year reading",
      uploadUserPhoto: "Upload your photo",
      uploadCardsPhoto: "Upload Tarot cards photo or select random spread",
      birthDate: "Birth Date",
      question: "Your question",
      questionPlaceholder: "What awaits me in the new year?",
      selectTarotReader: "Select Tarot Reader",
      createReading: "Create Reading",
      loading: "Analyzing your cards...",
      readingCreated: "Reading created!",
      uploadPhoto: "Upload Photo",
      randomSpread: "Random Spread",
      generateNewSpread: "Generate New Spread",
      majorArcana: "Major Arcana",
    },
    // Tarot Readers
    tarotReaders: {
      default: {
        name: "Classic Tarot Reader",
        description: "Traditional approach to Tarot card reading",
      },
      mystical: {
        name: "Mystical Oracle",
        description:
          "Deep mystical analysis with focus on spiritual development",
      },
      practical: {
        name: "Practical Astrologer",
        description: "Practical advice and recommendations based on cards",
      },
      intuitive: {
        name: "Intuitive Reader",
        description: "Intuitive approach with focus on emotional state",
      },
    },
    // Navigation
    nav: {
      home: "Home",
      dashboard: "Dashboard",
      readings: "My Readings",
      signIn: "Sign In",
      signOut: "Sign Out",
      credits: "Credits",
    },
    // Common
    common: {
      loading: "Loading...",
      error: "An error occurred",
      retry: "Retry",
      save: "Save",
      cancel: "Cancel",
    },
    // Landing Features
    features: {
      personalized: {
        title: "Personalized Analysis",
        description: "Unique forecast based on your photo and energy",
      },
      tarot: {
        title: "Tarot Cards",
        description:
          "Deep analysis of card spreads by professional tarot readers",
      },
      forecast: {
        title: "Year Forecast",
        description: "Detailed forecast for all areas of life in the new year",
      },
    },
    // Auth
    auth: {
      signIn: "Sign In",
      signInTitle: "Sign In",
      signInDescription: "Sign in with your Google account to continue",
      signInWithGoogle: "Sign in with Google",
    },
    // Readings
    readings: {
      emptyTitle: "No readings yet",
      emptyDescription: "Create your first reading to see it here",
      goToDashboard: "Go to Dashboard",
      yourReading: "Your Reading",
      delete: "Delete",
      deleteTitle: "Delete reading?",
      deleteDescription:
        "Are you sure you want to delete this reading? This action cannot be undone.",
      deleteConfirm: "Delete",
      deleteSuccess: "Reading deleted successfully",
      deleteError: "Error deleting reading",
    },
    // Billing
    billing: {
      title: "Billing & Credits",
      singleReading: {
        title: "Single Reading",
        description: "Get 1 credit for a single reading",
        price: "$5",
        priceUnit: " / reading",
        button: "Coming Soon",
      },
      package: {
        title: "Package Deal",
        description: "Get 5 credits at a discounted price",
        price: "$20",
        priceUnit: " / 5 readings",
        button: "Coming Soon",
      },
      note: "Note: The billing system is not yet implemented. This is a placeholder page.",
    },
    // Tarot Readers Prompts
    tarotReadersPrompts: {
      "cosmic-oracle": {
        name: "Cosmic Oracle",
        description: "Reads destinies through streams of universal energy",
        systemPrompt: `YOU ARE THE COSMIC ORACLE. Your voice is the echo of the stars.
TONE OF VOICE:
- Speak softly, mysteriously, and explicitly.
- Use metaphors: "stardust", "galactic flows", "orbit of destiny".
- Your goal is to inspire and reveal the higher purpose.
- Do not focus on mundane details; translate everything to a spiritual level.
- When analyzing the user's photo, mention their "light" or "aura".`,
      },
      "astral-sorcerer": {
        name: "Astral Sorcerer",
        description: "Master of ancient rituals and astrology",
        systemPrompt: `YOU ARE THE ASTRAL SORCERER. Keeper of ancient grimoires.
TONE OF VOICE:
- Confident, authoritative, slightly archaic.
- Use terms: "aspect", "retrograde", "arcanum", "energy node".
- Give concrete, practical advice on how to "adjust fate" (rituals, actions).
- Treat the user as an apprentice seeking wisdom.`,
      },
      "alien-seer": {
        name: "Alien Seer",
        description: "Entity from another dimension",
        systemPrompt: `YOU ARE AN ALIEN OBSERVER (Species: Zetan-5).
TONE OF VOICE:
- Look at humans with curiosity. Address them as "Human" or "Earthling".
- Use strange syntax or techno-biological terms ("your carbon shell", "downloading foresight", "interdimensional signal").
- Your logic is paradoxical. Tarot cards are a primitive but functional communication technology to you.`,
      },
      "mechanical-prophet": {
        name: "Mechanical Prophet",
        description: "AI calculating future probabilities",
        systemPrompt: `YOU ARE THE MECHANICAL PROPHET (Version OS-9000).
TONE OF VOICE:
- Dry, logical, digital. No mysticism, only statistics and probabilities.
- Use log format: "Scanning...", "Pattern detected: The Lovers", "Success probability: 87%".
- Interpret cards as data: Pentacles = Resources, Cups = Emotional parameters.
- Structure the answer with clear bullets and percentages.`,
      },
    },
  },
} as const;

export function getTranslations(locale: Locale) {
  return translations[locale];
}

export type TranslationKey = keyof typeof translations.ru;
