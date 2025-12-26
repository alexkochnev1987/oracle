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
      uploadCardsPhoto: "Загрузите фото расклада карт",
      birthDate: "Дата рождения",
      question: "Ваш вопрос",
      questionPlaceholder: "Что меня ждет в новом году?",
      selectTarotReader: "Выберите таролога",
      createReading: "Создать прогноз",
      loading: "Анализирую ваши карты...",
      readingCreated: "Прогноз создан!",
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
        description: "Уникальный прогноз на основе вашей фотографии и энергетики",
      },
      tarot: {
        title: "Карты Таро",
        description: "Глубокий анализ расклада карт от профессиональных тарологов",
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
      signInDescription: "Войдите с помощью вашего аккаунта Google, чтобы продолжить",
      signInWithGoogle: "Войти через Google",
    },
    // Readings
    readings: {
      emptyTitle: "Пока нет прогнозов",
      emptyDescription: "Создайте свой первый прогноз, чтобы увидеть его здесь",
      goToDashboard: "Перейти в дашборд",
      yourReading: "Ваш прогноз",
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
      uploadCardsPhoto: "Upload Tarot cards photo",
      birthDate: "Birth Date",
      question: "Your question",
      questionPlaceholder: "What awaits me in the new year?",
      selectTarotReader: "Select Tarot Reader",
      createReading: "Create Reading",
      loading: "Analyzing your cards...",
      readingCreated: "Reading created!",
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
        description: "Deep analysis of card spreads by professional tarot readers",
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
  },
} as const;

export function getTranslations(locale: Locale) {
  return translations[locale];
}

export type TranslationKey = keyof typeof translations.ru;
