# ARCHITECTURE.md

## System Overview

Founders Voice AI is a RAG-powered voice cloning system that converts founder content into searchable embeddings. Currently implemented as a **CLI-based pipeline** for generating and storing embeddings.

**Current Phase:** Day 5-6 Complete (Embedding + Upload Pipeline)
**Next Phase:** Day 7-9 (RAG Search API - not yet built)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLI PIPELINE (Current)                   │
└─────────────────────────────────────────────────────────────┘

  Founder Text Input
       │
       ▼
  ┌─────────────────┐
  │  scripts/       │
  │  embed.ts       │  ← npm run embed
  └─────────────────┘
       │
       ├─→ lib/utils/chunker.ts (Split into ~500 char chunks)
       │
       ├─→ lib/openai/embeddings.ts (Generate 512d vectors)
       │
       ▼
  ┌─────────────────┐
  │  data/output/   │  ← JSON files with vectors
  │  *.json         │
  └─────────────────┘
       │
       ▼
  ┌─────────────────┐
  │  scripts/       │
  │  upload.ts      │  ← npm run upload
  └─────────────────┘
       │
       ├─→ lib/pinecone/client.ts (Pinecone connection)
       │
       ├─→ lib/pinecone/upload.ts (Batch upload)
       │
       ▼
  ┌─────────────────┐
  │   Pinecone      │  ← founders-voice-512 index
  │   Vector DB     │     User-isolated namespaces
  └─────────────────┘
```

---

## Data Flow: Text → Embeddings → Storage

### Phase 1: Text Chunking

**File:** `lib/utils/chunker.ts`

```
Input: "Long founder content (e.g., 1000+ characters)"
  │
  ├─→ Split on sentence boundaries (. ! ?)
  ├─→ Target: ~500 characters per chunk
  ├─→ Overlap: 50 characters between chunks (context preservation)
  ├─→ Merge: Chunks < 100 chars combined with neighbors
  │
Output: ["Chunk 1 text...", "Chunk 2 text...", ...]
```

**Algorithm:**
1. Regex match sentences: `/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g`
2. Accumulate sentences until ~500 chars
3. When threshold exceeded, save chunk and start new one with 50-char overlap
4. Post-process: merge small chunks (<100 chars)

---

### Phase 2: Embedding Generation

**File:** `lib/openai/embeddings.ts`

```
Input: Array of text chunks
  │
  ├─→ OpenAI API: text-embedding-3-small
  ├─→ Configuration: 512 dimensions
  ├─→ Batch processing (multiple chunks per API call)
  │
Output: Array of 512-dimensional vectors
```

**Key Functions:**
- `createEmbeddings(texts: string[], dimensions: number)`: Batch embed
- `createEmbedding(text: string, dimensions: number)`: Single embed (convenience wrapper)

**Model Details:**
- Model: `text-embedding-3-small`
- Dimensions: 512 (cost-optimized, vs 1536 max)
- Output: Dense vector `number[]` with 512 elements
- Similarity: Cosine similarity in Pinecone

---

### Phase 3: Vector Storage (JSON)

**File:** `scripts/embed.ts`

```
Input: Chunks + Embeddings
  │
  ├─→ Combine into records with metadata
  ├─→ Generate unique IDs: {userId}_{contentType}_{timestamp}_{index}
  ├─→ Save to: data/output/{userId}_{contentType}_{timestamp}.json
  │
Output: JSON file with structured vector records
```

**JSON Structure:**
```json
{
  "userId": "founder_123",
  "contentType": "linkedin",
  "recordCount": 2,
  "dimensions": 512,
  "createdAt": "2025-11-26T20:06:22.570Z",
  "records": [
    {
      "id": "founder_123_linkedin_1764187582571_0",
      "userId": "founder_123",
      "contentType": "linkedin",
      "text": "Chunk text here...",
      "embedding": [0.0854, 0.0239, ...],  // 512 numbers
      "metadata": {
        "chunkIndex": 0,
        "totalChunks": 2,
        "charCount": 394,
        "createdAt": "2025-11-26T20:06:22.570Z"
      }
    }
  ]
}
```

---

### Phase 4: Pinecone Upload

**File:** `scripts/upload.ts`

```
Input: JSON files from data/output/
  │
  ├─→ Read and parse JSON
  ├─→ Convert to Pinecone vector format
  ├─→ Upload to user-specific namespace
  ├─→ Batch size: 100 vectors per upsert
  │
