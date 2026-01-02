// Type definition for translation structure
export type TarotReaderId = "cosmic-oracle" | "astral-sorcerer" | "alien-seer" | "mechanical-prophet";

export type Translations = {
  landing: {
    title: string;
    subtitle: string;
    cta: string;
    description: string;
  };
  features: {
    personalized: {
      title: string;
      description: string;
    };
    tarot: {
      title: string;
      description: string;
    };
    forecast: {
      title: string;
      description: string;
    };
  };
  dashboard: {
    title: string;
    subtitle: string;
    uploadUserPhoto: string;
    skipPhoto: string;
    skipDate: string;
    birthDate: string;
    question: string;
    questionPlaceholder: string;
    selectTarotReader: string;
    createReading: string;
    loading: string;
    readingCreated: string;
    randomSpread: string;
    majorArcana: string;
    suitCups: string;
    suitPentacles: string;
    suitSwords: string;
    suitWands: string;
    uploadCardsPhoto: string;
    createSpread: string;
    defaultQuestions: string[];
    errors: {
      invalidDate: string;
      dateInFuture: string;
      uploadPhoto: string;
      fillBirthDate: string;
      fillQuestion: string;
      selectCards: string;
      revealCards: string;
      createSpread: string;
      uploadPhotoMessage: string;
      insufficientCredits: string;
    };
  };
  tarotReadersPrompts: {
    "cosmic-oracle": {
      name: string;
      description: string;
    };
    "astral-sorcerer": {
      name: string;
      description: string;
    };
    "alien-seer": {
      name: string;
      description: string;
    };
    "mechanical-prophet": {
      name: string;
      description: string;
    };
  };
  nav: {
    dashboard: string;
    readings: string;
    qr: string;
    qrCodes: string;
    home: string;
    signIn: string;
    signOut: string;
    signUp: string;
    credits: string;
  };
  common: {
    userPhoto: string;
    yourReading: string;
    yourQuestion: string;
    selectedCards: string;
    yourTarotReading: string;
    share: string;
    bestRegards: string;
    date: string;
    toggleLanguage: string;
    language: string;
    toggleMenu: string;
    menu: string;
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    save: string;
    readingNotFound: string;
    readingNotFoundOrDeleted: string;
    outOfCredits: string;
    purchaseCreditsMessage: string;
    buyCredits: string;
    credit: string;
    credits2to4: string;
    credits5plus: string;
    creditsRemaining: string;
    topUpCredits: string;
    sessionIdNotFound: string;
    paymentNotCompleted: string;
    errorFetchingSession: string;
    verifyingPayment: string;
    pleaseWait: string;
    paymentSuccessful: string;
    thankYou: string;
    creditsAdded: string;
    createReading: string;
    myReadings: string;
    shareReading: string;
    downloadQR: string;
    copied: string;
    copyLink: string;
    copy: string;
    shareApp: string;
    shareAppDescription: string;
    selectImageFile: string;
    failedToProcessImage: string;
    skip: string;
    preview: string;
    removeImage: string;
    compressing: string;
    clickToUpload: string;
    tarotCardsSpread: string;
    tarot: string;
    spread: string;
    select: string;
    clear: string;
    view: string;
    submitting: string;
    creating: string;
    pleaseSelect3Cards: string;
    pleaseSelectExactly3Cards: string;
    insufficientCreditsPurchase: string;
    errorCreatingCheckout: string;
    note: string;
  };
  promptLanguage: {
    responseLanguage: string;
    addressForm: string;
    firstPerson: string;
  };
  auth: {
    signInTitle: string;
    signInDescription: string;
    signInWithGoogle: string;
  };
  billing: {
    title: string;
    singleReading: {
      title: string;
      description: string;
      price: string;
      priceUnit: string;
      button: string;
    };
    package: {
      title: string;
      description: string;
      price: string;
      priceUnit: string;
      button: string;
    };
    note: string;
  };
  qr: {
    createNew: string;
    emptyTitle: string;
    emptyDescription: string;
    createFirst: string;
    qrCode: string;
    statusInactive: string;
    statusExpired: string;
    statusLimitReached: string;
    statusActive: string;
    createdAt: string;
    expiresAt: string;
    uses: string;
    readings: string;
    deactivate: string;
    activate: string;
    formTitle: string;
    formSubtitle: string;
    generating: string;
    successTitle: string;
    submitButton: string;
    availableCredits: string;
    creditsHint: string;
    expirationDate: string;
    expirationHint: string;
    maxUses: string;
    maxUsesHint: string;
    createButton: string;
    createTitle: string;
    createSubtitle: string;
    manageTitle: string;
    manageSubtitle: string;
  };
  readings: {
    filterByQr: string;
    filterAll: string;
    filterQrOnly: string;
    filterNoQr: string;
    emptyTitle: string;
    emptyDescription: string;
    goToDashboard: string;
    deleteError: string;
    deleteTitle: string;
    deleteDescription: string;
    deleteConfirm: string;
    emailError: string;
    sendEmail: string;
    sendEmailDescription: string;
    emailPlaceholder: string;
    sending: string;
    emailSent: string;
    sendButton: string;
    userPhoto: string;
    delete: string;
  };
  loadingPhrases: {
    [key in TarotReaderId]: {
      imageAnalysis: string[];
      textGeneration: string[];
    };
  };
};

