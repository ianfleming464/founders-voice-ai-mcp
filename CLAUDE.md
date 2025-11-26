# CLAUDE.md

## Project Overview
Founders Voice AI - RAG-powered voice cloning for startup founders, accessible via MCP.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- OpenAI (text-embedding-3-small, GPT-4)
- Pinecone (vector database, 512 dimensions)
- MCP SDK (Model Context Protocol)

## Current Phase
Following 30_DAY_PLAN.md - currently on Day 3 (Embedding Pipeline)

## Key Documents
- **30_DAY_PLAN.md** - Development roadmap with checkpoints
- **PRODUCT_REQUIREMENTS.md** - Feature scope and architecture
- **SETUP_WORKFLOW.md** - How to work with Claude Code
- **REFERENCE_REPO_GUIDE.md** - When to check reference repo
- **REFERENCE_REPO_CONTEXT.md** - Reference repo technical details

## Development Commands
- `npm run dev` - Start Next.js dev server
- `npm run embed` - Generate embeddings (after Day 4)
- `npm run upload` - Upload vectors to Pinecone (after Day 5)

## Environment Variables (.env.local)
```env
OPENAI_API_KEY=sk-proj-...
PINECONE_API_KEY=pcsk-...
PINECONE_INDEX_NAME=founders-voice
```

## Project Structure
```
/app
  /api              - API routes (search, generate, embed)
  page.tsx          - Main UI
/lib
  /openai          - OpenAI SDK wrappers
  /pinecone        - Pinecone operations
/scripts
  embed.ts         - Generate embeddings
  upload.ts        - Upload to Pinecone
/mcp-server        - MCP server (Week 2+)
/data
  /output          - Generated vectors
```

## Key Concepts
- **RAG**: Retrieve relevant founder content, augment prompts
- **Embeddings**: 512d vectors from text-embedding-3-small
- **MCP**: Expose voice generation as tools for AI assistants
- **Multi-tenancy**: One Pinecone namespace per user

## Reference Repo
Local: /Users/ianfleming/Desktop/Ian/cringe-influencer
See REFERENCE_REPO_GUIDE.md for when to check patterns.