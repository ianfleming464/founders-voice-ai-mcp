# Founders Voice AI - Product Requirements
**Version:** MVP (30-Day Build)  
**Last Updated:** November 2025  
**Strategic Positioning:** MCP-native voice cloning infrastructure

---

## Executive Summary

Founders Voice AI helps startup founders maintain consistent, authentic communication by learning their voice from existing content. Unlike standalone writing tools, it exposes voice generation as **AI infrastructure** via Model Context Protocol (MCP), allowing founders to generate content directly from their AI assistants.

**Key Differentiator:** Not just another writing app - it's reusable infrastructure that AI agents can call.

---

## Core Value Propositions

1. **No Context Switching:** Founders generate content without leaving their workflow (Slack, Claude Desktop, email)
2. **True Voice Cloning:** Uses RAG to retrieve actual founder phrases, not generic AI writing
3. **Infrastructure Play:** MCP server that other apps/agents can consume
4. **Fast Setup:** Train voice in <30 seconds with existing content

---

## Target Users (MVP)

**Primary:** Solo founders / indie hackers (Seed stage)
- Writing investor updates, hiring posts, newsletters
- Already using AI assistants (Claude, ChatGPT)
- Want authentic voice without spending hours writing

**Secondary (Month 2+):** Small teams needing multiple voice profiles (CEO, CMO, etc.)

---

## Core Features

### 1. Voice Training System
**Input Methods (MVP - Text Only):**
- Copy-paste text interface
- Minimum 1,000 words required
- Maximum 50,000 words per session

**Processing:**
- Chunks content into ~500 character segments
- Generates embeddings (OpenAI text-embedding-3-small)
- Stores in Pinecone with metadata
- Single voice profile per user (MVP)

**No File Uploads:** Plain text only for MVP simplicity

---

### 2. Content Generation (3 Templates)

**Template 1: LinkedIn Post**
- Parameters: `topic`, `tone` (professional/casual)
- Output: 150-300 words
- Uses RAG to retrieve relevant founder phrases

**Template 2: Monthly Investor Update**
- Parameters: `key_points` (array), `month`
- Output: 400-600 words
- Structured format: Progress, Metrics, Challenges, Next Steps

**Template 3: Hiring Post**
- Parameters: `role`, `key_requirements`, `company_stage`
- Output: 200-400 words
- Authentic founder voice describing opportunity

---

### 3. MCP Server (The Killer Feature)

**Architecture:**
- Separate Node.js process (not part of Next.js app)
- Exposes 3 tools (matching templates above)
- HTTP transport for remote access (stdio for local dev)

**Tools Exposed:**
```typescript
generate_linkedin_post(topic: string, tone: "professional" | "casual")
draft_investor_update(key_points: string[], month: string)
write_hiring_post(role: string, requirements: string, stage: string)
```

**Integration Points:**
- Claude Desktop
- Cursor IDE
- Any MCP-compatible client

**Authentication:**
- API key per user
- Passed via MCP client config

---

### 4. Demo Mode

**Pre-loaded Founder:**
- Naval Ravikant (public content: tweets, blog posts)
- ~20,000 words pre-processed
- No signup required to try

**User Flow:**
1. Land on homepage
2. Click "Try Naval's Voice"
3. Select template
4. Fill in 2-3 fields
5. Generate instantly
6. See authentic Naval-style output
7. CTA: "Create Your Own Voice"

---

## User Journeys

### First-Time User
1. Sign up (email + password)
2. See prompt: "Paste 1,000+ words of your writing"
3. Paste content (blog posts, tweets, etc.)
4. Click "Train Voice" (20-30 second processing)
5. Receive MCP credentials (API key + server URL)
6. Follow setup guide to configure Claude Desktop
7. Test: Ask Claude to write something in their voice

### Returning User (via MCP)
1. Already configured in Claude Desktop
2. Open Claude
3. Prompt: "Write a LinkedIn post about our new feature in my voice"
4. Claude calls MCP server → retrieves context → generates
5. User reviews, copies, posts

---

## Technical Constraints (MVP)

**Scope Decisions:**
- Text-only input (no PDF parsing, web scraping in MVP)
- 3 templates only (no custom templates)
- Single output (no A/B comparison)
- Desktop-first UI (mobile responsive but not optimized)
- No team features (one user = one voice)

**Performance Targets:**
- Voice training: <30 seconds
- Content generation: <5 seconds
- MCP tool response: <3 seconds
- Page load: <2 seconds

**Security:**
- HTTPS only
- API key authentication
- Input sanitization
- Rate limiting: 10 generations/min per user

---

## Out of Scope (Explicitly NOT Building)

❌ Web scraping for content  
❌ File uploads (PDF, DOCX)  
❌ Custom template builder  
❌ Team collaboration features  
❌ Output comparison/editing  
❌ Mobile app  
❌ Voice profile versioning  
❌ Content scheduling/publishing  

---

## Success Metrics (30 Days)

**Technical:**
- MCP server uptime: >99%
- Average generation quality: 4+/5 user rating
- Voice training success rate: >95%

**Business:**
- 5-10 pilot users
- 2-3 paying customers
- $100-150 MRR
- <5% churn in first month

**Product:**
- Users generate 10+ pieces of content
- NPS score: 50+
- Setup time: <10 minutes (signup to first generation)

---

## Pricing (Launch)

**Early Adopter Tier:** $49/mo
- Personal voice cloning
- MCP server access
- 100 generations/month
- Email support

**Future Tiers (Not MVP):**
- Teams: $199/mo (multiple voices)
- Enterprise: $999/mo (custom MCP servers)

---

## Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Deployed on Vercel

**Backend:**
- Next.js API Routes (for web interface)
- Separate MCP Server (Node.js + TypeScript)
- Deployed on Railway/Render

**AI/Data:**
- OpenAI API (embeddings + generation)
- Pinecone (vector database)
- Model: text-embedding-3-small (embeddings)
- Model: gpt-4-turbo (generation)

**Auth:**
- Clerk (handles API key generation)
- Or simple JWT if keeping it lean

---

## Reference Implementation

This project uses [projectshft/cringe-influencer](https://github.com/projectshft/cringe-influencer) as a technical reference for:
- Embedding pipeline structure
- Pinecone upload scripts
- RAG retrieval patterns
- Next.js API route organization

**Key Difference:** We add MCP layer on top, making it infrastructure vs standalone app.

---

## Next Steps After MVP

1. **Add Shopify MCP Server** (leverage your expertise)
2. **Build MCP Marketplace** (package pre-built integrations)
3. **Team Features** (multiple voice profiles)
4. **Custom Templates** (user-defined)
5. **Analytics Dashboard** (track generation usage)

**The goal: Become the Stripe of AI voice generation - infrastructure, not just a product.**
