// Global deck state management
interface DeckState {
  commander?: string;
  cardCount: Map<string, number>;
}

// Set of cards that can have duplicates
const duplicatesAllowed = new Set<string>([
  // Basic lands
  "Plains",
  "Island",
  "Swamp",
  "Mountain",
  "Forest",
  "Wastes",
  // Snow-covered basics
  "Snow-Covered Plains",
  "Snow-Covered Island",
  "Snow-Covered Swamp",
  "Snow-Covered Mountain",
  "Snow-Covered Forest",
  // Cards with special rules allowing any number
  "Cid, Timeless Artificer",
  "Dragon's Approach",
  "Hare Apparent",
  "Persistent Petitioners",
  "Rat Colony",
  "Relentless Rats",
  "Shadowborn Apostle",
  "Slime Against Humanity",
  "Tempest Hawk",
  "Templar Knight",
  "Seven Dwarves",
  "Nazgûl",
]);

// Initialize with empty deck
let deckState: DeckState = {
  commander: undefined,
  cardCount: new Map<string, number>(),
};

export function getDeck(): DeckState {
  return {
    commander: deckState.commander,
    cardCount: new Map(deckState.cardCount),
  };
}

export function setCommander(commander: string | undefined): void {
  deckState.commander = commander;
}

export function addCards(cardsToAdd: string[]): void {
  cardsToAdd.forEach(card => {
    const currentCount = deckState.cardCount.get(card) || 0;
    
    // Check if we can add this card
    if (currentCount === 0 || duplicatesAllowed.has(card)) {
      // Either it's the first copy or duplicates are allowed
      deckState.cardCount.set(card, currentCount + 1);
    }
    // Otherwise, don't add it (singleton rule)
  });
}

export function removeCards(cardsToRemove: string[]): void {
  cardsToRemove.forEach(card => {
    const currentCount = deckState.cardCount.get(card) || 0;
    if (currentCount > 1) {
      deckState.cardCount.set(card, currentCount - 1);
    } else {
      deckState.cardCount.delete(card);
    }
  });
}

export function clearDeck(): void {
  deckState = {
    commander: undefined,
    cardCount: new Map<string, number>(),
  };
}

// Helper function to convert cardCount map to cards array
export function getCardsArray(): string[] {
  const cards: string[] = [];
  deckState.cardCount.forEach((count, cardName) => {
    for (let i = 0; i < count; i++) {
      cards.push(cardName);
    }
  });
  return cards;
}