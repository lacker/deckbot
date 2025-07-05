export async function analyzeDeck(
  commander: string | undefined,
  cards: string[]
): Promise<{ analysis: string; errors: string[]; url?: string }> {
  const errors: string[] = [];

  // Check for commander
  if (!commander) {
    errors.push("You need a commander");
  }

  // Check for exactly 99 cards
  if (cards.length < 99) {
    let diff = 99 - cards.length;
    errors.push(
      `You have ${cards.length} cards but you should have 99. Please add ${diff} more cards.`
    );
  }
  if (cards.length > 99) {
    let diff = cards.length - 99;
    errors.push(
      `You have ${cards.length} cards but you should have 99. Please remove ${diff} cards.`
    );
  }

  // Basic analysis
  let analysis =
    errors.length === 0
      ? "The deck is valid."
      : "Invalid deck. Please fix the errors.";

  // If we have a commander and exactly 99 cards, validate with Manapool API
  if (commander && cards.length === 99) {
    try {
      // Count occurrences of each card
      const cardCounts = new Map<string, number>();
      cards.forEach(card => {
        cardCounts.set(card, (cardCounts.get(card) || 0) + 1);
      });
      
      // Convert to Manapool API format
      const deckList = {
        commander_names: [commander],
        other_cards: Array.from(cardCounts.entries()).map(([name, quantity]) => ({
          name,
          quantity
        }))
      };
      
      // Call Manapool API to validate deck
      const response = await fetch('https://manapool.com/api/v1/deck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deckList)
      });
      
      if (response.ok) {
        const result = await response.json();
        // Update analysis with API response
        if (result.valid || result.is_valid) {
          analysis = "The deck is valid according to Manapool.";
        } else if (result.errors || result.error_messages) {
          // Add any additional errors from the API
          const apiErrors = result.errors || result.error_messages || [];
          errors.push(...apiErrors);
          analysis = "Invalid deck according to Manapool. Please fix the errors.";
        }
      } else {
        // API call failed, just use our basic validation
        console.error('Manapool API validation failed:', response.status);
      }
    } catch (error) {
      // API call failed, just use our basic validation
      console.error('Error calling Manapool API:', error);
    }
  }

  // Create URL if deck is valid
  let url: string | undefined;
  if (errors.length === 0 && commander && cards.length === 99) {
    const dec = makeDec(commander, cards);
    url = makeUrl(dec);
  }
  
  return {
    analysis,
    errors,
    url,
  };
}

export function makeDec(commander: string | undefined, cards: string[]): string {
  const lines: string[] = [];
  
  // Count occurrences of each card
  const cardCounts = new Map<string, number>();
  cards.forEach(card => {
    cardCounts.set(card, (cardCounts.get(card) || 0) + 1);
  });
  
  // Add commander first if present
  if (commander) {
    lines.push(`1 ${commander}`);
  }
  
  // Add all other cards with their quantities
  cardCounts.forEach((quantity, cardName) => {
    lines.push(`${quantity} ${cardName}`);
  });
  
  // Join all lines with newlines
  return lines.join('\n');
}

export function makeUrl(dec: string): string {
  // Base64 encode the dec content
  const base64Dec = Buffer.from(dec).toString('base64');
  
  // Create URL with deck parameter
  const url = `https://manapool.com/add-deck?deck=${encodeURIComponent(base64Dec)}`;
  
  return url;
}
