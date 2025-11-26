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
Following docs/planning/30_DAY_PLAN.md - currently on Day 5-6 (Embedding + Upload Complete)

## Key Documents

### Planning
- **docs/planning/30_DAY_PLAN.md** - Development roadmap with checkpoints
- **docs/planning/PRODUCT_REQUIREMENTS.md** - Feature scope and architecture
- **docs/planning/SETUP_WORKFLOW.md** - How to work with Claude Code

### Reference
- **docs/reference/REFERENCE_REPO_GUIDE.md** - When to check reference repo
- **docs/reference/REFERENCE_REPO_CONTEXT.md** - Reference repo technical details

### Technical
- **docs/technical/ARCHITECTURE.md** - System architecture and data flow
- **docs/technical/STATUS.md** - Current status and features (plain English)

## Development Commands
- `npm run dev` - Start Next.js dev server
- `npm run embed` - Generate embeddings (after Day 4)
- `npm run upload` - Upload vectors to Pinecone (after Day 5)

## Environment Variables (.env.local)
```env
OPENAI_API_KEY=sk-proj-...
PINECONE_API_KEY=pcsk-...
PINECONE_INDEX_NAME=founders-voice-512
```

## Project Structure
```
/app
  /api              - API routes (search, generate, embed) [empty - Day 7-9]
  page.tsx          - Main UI
/lib
  /openai          - OpenAI SDK wrappers
  /pinecone        - Pinecone operations
  /utils           - Utilities (chunker)
/scripts
  embed.ts         - Generate embeddings (CLI)
  upload.ts        - Upload to Pinecone (CLI)
/docs
  /planning        - Project planning docs
  /reference       - Reference repo guides
  /technical       - Architecture & status
/data
  /output          - Generated vectors (JSON)
```

## Key Concepts
- **RAG**: Retrieve relevant founder content, augment prompts
- **Embeddings**: 512d vectors from text-embedding-3-small
- **MCP**: Expose voice generation as tools for AI assistants
- **Multi-tenancy**: One Pinecone namespace per user

## Reference Repo
Local: /Users/ianfleming/Desktop/Ian/cringe-influencer
See docs/reference/REFERENCE_REPO_GUIDE.md for when to check patterns.