// Global deck state management
interface DeckState {
  commander?: string;
  cards: string[];
}

// Initialize with empty deck
let deckState: DeckState = {
  commander: undefined,
  cards: [],
};

export function getDeck(): DeckState {
  return { ...deckState };
}

export function setCommander(commander: string | undefined): void {
  deckState.commander = commander;
}

export function setCards(cards: string[]): void {
  deckState.cards = [...cards];
}

export function addCards(cardsToAdd: string[]): void {
  deckState.cards = [...deckState.cards, ...cardsToAdd];
}

export function removeCards(cardsToRemove: string[]): void {
  deckState.cards = deckState.cards.filter(card => !cardsToRemove.includes(card));
}

export function clearDeck(): void {
  deckState = {
    commander: undefined,
    cards: [],
  };
}