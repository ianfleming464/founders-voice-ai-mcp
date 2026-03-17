# Founders Voice AI + MCP

Founders Voice AI is a small Next.js app for founder voice cloning with retrieval-augmented generation (RAG). It stores a founder's past writing as embeddings in Pinecone, retrieves the most relevant chunks for a prompt, and uses OpenAI to generate new content in that founder's style.

The repo currently includes:

- A landing page that compares generic AI output vs founder-specific RAG output
- A manual dashboard for testing generation requests directly
- API routes for semantic search and content generation
- CLI scripts to chunk content, create embeddings, and upload vectors to Pinecone

## Functionality

### Current product flow

1. Founder content is chunked into smaller text segments.
2. Those chunks are embedded with OpenAI `text-embedding-3-small`.
3. Embeddings are saved to JSON in `data/output/`.
4. The upload script pushes those vectors into Pinecone under a namespace matching `userId`.
5. When a user submits a prompt, the app:
   - embeds the query
   - retrieves relevant chunks from Pinecone
   - builds a founder-style system prompt
   - generates a final response with OpenAI chat completions

### Pages

- `/`
  Compares a generic generation path against the founder-voice RAG path. The current demo is wired to `userId: "paul_graham"`.

- `/dashboard`
  Manual testing interface for generation requests. Lets you choose `userId`, content type, prompt, and tone.

### API routes

- `POST /api/generate`
  Generates founder-style content using RAG.

- `POST /api/generate-generic`
  Generates a generic response without retrieval, for side-by-side comparison.

- `POST /api/search`
  Runs semantic search against a founder's Pinecone namespace.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- OpenAI Node SDK
- Pinecone vector database
- Zod

## Project structure

```text
app/
  api/
    generate/
    generate-generic/
    search/
  dashboard/
  page.tsx
lib/
  generation/
  openai/
  pinecone/
  search/
  types/
  utils/
scripts/
  embed.ts
  upload.ts
data/
  output/
```

## Environment variables

Create `.env.local` with:

```bash
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=your_index_name
```

Notes:

- `OPENAI_API_KEY` is used for both embeddings and text generation.
- `PINECONE_INDEX_NAME` should point to an index whose dimension matches the embedding size used here: `512`.

## Local development

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Ingestion workflow

### 1. Create embeddings from founder content

From inline text:

```bash
npm run embed -- --userId=paul_graham --contentType=general --text="Your founder text here"
```

From a file:

```bash
npm run embed -- --userId=paul_graham --contentType=general --file=./path/to/content.txt
```

This writes a JSON output file into `data/output/`.

### 2. Upload embeddings to Pinecone

Upload one file:

```bash
npm run upload -- --file=data/output/your_file.json
```

Upload all generated files:

```bash
npm run upload -- --all
```

Upload only one founder's files:

```bash
npm run upload -- --userId=paul_graham
```

## Supported content types

The codebase currently uses these content types across generation and ingestion:

- `linkedin`
- `investor`
- `general`
- `newsletter` for search/embedding/upload paths

There is a small mismatch today: generation supports `linkedin`, `investor`, and `general`, while some ingestion/search code still includes `newsletter`.

## Scripts

- `npm run dev` starts the Next.js dev server
- `npm run build` builds the app
- `npm run start` runs the production server
- `npm run lint` runs ESLint
- `npm run embed` chunks content and creates embedding JSON files
- `npm run upload` uploads embedding JSON files to Pinecone

## How to verify

1. Add valid OpenAI and Pinecone credentials to `.env.local`.
2. Run `npm run embed` for a test founder.
3. Run `npm run upload` to push vectors to Pinecone.
4. Start the app with `npm run dev`.
5. Visit `/dashboard` and generate content for the same `userId`.
6. Visit `/` to compare generic output vs RAG output.

## Status

This repo is an early-stage prototype. The UI references future work like MCP integration and authentication, but the implemented core today is the RAG ingestion and generation pipeline plus a simple demo interface.
