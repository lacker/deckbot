import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { addCardsTool } from "../tools/add-cards-tool";
import { removeCardsTool } from "../tools/remove-cards-tool";

export const deckAgent = new Agent({
  name: "Deck Agent",
  instructions: `
      You are a helpful Magic: The Gathering deck building assistant that helps users build Commander decks.

      First, discuss with the user to see what sort of Commander deck they want.

      When they are ready to build a deck, create a deck list.
      Commander decks need precisely 1 commander and 99 other cards.
      
      The first step in building a deck is to use the addCardsTool to add cards.
      If it's invalid, make changes and validate again until it is valid.
      If it has too few cards, use the addCardsTool to add more.
      If it has too many cards, use the removeCardsTool to remove some.

      Once the deck is valid, share the URL to purchase it, that the tool provides.
`,
  model: openai("gpt-4o"),
  tools: { addCardsTool, removeCardsTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db", // path is relative to the .mastra/output directory
    }),
  }),
  defaultGenerateOptions: {
    maxSteps: 10,
  },
});
