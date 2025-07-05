export async function analyzeDeck(
  deck: { commander?: string; cardCount: Map<string, number> }
): Promise<{ analysis: string; errors: string[]; url?: string }> {
  const errors: string[] = [];
  
  // Calculate total card count
  let totalCards = 0;
  deck.cardCount.forEach((count) => {
    totalCards += count;
  });

  // Check for commander
  if (!deck.commander) {
    errors.push("You need a commander");
  }

  // Check for exactly 99 cards
  if (totalCards < 99) {
    let diff = 99 - totalCards;
    errors.push(
      `You have ${totalCards} cards but you should have 99. Please add ${diff} more cards.`
    );
  }
  if (totalCards > 99) {
    let diff = totalCards - 99;
    errors.push(
      `You have ${totalCards} cards but you should have 99. Please remove ${diff} cards.`
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
    // Convert to Manapool API format
    const deckList = {
      commander_names: [deck.commander],
      other_cards: Array.from(deck.cardCount.entries()).map(([name, quantity]) => ({
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
  if (errors.length === 0 && deck.commander && totalCards === 99) {
    const dec = makeDec(deck);
    url = makeUrl(dec);
  }

  return {
    analysis: "The deck is valid.",
    errors,
    url,
  };
}

export function makeDec(deck: { commander?: string; cardCount: Map<string, number> }): string {
  const lines: string[] = [];

  // Add commander first if present
  if (deck.commander) {
    lines.push(`1 ${deck.commander}`);
  }

  // Add all other cards with their quantities
  deck.cardCount.forEach((quantity, cardName) => {
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
