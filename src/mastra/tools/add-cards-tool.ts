import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { analyzeDeck } from "./deck-utils";
import { getDeck, addCards, setCommander } from "./deck-state";

export const addCardsTool = createTool({
  id: "add-cards",
  description: "Add cards to the deck and optionally set commander",
  inputSchema: z.object({
    commander: z.string().optional().describe("Commander name (overrides current commander if provided)"),
    cards: z.array(z.string()).describe("List of cards to add"),
  }),
  outputSchema: z.object({
    analysis: z.string(),
    errors: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const cardsToAdd = context.cards || [];
    
    // Set commander if provided
    if (context.commander !== undefined) {
      setCommander(context.commander);
    }
    
    // Add cards to the deck
    addCards(cardsToAdd);
    
    // Get updated deck and analyze
    const deck = getDeck();
    
    return analyzeDeck(deck.commander, deck.cards);
  },
});
