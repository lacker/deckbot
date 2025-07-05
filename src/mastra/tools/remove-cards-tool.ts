import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { analyzeDeck } from "./deck-utils";
import { getDeck, removeCards } from "./deck-state";

export const removeCardsTool = createTool({
  id: "remove-cards",
  description: "Remove cards from the deck",
  inputSchema: z.object({
    cards: z.array(z.string()).describe("List of cards to remove"),
  }),
  outputSchema: z.object({
    analysis: z.string(),
    errors: z.array(z.string()),
    url: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const cardsToRemove = context.cards || [];
    
    // Remove cards from the deck
    removeCards(cardsToRemove);
    
    // Get updated deck and analyze
    const deck = getDeck();
    
    return await analyzeDeck(deck.commander, deck.cards);
  },
});