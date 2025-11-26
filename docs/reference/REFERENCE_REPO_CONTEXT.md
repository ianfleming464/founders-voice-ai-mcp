# Cringe Influencer RAG - Reference Documentation

## 1. Architecture Overview

### Project Purpose
A Retrieval-Augmented Generation (RAG) application that processes LinkedIn posts from Brian Jenney, generates embeddings, stores them in Pinecone vector database, and enables semantic search with optional re-ranking.

### Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript / JavaScript
- **Embeddings**: OpenAI `text-embedding-3-small`
- **Vector Database**: Pinecone (Serverless, AWS us-east-1)
- **Re-ranking**: Pinecone Inference API with `bge-reranker-v2-m3`
- **Data Source**: 13,586 LinkedIn posts (~35MB of pre-generated vectors)

### System Architecture

The application follows a two-phase architecture:

#### Phase 1: Offline Ingestion & Embedding Pipeline
```
brian_posts.csv (13,586 posts)
    ↓
[csv-processor.ts] Parse & structure CSV data
    ↓
[openai.ts] Generate embeddings (512 dimensions)
    ↓
brian_posts_vectors.json (35MB output file)
    ↓
[upload-to-pinecone.js] Batch upload to Pinecone
    ↓
Pinecone Index: "brian-clone"
```

#### Phase 2: Runtime Query & Retrieval
```
User Query
    ↓
[OpenAI API] Generate query embedding (512d)
    ↓
[Pinecone] Cosine similarity search → Top 10 candidates
    ↓
├─→ Basic Search: Return top K results
└─→ Re-ranked Search: Apply bge-reranker-v2-m3 → Return top 5
    ↓
Display in UI (side-by-side comparison)
```

### Key Design Patterns

1. **Separation of Concerns**: Clean separation between data processing (`libs/`, `scripts/`), API endpoints (`app/api/`), and UI components (`app/components/`)

2. **Offline-First Embeddings**: Pre-compute vectors to minimize runtime API costs and latency

3. **Dual Retrieval Strategy**:
   - Basic vector search (fast baseline)
   - Re-ranked search (higher quality via cross-attention)

4. **Metadata Co-location**: Store full post content and engagement metrics with vectors for rich results

5. **Batch Processing**: Upload vectors in batches of 100 for efficiency

---

## 2. Key Files and Their Purpose

### Core Application Files

#### `/app/page.tsx`
- **Purpose**: Main search UI (React client component)
- **Features**:
  - Search input form
  - Parallel API calls to both `/api/search` and `/api/search-rerank`
  - Side-by-side comparison of results
  - Loading states and error handling
- **Style**: Retro 1995 Craigslist aesthetic

#### `/app/layout.tsx`
- **Purpose**: Root layout wrapper with metadata
- **Provides**: Page title, description, and global layout structure

#### `/app/components/DocumentResults.tsx`
- **Purpose**: Display search results component
- **Shows**: Document rank, similarity score, text preview, metadata (author, engagement metrics, LinkedIn link)
- **Styling**: Minimalist with borders and monospace font

#### `/app/globals.css`
- **Purpose**: Global styles implementing Craigslist-inspired retro design

### API Endpoints

#### `/app/api/search/route.ts`
- **Purpose**: Basic vector similarity search endpoint
- **HTTP Method**: POST
- **Request Body**: `{ query: string, topK?: number }`
- **Response**: `{ query: string, documents: Array, total: number }`
- **Flow**:
  1. Generate query embedding (512d)
  2. Query Pinecone for similar vectors
  3. Return results with metadata and scores

#### `/app/api/search-rerank/route.ts`
- **Purpose**: Advanced search with LLM-based re-ranking
- **HTTP Method**: POST
- **Request Body**: `{ query: string }`
- **Flow**:
  1. Generate query embedding
  2. Retrieve top 10 candidates from Pinecone
  3. Re-rank using `bge-reranker-v2-m3` model
  4. Return top 5 re-ranked results
- **Benefit**: Improved relevance through cross-attention between query and documents

### Library Files

#### `/libs/openai.ts` (and `.js`)
- **Purpose**: OpenAI API wrapper for embeddings
- **Key Functions**:
  - `createEmbedding(text, dimensions=512)`: Generate single embedding
  - `createEmbeddings(texts[], dimensions=512)`: Batch embedding generation
