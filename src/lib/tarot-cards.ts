export interface TarotCard {
  id: string;
  name: { ru: string; en: string };
  arcana: "major" | "minor";
  suit?: "cups" | "pentacles" | "swords" | "wands";
  number?: number;
  imageUrl?: string;
}

// Major Arcana (22 cards)
const majorArcana: TarotCard[] = [
  {
    id: "major-0",
    name: { ru: "Шут", en: "The Fool" },
    arcana: "major",
    number: 0,
    imageUrl: "/tarot/fool.png",
  },
  {
    id: "major-1",
    name: { ru: "Маг", en: "The Magician" },
    arcana: "major",
    number: 1,
    imageUrl: "/tarot/magician.png",
  },
  {
    id: "major-2",
    name: { ru: "Верховная Жрица", en: "The High Priestess" },
    arcana: "major",
    number: 2,
    imageUrl: "/tarot/high-priestess.png",
  },
  {
    id: "major-3",
    name: { ru: "Императрица", en: "The Empress" },
    arcana: "major",
    number: 3,
    imageUrl: "/tarot/empress.png",
  },
  {
    id: "major-4",
    name: { ru: "Император", en: "The Emperor" },
    arcana: "major",
    number: 4,
    imageUrl: "/tarot/imperor.png",
  },
  {
    id: "major-5",
    name: { ru: "Иерофант", en: "The Hierophant" },
    arcana: "major",
    number: 5,
    imageUrl: "/tarot/hierophant.png",
  },
  {
    id: "major-6",
    name: { ru: "Влюбленные", en: "The Lovers" },
    arcana: "major",
    number: 6,
    imageUrl: "/tarot/lovers.png",
  },
  {
    id: "major-7",
    name: { ru: "Колесница", en: "The Chariot" },
    arcana: "major",
    number: 7,
    imageUrl: "/tarot/chariot.png",
  },
  {
    id: "major-8",
    name: { ru: "Сила", en: "Strength" },
    arcana: "major",
    number: 8,
    imageUrl: "/tarot/strength.png",
  },
  {
    id: "major-9",
    name: { ru: "Отшельник", en: "The Hermit" },
    arcana: "major",
    number: 9,
    imageUrl: "/tarot/hermit.png",
  },
  {
    id: "major-10",
    name: { ru: "Колесо Фортуны", en: "Wheel of Fortune" },
    arcana: "major",
    number: 10,
    imageUrl: "/tarot/wheel-of-fortune.png",
  },
  {
    id: "major-11",
    name: { ru: "Справедливость", en: "Justice" },
    arcana: "major",
    number: 11,
    imageUrl: "/tarot/justice.png",
  },
  {
    id: "major-12",
    name: { ru: "Повешенный", en: "The Hanged Man" },
    arcana: "major",
    number: 12,
    imageUrl: "/tarot/hanged-man.png",
  },
  {
    id: "major-13",
    name: { ru: "Смерть", en: "Death" },
    arcana: "major",
    number: 13,
    imageUrl: "/tarot/death.png",
  },
  {
    id: "major-14",
    name: { ru: "Умеренность", en: "Temperance" },
    arcana: "major",
    number: 14,
  },
  {
    id: "major-15",
    name: { ru: "Дьявол", en: "The Devil" },
    arcana: "major",
    number: 15,
  },
  {
    id: "major-16",
    name: { ru: "Башня", en: "The Tower" },
    arcana: "major",
    number: 16,
  },
  {
    id: "major-17",
    name: { ru: "Звезда", en: "The Star" },
    arcana: "major",
    number: 17,
    imageUrl: "/tarot/star.png",
  },
  {
    id: "major-18",
    name: { ru: "Луна", en: "The Moon" },
    arcana: "major",
    number: 18,
  },
  {
    id: "major-19",
    name: { ru: "Солнце", en: "The Sun" },
    arcana: "major",
    number: 19,
    imageUrl: "/tarot/sun.png",
  },
  {
    id: "major-20",
    name: { ru: "Суд", en: "Judgement" },
    arcana: "major",
    number: 20,
    imageUrl: "/tarot/judgement.png",
  },
  {
    id: "major-21",
    name: { ru: "Мир", en: "The World" },
    arcana: "major",
    number: 21,
  },
];

// Minor Arcana helpers
const createMinorArcanaCard = (
  suit: "cups" | "pentacles" | "swords" | "wands",
  number: number,
  nameRu: string,
  nameEn: string
): TarotCard => ({
  id: `minor-${suit}-${number}`,
  name: { ru: nameRu, en: nameEn },
  arcana: "minor",
  suit,
  number,
});

