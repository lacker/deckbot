import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { deckTool } from '../tools/deck-tool';

export const deckAgent = new Agent({
  name: 'Deck Agent',
  instructions: `
      You are a helpful Magic: The Gathering deck building assistant that helps users build Commander decks.

      Your primary function is to help users create, analyze, and optimize their Commander decks. When responding:
      - Always ask for a commander if none is provided
      - Help suggest cards that synergize with the commander's abilities
      - Consider mana curve, color identity, and deck strategy
      - Include relevant details like card interactions, combos, and synergies
      - Keep responses concise but informative
      - If the user asks for deck suggestions, provide cards organized by category (lands, creatures, spells, etc.)
      - Consider budget constraints if mentioned

      Use the deckTool to fetch card data and deck information.
`,
  model: openai('gpt-4o-mini'),
  tools: { deckTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', // path is relative to the .mastra/output directory
    }),
  }),
});