- **Model**: `text-embedding-3-small`
- **Default Dimensions**: 512 (.ts) / 1536 (.js, configurable)
- **Environment**: Requires `OPENAI_API_KEY`

#### `/libs/pinecone.ts` (and `.js`)
- **Purpose**: Pinecone vector database operations
- **Key Functions**:
  - `upsertVectors(indexName, vectors[])`: Batch upload (100 vectors/batch)
  - `queryVectors(indexName, vector, topK=10, includeMetadata=true)`: Similarity search
  - `rerank(query, documents[], topK=5)`: Re-rank using inference API
- **Environment**: Requires `PINECONE_API_KEY`

#### `/libs/csv-processor.ts` (and `.js`)
- **Purpose**: Parse and structure CSV data from LinkedIn exports
- **Key Function**: `processCsv(filePath): Promise<ProcessedCsvRow[]>`
- **Output Structure**:
  ```typescript
  {
    id: string,              // LinkedIn URN
    text: string,            // Post content (cleaned)
    type: string,            // Post type
    firstName: string,
    lastName: string,
    numImpressions: number,
    numViews: number,
    numReactions: number,
    numComments: number,
    numShares: number,
    createdAt: string,
    link: string,
    hashtags: string
  }
  ```

### Scripts

#### `/scripts/embed.js`
- **Purpose**: Generate embeddings from CSV data
- **Command**: `npm run embed` or `node scripts/embed.js`
- **Flow**:
  1. Read CSV from `data/brian_posts.csv`
  2. Process with `processCsv()`
  3. Generate 512d embeddings via `createEmbeddings()`
  4. Combine text + metadata + vectors
  5. Save to `output/brian_posts_vectors.json`
- **Output**: 35MB JSON file with vectors

#### `/scripts/upload-to-pinecone.js`
- **Purpose**: Upload pre-generated vectors to Pinecone
- **Command**: `npm run upload` or `node scripts/upload-to-pinecone.js`
- **Flow**:
  1. Load vectors from `output/brian_posts_vectors.json`
  2. Check if index exists (creates if needed)
  3. Verify dimension compatibility (512)
  4. Upload in batches of 100 vectors
- **Features**:
  - Automatic index creation
  - Dimension validation
  - Progress logging

### Data Files

#### `/data/brian_posts.csv`
- **Purpose**: Source data (13,586 LinkedIn posts)
- **Format**: LinkedIn export CSV
- **Columns**: URN, text, type, author info, engagement metrics, timestamps, links, hashtags

#### `/output/brian_posts_vectors.json`
- **Purpose**: Pre-generated embeddings (saves API costs)
- **Size**: ~35MB
- **Format**:
  ```json
  [
    {
      "id": "urn:li:...",
      "values": [0.123, -0.456, ...], // 512 dimensions
      "metadata": {
        "text": "...",
        "numImpressions": 1000,
        ...
      }
    }
  ]
  ```

### Configuration Files

#### `/.env.example`
- **Purpose**: Environment variable template
- **Required Variables**:
  - `OPENAI_API_KEY`: For generating embeddings
  - `PINECONE_API_KEY`: For vector database access
  - `PINECONE_INDEX_NAME`: Index name (e.g., "brian-clone-512")

#### `/package.json`
- **Purpose**: Project dependencies and scripts
- **Key Scripts**:
  - `dev`: Start Next.js dev server
  - `build`: Production build
  - `embed`: Generate embeddings
  - `upload`: Upload to Pinecone
- **Key Dependencies**:
  - `@pinecone-database/pinecone`: 6.1.2
  - `openai`: 5.11.0
  - `next`: 15.4.5
  - `csv-parser`: 3.0.0

#### `/tsconfig.json`
- **Target**: ES2017
- **Module**: ESNext
- **Strict Mode**: Disabled
- **Next.js Plugin**: Enabled

#### `/next.config.js`
- **ESM Externals**: Enabled for compatibility

---

## 3. Embedding Pipeline Details

### Overview
The embedding pipeline transforms raw LinkedIn posts into vector representations suitable for semantic search.

### Pipeline Stages