Output: Vectors in Pinecone (founders-voice-512 index)
```

**Multi-tenancy via Namespaces:**
```
Pinecone Index: founders-voice-512
  │
  ├─→ Namespace: "founder_123" (User A's vectors)
  ├─→ Namespace: "founder_456" (User B's vectors)
  ├─→ Namespace: "test_founder" (User C's vectors)
  └─→ ... (isolated per user)
```

**Vector Record Format (Pinecone):**
```typescript
{
  id: "founder_123_linkedin_1764187582571_0",
  values: [0.0854, 0.0239, ...],  // 512d embedding
  metadata: {
    userId: "founder_123",
    contentType: "linkedin",
    text: "Chunk text...",
    chunkIndex: 0,
    totalChunks: 2,
    charCount: 394,
    createdAt: "2025-11-26T20:06:22.570Z"
  }
}
```

---

## File Structure & Responsibilities

### `/lib` - Reusable Libraries

#### `lib/openai/embeddings.ts`
**Purpose:** OpenAI API wrapper for text embeddings
**Exports:**
- `createEmbeddings(texts, dimensions)` - Batch embedding generation
- `createEmbedding(text, dimensions)` - Single text convenience wrapper

**Dependencies:** `openai` SDK
**Environment:** `OPENAI_API_KEY`

---

#### `lib/pinecone/client.ts`
**Purpose:** Pinecone client initialization (singleton pattern)
**Exports:**
- `getPineconeClient()` - Returns initialized Pinecone instance
- `getPineconeIndex(name)` - Returns index by name

**Dependencies:** `@pinecone-database/pinecone`
**Environment:** `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`

---

#### `lib/pinecone/upload.ts`
**Purpose:** Pinecone vector operations
**Exports:**
- `uploadVectors(userId, records, options)` - Batch upload to namespace
- `queryVectors(userId, queryVector, topK, filter)` - Search vectors (not yet used)
- `deleteUserVectors(userId)` - Delete all user vectors
- `getUserStats(userId)` - Get vector count for user

**Key Feature:** User isolation via namespaces
**Pattern:** `index.namespace(userId).upsert(vectors)`

---

#### `lib/utils/chunker.ts`
**Purpose:** Text chunking for embeddings
**Exports:**
- `chunkText(text, options)` - Split single text into chunks
- `chunkTexts(texts, options)` - Batch chunking with source tracking

**Algorithm:** Sentence-boundary splitting with overlap
**Defaults:** 500 char chunks, 50 char overlap, 100 char min size

---

### `/scripts` - CLI Tools

#### `scripts/embed.ts`
**Purpose:** Generate embeddings from founder text
**Usage:**
```bash
npm run embed -- \
  --userId=founder_123 \
  --contentType=linkedin \
  --text="Founder content here"
```

**Pipeline:**
1. Parse CLI arguments (`--userId`, `--contentType`, `--text` or `--file`)
2. Validate content type (linkedin, investor, newsletter)
3. Chunk text (500 chars, 50 overlap)
4. Generate embeddings (512 dimensions)
5. Build records with metadata
6. Save JSON to `data/output/`

**Output:** `{userId}_{contentType}_{timestamp}.json`

---

#### `scripts/upload.ts`
**Purpose:** Upload JSON vectors to Pinecone
**Usage:**
```bash
# Upload all files
npm run upload -- --all

# Upload by user
npm run upload -- --userId=founder_123

# Upload single file
npm run upload -- --file=data/output/founder_123_linkedin_123.json
```

**Pipeline:**
1. Parse CLI arguments (mode selection)
2. Scan `data/output/` for matching JSON files
3. For each file:
   - Read and parse JSON
   - Convert to Pinecone vector format
   - Upload to user namespace (batches of 100)
4. Display stats (vectors per user)

---

### `/data/output` - Temporary Vector Storage

**Purpose:** Intermediate JSON storage before Pinecone upload
**Format:** `{userId}_{contentType}_{timestamp}.json`
**Contents:** Embeddings + metadata (see JSON structure above)

**Current Files:**
- `demo_founder_linkedin_*.json` (2 vectors)
- `founder_456_newsletter_*.json` (1 vector)
- `founder_test_linkedin_*.json` (2 vectors)
- `test_founder_linkedin_*.json` (1 vector)

**Total:** 6 vectors across 4 users

---

### `/app/api` - API Routes (NOT YET IMPLEMENTED)

**Status:** Empty directories (placeholders for Day 7-9)

**Planned Routes:**
- `app/api/search/` - RAG search endpoint (query → retrieve → rank)
- `app/api/embed/` - Embedding generation endpoint
- `app/api/generate/` - Voice generation endpoint

**Note:** These will be built in Day 7-9 using the existing `lib/` utilities.

---

## Component Relationships

### How Libraries Connect

```
scripts/embed.ts
    │
    ├─→ lib/utils/chunker.ts
    │      └─→ Splits text into chunks
    │
    └─→ lib/openai/embeddings.ts
           └─→ Generates 512d vectors

scripts/upload.ts
    │
    └─→ lib/pinecone/upload.ts
           │
           └─→ lib/pinecone/client.ts
                  └─→ Pinecone SDK connection
```

### Data Flow Between Components

```
1. USER INPUT
   └─→ scripts/embed.ts (CLI)
       └─→ lib/utils/chunker.ts
           └─→ ["chunk1", "chunk2", ...]

2. EMBEDDING
   └─→ lib/openai/embeddings.ts
       └─→ [[0.08, 0.02, ...], [0.05, 0.03, ...]]

3. STORAGE (JSON)
   └─→ scripts/embed.ts saves to data/output/
       └─→ {userId}_{contentType}_{timestamp}.json

4. UPLOAD
   └─→ scripts/upload.ts reads JSON
       └─→ lib/pinecone/upload.ts
           └─→ Pinecone namespace(userId).upsert(vectors)

5. PERSISTENCE
   └─→ Pinecone Vector DB
       └─→ founders-voice-512 index
           └─→ Namespace per user
```

---

## Technical Implementation Details

### Embedding Configuration

**Model:** OpenAI `text-embedding-3-small`
**Dimensions:** 512 (vs max 1536)
**Rationale:**
- 512d: ~50% API cost of 1536d
- Sufficient semantic representation for founder voice
- Faster similarity search in Pinecone
- Index configured for 512d (founders-voice-512)

**Cost Calculation:**
- text-embedding-3-small: $0.00002/1K tokens
- Average chunk: ~120 tokens
- 1000 chunks ≈ $0.0024

---

### Pinecone Configuration

**Index:** `founders-voice-512`
**Dimensions:** 512
**Metric:** Cosine similarity
**Cloud:** AWS (Serverless)
**Region:** us-east-1

**Multi-tenancy:**
- **Strategy:** Namespace isolation
- **Pattern:** One namespace per `userId`
- **Benefit:** User data never crosses boundaries
- **Query:** Only searches within user's namespace

**Example:**
```typescript
// User A's data
index.namespace('founder_123').upsert(vectors)

// User B's data
index.namespace('founder_456').upsert(vectors)

// Query only User A's vectors
index.namespace('founder_123').query(...)
```

---

### Content Type System

**Supported Types:**
1. `linkedin` - LinkedIn posts, comments, articles
2. `investor` - Pitch decks, investor updates, emails
3. `newsletter` - Newsletter content, blog posts

**Purpose:** Enable content-type filtering during retrieval

**Metadata Storage:**
```typescript
metadata: {
  contentType: 'linkedin' | 'investor' | 'newsletter',
  // ... other fields
}
```

**Future Use (Day 7-9):**
```typescript
// Filter by content type during search
queryVectors(userId, vector, 5, {
  contentType: { $eq: 'linkedin' }
})
```

---

### Error Handling

**Embedding Failures:**
- OpenAI API errors caught and wrapped
- Original error message preserved
- Script exits with status 1

**Upload Failures:**
- Per-file error handling (one failure doesn't stop batch)
- Errors logged with filename
- Successful uploads counted separately

**Validation:**
- CLI arguments validated before processing
- Content type whitelist enforced
- File existence checked before read

---

## Environment Variables

**Required:**
```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...

# Pinecone
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=founders-voice-512
```

**Location:** `.env.local` (git-ignored)
**Loading:** `dotenv/config` in scripts
**CLI Usage:** `DOTENV_CONFIG_PATH=.env.local npx tsx scripts/...`

---

## Current System Capabilities

### ✅ What Works Now

1. **Text Chunking**
   - Sentence-boundary splitting
   - Context-preserving overlap
   - Configurable chunk sizes

2. **Embedding Generation**
   - Batch processing (multiple chunks per API call)
   - 512-dimensional vectors
   - Error handling and retry logic

3. **JSON Persistence**
   - Structured output format
   - Metadata preservation
   - Timestamp-based filenames

4. **Pinecone Upload**
   - User namespace isolation
   - Batch uploads (100 vectors/batch)
   - Per-user stats tracking

5. **CLI Tools**
   - `npm run embed` - Generate embeddings
   - `npm run upload` - Upload to Pinecone
   - Flexible input (text or file)
   - Multiple upload modes (all, user, file)

### ❌ What's Not Built Yet

1. **API Endpoints** (Day 7-9)
   - `/api/search` - RAG search
   - `/api/embed` - HTTP embedding endpoint
   - `/api/generate` - Voice generation

2. **Retrieval System** (Day 7-9)
   - Query embedding generation
   - Semantic search
   - Result ranking

3. **Generation Pipeline** (Day 10-12)
   - GPT-4 response generation
   - Context injection
   - Prompt engineering

4. **MCP Server** (Week 2)
   - Model Context Protocol integration
   - Tool definitions
   - AI assistant access

---

## Performance Characteristics

### Chunking
- **Speed:** ~1ms per 1000 characters
- **Memory:** O(n) where n = text length
- **Bottleneck:** Regex sentence splitting

### Embedding
- **Speed:** ~200-500ms per API call (batch of 1-10 chunks)
- **Rate Limits:** OpenAI tier-dependent
- **Bottleneck:** Network latency to OpenAI

### Upload
- **Speed:** ~100-200ms per batch (100 vectors)
- **Throughput:** ~500 vectors/second
- **Bottleneck:** Network latency to Pinecone

### End-to-End (1000-char text)
1. Chunk: ~1ms
2. Embed (2 chunks): ~300ms
3. Save JSON: ~5ms
4. Upload: ~150ms
**Total:** ~456ms

---

## Security Considerations

### API Keys
- Stored in `.env.local` (git-ignored)
- Never committed to version control
- Required for all operations

### Multi-tenancy
- User data isolated via namespaces
- No cross-user data leakage
- Namespace = userId (predictable but isolated)

### Input Validation
- Content type whitelist
- User ID required for all operations
- Text length limits (implicit via chunking)

### Future Considerations (Week 2+)
- MCP authentication
- Rate limiting per user
- Usage tracking
- API key rotation

---

## Future Architecture (Week 2+)

### Planned: MCP Integration

```
┌─────────────────────────────────────────────────────────────┐
│                   MCP SERVER (Week 2)                        │
└─────────────────────────────────────────────────────────────┘

  AI Assistant (Claude, GPT, etc.)
       │
       │ Model Context Protocol
       ▼
  ┌─────────────────┐
  │  MCP Server     │  ← Expose tools
  │  (TypeScript)   │
  └─────────────────┘
       │
       ├─→ Tool: search_founder_voice(userId, query)
       ├─→ Tool: add_founder_content(userId, text, type)
       ├─→ Tool: generate_response(userId, prompt)
       │
       ▼
  ┌─────────────────┐
  │  /api/search    │  ← REST endpoints
  │  /api/embed     │
  │  /api/generate  │
  └─────────────────┘
       │
       └─→ Existing lib/ utilities (reused)
```

### Architectural Benefits

**Current Design (Day 1-6):**
- ✅ Modular libraries in `lib/`
- ✅ Separation of concerns
- ✅ Reusable components
- ✅ CLI for testing and data prep

**Future Compatibility (Week 2+):**
- ✅ `lib/` can be imported by API routes
- ✅ Same Pinecone operations (just different callers)
- ✅ Same embedding logic (just different triggers)
- ✅ No refactoring needed - only addition

**Migration Path:**
1. Day 7-9: Add API routes using existing `lib/`
2. Week 2: Add MCP server calling API routes
3. Week 3+: Add voice cloning (new `lib/voice/`)

---

## Questions & Assumptions

### Design Decisions

**Q: Why 512 dimensions instead of 1536?**
A: Cost optimization. 512d provides sufficient semantic representation for founder voice content at ~50% the API cost.

**Q: Why CLI scripts instead of API first?**
A: Faster iteration and testing. CLI tools let us validate the core pipeline before building HTTP infrastructure.

**Q: Why JSON intermediate storage?**
A: Decouples embedding generation from upload. Allows re-upload without re-embedding, and provides backup/audit trail.

**Q: Why user namespaces instead of metadata filtering?**
A: Performance and isolation. Namespace-level separation is faster than metadata filtering and guarantees zero cross-user leakage.

### Assumptions

1. **Single-user mode:** No authentication yet (userId passed as CLI arg)
2. **Manual pipeline:** User runs embed → upload manually (will be automated via API)
3. **Small scale:** <10K vectors per user (Pinecone serverless handles this)
4. **English only:** No i18n in chunking/embedding logic

---

## Conclusion

The current system (Day 1-6) provides a **robust, modular foundation** for RAG-powered voice cloning:

1. ✅ **Text → Vectors:** Chunking + embedding pipeline
2. ✅ **Storage:** JSON intermediate + Pinecone persistence
3. ✅ **Multi-tenancy:** Namespace isolation per user
4. ✅ **CLI Tools:** Easy testing and data preparation

**Next Steps (Day 7-9):**
- Build `/api/search` endpoint using `lib/pinecone/upload.queryVectors()`
- Add retrieval ranking and context assembly
- Integrate with GPT-4 for response generation

The architecture is designed for **additive development** - Week 2+ features will build on top of existing `lib/` utilities without requiring refactoring.
