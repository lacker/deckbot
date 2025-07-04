export async function analyzeDeck(
  commander: string | undefined,
  cards: string[]
): Promise<{ analysis: string; errors: string[] }> {
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

  return {
    analysis,
    errors,
  };
}