#### Stage 1: CSV Parsing
**File**: `libs/csv-processor.ts`

```typescript
// Reads brian_posts.csv and extracts structured data
processCsv(filePath) → ProcessedCsvRow[]
```

**Processing Steps**:
1. Parse CSV using `csv-parser` library
2. Extract and clean text content
3. Parse engagement metrics (impressions, reactions, etc.)
4. Structure metadata (author, timestamps, links)
5. Generate unique IDs from LinkedIn URNs

**Data Cleaning**:
- Remove empty/invalid rows
- Normalize text fields
- Parse numeric engagement metrics
- Format timestamps

#### Stage 2: Embedding Generation
**File**: `libs/openai.ts`

```typescript
// Generates 512-dimensional embeddings
createEmbeddings(texts[], dimensions=512) → Promise<number[][]>
```

**Configuration**:
- **Model**: `text-embedding-3-small`
- **Dimensions**: 512 (optimized for cost/performance trade-off)
- **Batch Processing**: Handles multiple texts in single API call
- **Rate Limiting**: No explicit handling (assumes sufficient API quota)

**Cost Optimization**:
- Pre-generate all embeddings offline (one-time cost)
- Store in JSON file to avoid regeneration
- Use smaller dimension size (512 vs 1536) for cost savings

#### Stage 3: Vector + Metadata Combination
**File**: `scripts/embed.js`

Combines embeddings with original metadata:
```javascript
{
  id: row.id,
  values: embedding,  // 512-dimensional array
  metadata: {
    text: row.text,
    firstName: row.firstName,
    lastName: row.lastName,
    numImpressions: row.numImpressions,
    numViews: row.numViews,
    numReactions: row.numReactions,
    numComments: row.numComments,
    numShares: row.numShares,
    createdAt: row.createdAt,
    link: row.link,
    hashtags: row.hashtags
  }
}
```

#### Stage 4: Serialization
**Output**: `output/brian_posts_vectors.json`

- **Format**: JSON array of vector objects
- **Size**: ~35MB for 13,586 posts
- **Purpose**: Reusable embedding cache

### Running the Pipeline

```bash
# Generate embeddings from CSV
npm run embed

# Expected output:
# - Reads data/brian_posts.csv
# - Generates 512d embeddings via OpenAI
# - Saves to output/brian_posts_vectors.json
# - Logs progress and completion
```

### Pipeline Characteristics

**Strengths**:
- Offline processing minimizes runtime costs
- Batch API calls improve efficiency
- Metadata preservation enables rich results
- Pre-generated vectors ensure fast queries

**Considerations**:
- Full pipeline re-run required for new data
- 35MB vector file impacts repository size
- No incremental updates (full regeneration)
- API costs for initial generation (~$0.03/1M tokens)

---

## 4. Pinecone Integration Patterns

### Index Configuration

**Index Name**: `brian-clone` (hardcoded in API routes)

**Specifications**:
- **Dimension**: 512
- **Metric**: Cosine similarity
- **Cloud**: AWS
- **Region**: us-east-1
- **Type**: Serverless (auto-scaling)

**Creation Pattern** (`scripts/upload-to-pinecone.js`):
```javascript
// Check if index exists
const indexList = await pinecone.listIndexes();
const indexExists = indexList.indexes?.some(
  index => index.name === indexName
);

// Create if needed
if (!indexExists) {
  await pinecone.createIndex({
    name: indexName,
    dimension: 512,
    metric: 'cosine',
    spec: {
      serverless: {
        cloud: 'aws',
        region: 'us-east-1'
      }
    }
  });
}
```

### Vector Upload Pattern

**File**: `libs/pinecone.ts`

**Batch Upload Strategy**:
```typescript
async function upsertVectors(indexName, vectors) {
  const index = pinecone.index(indexName);
  const batchSize = 100;

  // Upload in batches of 100
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert(batch);
  }
}
```

**Why Batch?**
- Pinecone API limits per request
- Better error handling (partial failures)
- Progress tracking for large uploads
- Network efficiency

### Query Pattern

