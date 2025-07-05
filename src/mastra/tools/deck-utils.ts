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

  if (errors.length > 0) {
    return {
      analysis: "The deck is invalid.",
      errors,
      url: undefined,
    };
  }

  // Validate with Manapool API
  try {
    // Count occurrences of each card
    const cardCounts = new Map<string, number>();
    cards.forEach((card) => {
      cardCounts.set(card, (cardCounts.get(card) || 0) + 1);
    });

    // Convert to Manapool API format
    const deckList = {
      commander_names: [commander],
      other_cards: Array.from(cardCounts.entries()).map(([name, quantity]) => ({
        name,
        quantity,
      })),
    };

    // Call Manapool API to validate deck
    const apiKey = process.env.MANAPOOL_API_KEY;
    if (!apiKey) {
      errors.push("MANAPOOL_API_KEY not found in environment variables");
      return {
        analysis: "The deck is invalid.",
        errors,
        url: undefined,
      };
    }
    
    const response = await fetch("https://manapool.com/api/v1/deck", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ManaPool-Access-Token": apiKey,
      },
      body: JSON.stringify(deckList),
    });

    if (response.ok) {
      const result = await response.json();
      // Update analysis with API response
      if (result.valid || result.is_valid) {
        console.error("Looks good.");
      } else if (result.errors || result.error_messages) {
        const apiErrors = result.errors || result.error_messages || [];
        errors.push(...apiErrors);
      }
    } else {
      errors.push("Manapool API validation failed: " + response.status);
    }
  } catch (error) {
    errors.push("Error calling Manapool API: " + error);
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error("error:", error);
    }
    return {
      analysis: "The deck is invalid.",
      errors,
      url: undefined,
    };
  }

  // Create URL if deck is valid
  let url: string | undefined;
  console.error("cards:", cards);
  if (errors.length === 0 && commander && cards.length === 99) {
    const dec = makeDec(commander, cards);
    url = makeUrl(dec);
  }

  return {
    analysis: "The deck is valid.",
    errors,
    url,
  };
}

export function makeDec(
  commander: string | undefined,
  cards: string[]
): string {
  const lines: string[] = [];

  // Count occurrences of each card
  const cardCounts = new Map<string, number>();
  cards.forEach((card) => {
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
  return lines.join("\n");
}

export function makeUrl(dec: string): string {
  // Base64 encode the dec content
  const base64Dec = Buffer.from(dec).toString("base64");

  // Create URL with deck parameter
  const url = `https://manapool.com/add-deck?deck=${encodeURIComponent(base64Dec)}`;

  return url;
}