// Cups (Кубки)
const cupsCards: TarotCard[] = [
  {
    ...createMinorArcanaCard("cups", 1, "Туз Кубков", "Ace of Cups"),
    imageUrl: "/tarot/cups/ace.png",
  },
  {
    ...createMinorArcanaCard("cups", 2, "Двойка Кубков", "Two of Cups"),
    imageUrl: "/tarot/cups/two.png",
  },
  {
    ...createMinorArcanaCard("cups", 3, "Тройка Кубков", "Three of Cups"),
    imageUrl: "/tarot/cups/three.png",
  },
  {
    ...createMinorArcanaCard("cups", 4, "Четверка Кубков", "Four of Cups"),
    imageUrl: "/tarot/cups/four.png",
  },
  {
    ...createMinorArcanaCard("cups", 5, "Пятерка Кубков", "Five of Cups"),
    imageUrl: "/tarot/cups/five.png",
  },
  {
    ...createMinorArcanaCard("cups", 6, "Шестерка Кубков", "Six of Cups"),
    imageUrl: "/tarot/cups/six.png",
  },
  {
    ...createMinorArcanaCard("cups", 7, "Семерка Кубков", "Seven of Cups"),
    imageUrl: "/tarot/cups/seven.png",
  },
  {
    ...createMinorArcanaCard("cups", 8, "Восьмерка Кубков", "Eight of Cups"),
    imageUrl: "/tarot/cups/eight.png",
  },
  {
    ...createMinorArcanaCard("cups", 9, "Девятка Кубков", "Nine of Cups"),
    imageUrl: "/tarot/cups/nine.png",
  },
  {
    ...createMinorArcanaCard("cups", 10, "Десятка Кубков", "Ten of Cups"),
    imageUrl: "/tarot/cups/ten.png",
  },
  {
    ...createMinorArcanaCard("cups", 11, "Паж Кубков", "Page of Cups"),
    imageUrl: "/tarot/cups/page.png",
  },
  createMinorArcanaCard("cups", 12, "Рыцарь Кубков", "Knight of Cups"),
  createMinorArcanaCard("cups", 13, "Королева Кубков", "Queen of Cups"),
  createMinorArcanaCard("cups", 14, "Король Кубков", "King of Cups"),
];

// Pentacles (Пентакли/Монеты)
const pentaclesCards: TarotCard[] = [
  createMinorArcanaCard("pentacles", 1, "Туз Пентаклей", "Ace of Pentacles"),
  createMinorArcanaCard("pentacles", 2, "Двойка Пентаклей", "Two of Pentacles"),
  createMinorArcanaCard(
    "pentacles",
    3,
    "Тройка Пентаклей",
    "Three of Pentacles"
  ),
  createMinorArcanaCard(
    "pentacles",
    4,
    "Четверка Пентаклей",
    "Four of Pentacles"
  ),
  createMinorArcanaCard(
    "pentacles",
    5,
    "Пятерка Пентаклей",
    "Five of Pentacles"
  ),
  createMinorArcanaCard(
    "pentacles",
    6,
    "Шестерка Пентаклей",
    "Six of Pentacles"
  ),
  createMinorArcanaCard(
    "pentacles",
    7,
    "Семерка Пентаклей",
    "Seven of Pentacles"
  ),
  createMinorArcanaCard(
    "pentacles",
    8,
    "Восьмерка Пентаклей",
    "Eight of Pentacles"
  ),
  createMinorArcanaCard(
    "pentacles",
    9,
    "Девятка Пентаклей",
    "Nine of Pentacles"
  ),
  createMinorArcanaCard(
    "pentacles",
    10,
    "Десятка Пентаклей",
    "Ten of Pentacles"
  ),
  createMinorArcanaCard("pentacles", 11, "Паж Пентаклей", "Page of Pentacles"),
  createMinorArcanaCard(
    "pentacles",
    12,
    "Рыцарь Пентаклей",
    "Knight of Pentacles"
  ),
  createMinorArcanaCard(
    "pentacles",
    13,
    "Королева Пентаклей",
    "Queen of Pentacles"
  ),
  createMinorArcanaCard(
    "pentacles",
    14,
    "Король Пентаклей",
    "King of Pentacles"
  ),
];

// Swords (Мечи)
const swordsCards: TarotCard[] = [
  createMinorArcanaCard("swords", 1, "Туз Мечей", "Ace of Swords"),
  createMinorArcanaCard("swords", 2, "Двойка Мечей", "Two of Swords"),
  createMinorArcanaCard("swords", 3, "Тройка Мечей", "Three of Swords"),
  createMinorArcanaCard("swords", 4, "Четверка Мечей", "Four of Swords"),
  createMinorArcanaCard("swords", 5, "Пятерка Мечей", "Five of Swords"),
  createMinorArcanaCard("swords", 6, "Шестерка Мечей", "Six of Swords"),
  createMinorArcanaCard("swords", 7, "Семерка Мечей", "Seven of Swords"),
  createMinorArcanaCard("swords", 8, "Восьмерка Мечей", "Eight of Swords"),
  createMinorArcanaCard("swords", 9, "Девятка Мечей", "Nine of Swords"),
  createMinorArcanaCard("swords", 10, "Десятка Мечей", "Ten of Swords"),
  createMinorArcanaCard("swords", 11, "Паж Мечей", "Page of Swords"),
  createMinorArcanaCard("swords", 12, "Рыцарь Мечей", "Knight of Swords"),
  createMinorArcanaCard("swords", 13, "Королева Мечей", "Queen of Swords"),
  createMinorArcanaCard("swords", 14, "Король Мечей", "King of Swords"),
];