**Basic Search** (`app/api/search/route.ts`):
```typescript
async function queryVectors(indexName, queryVector, topK, includeMetadata) {
  const index = pinecone.index(indexName);

  const results = await index.query({
    vector: queryVector,
    topK: topK,
    includeMetadata: includeMetadata
  });

  return results.matches;
}
```

**Query Flow**:
1. Generate query embedding (512d) via OpenAI
2. Send vector to Pinecone for similarity search
3. Pinecone returns top K matches with scores
4. Extract metadata from matches
5. Return structured results

**Similarity Scoring**:
- Metric: Cosine similarity
- Range: -1 (opposite) to 1 (identical)
- Typical scores: 0.7-0.95 for relevant matches

### Re-ranking Pattern

**File**: `libs/pinecone.ts`

```typescript
async function rerank(query, documents, topK) {
  const response = await pinecone.inference.rerank(
    'bge-reranker-v2-m3',
    query,
    documents,
    { topK }
  );

  return response;
}
```

**Re-ranking Flow** (`app/api/search-rerank/route.ts`):
1. Retrieve top 10 candidates via vector search
2. Extract text from candidates
3. Call `rerank()` with query + candidate texts
4. Receive re-scored results (top 5)
5. Match scores back to original documents

**Why Re-rank?**
- **Vector Search**: Finds semantically similar content (dense retrieval)
- **Re-ranking**: Applies cross-attention between query and candidates (more accurate relevance)
- **Benefit**: Combines speed of vector search with quality of LLM understanding

**Model**: `bge-reranker-v2-m3`
- Cross-encoder architecture
- Trained for information retrieval
- Hosted by Pinecone Inference API

### Integration Patterns Summary

| Pattern | Use Case | File Location |
|---------|----------|---------------|
| **Index Creation** | Setup/initialization | `scripts/upload-to-pinecone.js` |
| **Batch Upload** | Offline data ingestion | `libs/pinecone.ts:upsertVectors()` |
| **Vector Query** | Runtime search | `libs/pinecone.ts:queryVectors()` |
| **Re-ranking** | Enhanced relevance | `libs/pinecone.ts:rerank()` |
| **Metadata Storage** | Rich results | All upsert operations |

### Environment Configuration

```bash
# Required in .env
PINECONE_API_KEY=your-api-key-here
PINECONE_INDEX_NAME=brian-clone-512

# Index accessed in API routes (hardcoded)
const index = pinecone.index('brian-clone');
```

**Note**: API routes use hardcoded index name `'brian-clone'` instead of environment variable.

---

## 5. OpenAI API Usage

### API Configuration

**Authentication**:
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
```

**Environment Variable**: `OPENAI_API_KEY` (required in `.env`)

### Embedding Model

**Model**: `text-embedding-3-small`

**Characteristics**:
- **Dimensions**: 512 (configurable, max 1536)
- **Cost**: ~$0.02 per 1M tokens
- **Speed**: Fast (optimized for high throughput)
- **Quality**: Good for most semantic search tasks
- **Max Input**: 8,191 tokens per request

**Why This Model?**
- Cost-effective for large-scale embeddings
- 512 dimensions balance quality vs. storage/compute
- Suitable for social media post length (~100-300 tokens)

### Usage Pattern 1: Batch Embedding Generation

**File**: `libs/openai.ts`

**Function**: `createEmbeddings(texts[], dimensions=512)`

```typescript
async function createEmbeddings(texts, dimensions = 512) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,  // Array of strings
    dimensions: dimensions
  });

  return response.data.map(item => item.embedding);
}
```

**Usage** (in `scripts/embed.js`):
```javascript
// Process all posts at once
const texts = processedRows.map(row => row.text);
const embeddings = await createEmbeddings(texts, 512);

// Combine with metadata
const vectors = processedRows.map((row, i) => ({
  id: row.id,
  values: embeddings[i],
  metadata: { ...row }
}));
```

**Batch Benefits**:
- Single API request for multiple texts
- Reduced latency vs. sequential requests
- Lower cost per embedding
- Efficient for offline processing

### Usage Pattern 2: Runtime Query Embedding

**File**: `app/api/search/route.ts`

**Function**: `createEmbedding(text, dimensions=512)`

```typescript
async function createEmbedding(text, dimensions = 512) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,  // Single string
    dimensions: dimensions
  });

  return response.data[0].embedding;
}
```

**Usage** (in API routes):
```typescript
// Convert user query to embedding
const queryEmbedding = await createEmbedding(query, 512);

