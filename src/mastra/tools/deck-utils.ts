export function analyzeDeck(commander: string | undefined, cards: string[]): { analysis: string; errors: string[] } {
  const errors: string[] = [];
  
  // Check for commander
  if (!commander) {
    errors.push("You need a commander");
  }
  
  // Check for exactly 99 cards
  if (cards.length !== 99) {
    errors.push(`You have ${cards.length} cards but you should have 99`);
  }
  
  // Basic analysis
  const analysis = errors.length === 0
    ? "The deck is valid."
    : "Invalid deck. Please fix the errors.";
  
  return {
    analysis,
    errors,
  };
}