// Wands (Жезлы/Посохи)
const wandsCards: TarotCard[] = [
  createMinorArcanaCard("wands", 1, "Туз Жезлов", "Ace of Wands"),
  createMinorArcanaCard("wands", 2, "Двойка Жезлов", "Two of Wands"),
  createMinorArcanaCard("wands", 3, "Тройка Жезлов", "Three of Wands"),
  createMinorArcanaCard("wands", 4, "Четверка Жезлов", "Four of Wands"),
  createMinorArcanaCard("wands", 5, "Пятерка Жезлов", "Five of Wands"),
  createMinorArcanaCard("wands", 6, "Шестерка Жезлов", "Six of Wands"),
  createMinorArcanaCard("wands", 7, "Семерка Жезлов", "Seven of Wands"),
  createMinorArcanaCard("wands", 8, "Восьмерка Жезлов", "Eight of Wands"),
  createMinorArcanaCard("wands", 9, "Девятка Жезлов", "Nine of Wands"),
  createMinorArcanaCard("wands", 10, "Десятка Жезлов", "Ten of Wands"),
  createMinorArcanaCard("wands", 11, "Паж Жезлов", "Page of Wands"),
  createMinorArcanaCard("wands", 12, "Рыцарь Жезлов", "Knight of Wands"),
  createMinorArcanaCard("wands", 13, "Королева Жезлов", "Queen of Wands"),
  createMinorArcanaCard("wands", 14, "Король Жезлов", "King of Wands"),
];

// All 78 tarot cards
export const allTarotCards: TarotCard[] = [
  ...majorArcana,
  ...cupsCards,
  ...pentaclesCards,
  ...swordsCards,
  ...wandsCards,
];

/**
 * Get a random spread of unique tarot cards
 * Uses cryptographically secure random number generation
 */
export function getRandomSpread(count: number = 6): TarotCard[] {
  if (count > allTarotCards.length) {
    throw new Error(`Cannot select more than ${allTarotCards.length} cards`);
  }

  const availableCards = [...allTarotCards];
  const selectedCards: TarotCard[] = [];

  // Use crypto.getRandomValues for secure random selection
  const randomValues = new Uint32Array(count);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < count; i++) {
    const remaining = availableCards.length;
    const randomIndex = randomValues[i] % remaining;
    selectedCards.push(availableCards[randomIndex]);
    availableCards.splice(randomIndex, 1);
  }

  return selectedCards;
}

/**
 * Get card by ID
 */
export function getCardById(id: string): TarotCard | undefined {
  return allTarotCards.find((card) => card.id === id);
}

/**
 * Get card image URL
 * Returns the card's imageUrl if available, otherwise tries to find local image
 * in /tarot folder based on card name, or returns a placeholder
 */
export function getCardImageUrl(cardId: string): string {
  const card = getCardById(cardId);
  if (card?.imageUrl) {
    return card.imageUrl;
  }

  // Try to generate local path based on card name
  if (card) {
    // For minor arcana cards, check if they're in suit subfolders
    if (card.arcana === "minor" && card.suit && card.number) {
      const suit = card.suit;
      const number = card.number;

      // Map numbers to file names
      const numberMap: Record<number, string> = {
        1: "ace",
        2: "two",
        3: "three",
        4: "four",
        5: "five",
        6: "six",
        7: "seven",
        8: "eight",
        9: "nine",
        10: "ten",
        11: "page",
        12: "knight",
        13: "queen",
        14: "king",
      };

      const numberName = numberMap[number];
      if (numberName) {
        // Check if suit folder exists (cups, pentacles, swords, wands)
        return `/tarot/${suit}/${numberName}.png`;
      }
    }

    // For major arcana or cards without suit, use original logic
    // Convert card name to filename format (lowercase, replace spaces with hyphens)
    const fileName = card.name.en
      .toLowerCase()
      .replace(/the /g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const localPath = `/tarot/${fileName}.png`;
    // Return local path (browser will handle 404 if file doesn't exist)
    return localPath;
  }

  // Fallback to placeholder if card not found
  return `https://via.placeholder.com/200x350/1a1a3a/64c8ff?text=${encodeURIComponent(
    cardId
  )}`;
}

/**
 * Get card name in specified locale
 */
export function getCardName(card: TarotCard, locale: "ru" | "en"): string {
  return card.name[locale];
}

/**
 * Format selected cards as a string for AI prompt
 */
export function formatCardsForPrompt(
  cards: TarotCard[],
  locale: "ru" | "en" = "ru"
): string {
  return cards.map((card) => getCardName(card, locale)).join(", ");
}