// Search Pinecone with embedding
const results = await queryVectors('brian-clone', queryEmbedding, topK);
```

**Runtime Characteristics**:
- ~100-300ms latency per request
- Cached in API route (no caching between requests)
- Cost: ~$0.000002 per query (negligible)

### Cost Analysis

**Offline Embedding Generation**:
```
13,586 posts × ~150 tokens/post = 2,037,900 tokens
Cost: $0.02 per 1M tokens
Total: ~$0.04 (one-time cost)
```

**Runtime Query Embedding**:
```
1 query × ~20 tokens = 20 tokens
Cost: $0.02 per 1M tokens
Per query: ~$0.0000004 (negligible)
```

**Monthly Estimate** (10,000 queries):
```
10,000 queries × $0.0000004 = $0.004/month
```

**Cost Optimization Strategies**:
1. **Pre-generate Embeddings**: Store in JSON (one-time cost)
2. **Smaller Dimensions**: Use 512 instead of 1536 (60% cost reduction)
3. **Batch Processing**: Process multiple texts per API call
4. **No Query Caching**: Simple implementation (could add Redis for high traffic)

### API Error Handling

**Current Implementation**:
- No explicit retry logic
- Errors propagate to client
- Assumes sufficient API quota

**Potential Improvements**:
```typescript
// Retry with exponential backoff
async function createEmbeddingWithRetry(text, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await createEmbedding(text);
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(2 ** i * 1000); // Exponential backoff
    }
  }
}
```

### OpenAI API Usage Summary

| Usage Type | Location | Frequency | Cost Impact |
|------------|----------|-----------|-------------|
| **Batch Embedding** | `scripts/embed.js` | One-time | ~$0.04 total |
| **Query Embedding** | `app/api/search*/route.ts` | Per query | ~$0.0000004 each |
| **Model** | All | N/A | `text-embedding-3-small` |
| **Dimensions** | All | N/A | 512 |

### Rate Limits

**OpenAI Tier Limits** (typical free tier):
- 3 requests/minute
- 200,000 tokens/minute

**Application Fit**:
- Offline: Single large batch request (within limits)
- Runtime: Low query volume (well within limits)
- Production: Consider upgrading to paid tier for higher throughput

---

## Appendix: Quick Reference

### Directory Structure
```
cringe-influencer/
├── app/                    # Next.js application
│   ├── api/               # API routes
│   ├── components/        # React components
│   └── page.tsx           # Main UI
├── libs/                  # Core utilities
│   ├── csv-processor.ts   # CSV parsing
│   ├── openai.ts          # Embeddings
│   └── pinecone.ts        # Vector DB
├── scripts/               # CLI tools
│   ├── embed.js           # Generate embeddings
│   └── upload-to-pinecone.js  # Upload vectors
├── data/                  # Source data
│   └── brian_posts.csv    # 13,586 posts
└── output/                # Generated files
    └── brian_posts_vectors.json  # 35MB vectors
```

### Common Commands
```bash
# Setup
npm install
cp .env.example .env
# Edit .env with your API keys

# Generate embeddings
npm run embed

# Upload to Pinecone
npm run upload

# Start dev server
npm run dev
```

### API Endpoints
```
POST /api/search
Body: { query: string, topK?: number }
Returns: { query, documents[], total }

POST /api/search-rerank
Body: { query: string }
Returns: { query, documents[], total }
```

### Key Metrics
- **Posts**: 13,586
- **Vector Dimensions**: 512
- **Vector File Size**: 35MB
- **Embedding Model**: text-embedding-3-small
- **Re-ranking Model**: bge-reranker-v2-m3
- **Database**: Pinecone Serverless (AWS us-east-1)
- **Cost**: ~$0.04 initial + ~$0.0000004 per query

### Environment Variables
```bash
OPENAI_API_KEY=sk-...           # OpenAI API key
PINECONE_API_KEY=pcsk_...       # Pinecone API key
PINECONE_INDEX_NAME=brian-clone-512  # Index name
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-26
**Codebase**: cringe-influencer (main branch)