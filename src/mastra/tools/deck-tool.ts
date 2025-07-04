import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const deckTool = createTool({
  id: "get-deck-info",
  description: "Get deck information and card suggestions",
  inputSchema: z.object({
    commander: z.string().optional().describe("Commander name"),
    cards: z.array(z.string()).describe("List of cards in the deck"),
  }),
  outputSchema: z.object({
    analysis: z.string(),
    errors: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    // TODO: this deck tool should hit a backend API and include information
    // like card statistics and prices.

    const commander = context.commander;
    const cards = context.cards || [];
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
    const analysis =
      errors.length == 0
        ? "The deck is valid."
        : "Invalid deck. Please fix the errors.";

    return {
      analysis,
      errors,
    };
  },
});
