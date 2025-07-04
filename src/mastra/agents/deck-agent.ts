import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { deckTool } from "../tools/deck-tool";

export const deckAgent = new Agent({
  name: "Deck Agent",
  instructions: `
      You are a helpful Magic: The Gathering deck building assistant that helps users build Commander decks.

      First, discuss with the user to see what sort of Commander deck they want.

      When they are ready to build a deck, create a deck list.
      Commander decks need precisely 1 commander and 99 other cards.
      
      Before suggesting the deck to the user, use the deckTool to validate the deck.
      If it's invalid, make changes and validate again until it is valid.
`,
  model: openai("gpt-4o-mini"),
  tools: { deckTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db", // path is relative to the .mastra/output directory
    }),
  }),
});
