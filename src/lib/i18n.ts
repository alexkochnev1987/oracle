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
      description: "Персонализированное гадание на основе вашей фотографии и расклада карт Таро",
    },
    // Dashboard
    dashboard: {
      title: "Создать прогноз",
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
        description: "Глубокий мистический анализ с акцентом на духовное развитие",
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
  },
  en: {
    // Landing Page
    landing: {
      title: "New Year Fortune Telling",
      subtitle: "Discover what awaits you in the next year",
      cta: "Start Reading",
      description: "Personalized fortune telling based on your photo and Tarot card spread",
    },
    // Dashboard
    dashboard: {
      title: "Create Reading",
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
        description: "Deep mystical analysis with focus on spiritual development",
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
  },
} as const;

export function getTranslations(locale: Locale) {
  return translations[locale];
}

export type TranslationKey = keyof typeof translations.ru;

