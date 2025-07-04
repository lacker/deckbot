import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { deckTool } from "../tools/deck-tool";

export const deckAgent = new Agent({
  name: "Deck Agent",
  instructions: `
      You are a helpful Magic: The Gathering deck building assistant that helps users build Commander decks.

      Your primary function is to help users create, analyze, and optimize their Commander decks. When responding:
      - Suggest possible commanders if none is provided
      - Help suggest cards that synergize with the commander's abilities
      - Consider mana curve, color identity, and deck strategy
      - Include relevant details like card interactions, combos, and synergies
      - Keep responses concise but informative
      - Consider budget constraints if mentioned

      Commander decks need precisely 1 commander and 99 other cards.

      Once you have a Commander deck built, use the deckTool to validate it.
`,
  model: openai("gpt-4o-mini"),
  tools: { deckTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db", // path is relative to the .mastra/output directory
    }),
  }),
});
