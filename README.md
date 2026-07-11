# GrowEasy CRM — AI-Powered CSV Importer

A production-ready SaaS application that accepts **any** CSV file and uses **Gemini AI** to intelligently map arbitrary columns into a fixed CRM schema.

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-green?logo=express&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-orange?logo=google&logoColor=white)

---

## ✨ Features

- **AI-Powered Field Mapping** — Upload CSVs from Facebook Leads, Google Ads, real estate platforms, or any source. Gemini AI intelligently maps columns to CRM fields.
- **Zero Manual Column Matching** — No need to manually map columns. The AI understands synonyms, abbreviations, and varied naming conventions.
- **Smart Data Normalization** — Automatic phone number parsing (country code extraction), date normalization, name formatting, and address decomposition.
- **Streaming Progress** — Real-time SSE-based progress tracking with batch-by-batch updates.
- **Download Results** — Export mapped data as JSON or CSV.
- **Dark Mode** — Full dark/light mode support.
- **Responsive Design** — Optimized for desktop, tablet, and mobile.
- **Error Resilience** — Retry logic with exponential backoff for Gemini API failures.

---

## 🏗️ Architecture

```
┌──────────────────┐     ┌──────────────────────┐     ┌──────────────┐
│   Next.js 15     │────▶│   Express Backend     │────▶│  Gemini AI   │
│   Frontend       │◀────│   (TypeScript)        │◀────│  2.5 Flash   │
│   - Upload       │ SSE │   - Validate CSV      │     │              │
│   - Preview      │     │   - Batch rows (×25)  │     │  - Map fields│
│   - Progress     │     │   - Merge results     │     │  - Normalize │
│   - Results      │     │   - Stream progress   │     │  - Validate  │
└──────────────────┘     └──────────────────────┘     └──────────────┘
```

### CRM Schema

| Field | Description |
|-------|-------------|
| `created_at` | ISO 8601 date/time |
| `name` | Full name |
| `email` | Primary email |
| `country_code` | Phone country code (e.g., +91) |
| `mobile_without_country_code` | Phone number |
| `company` | Company name |
| `city` | City |
| `state` | State/Province |
| `country` | Country |
| `lead_owner` | Assigned salesperson |
| `crm_status` | Enum: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE |
| `crm_note` | Free-text notes |
| `data_source` | Enum: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots |
| `possession_time` | Timeline |
| `description` | Lead description |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- [Gemini API Key](https://aistudio.google.com/apikey)

### 1. Clone the repository

```bash
git clone <repo-url>
cd groweasy-crm-importer
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and the backend at `http://localhost:3001`.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | Frontend URL | `http://localhost:3000` |
| `GEMINI_API_KEY` | Your Gemini API key | **Required** |
| `MAX_FILE_SIZE_MB` | Max upload size | `10` |
| `AI_BATCH_SIZE` | Rows per AI batch | `25` |
| `AI_MAX_RETRIES` | Max retry attempts | `3` |
| `AI_RETRY_DELAY_MS` | Base retry delay | `1000` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend URL | `http://localhost:3001` |

---

## 📡 API Documentation

### `POST /api/import`

Upload a CSV file for AI-powered CRM field mapping.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` (CSV file, max 10MB)

**Response:** Server-Sent Events (SSE) stream

```
data: {"type":"progress","batchIndex":1,"totalBatches":4,"message":"Processing batch 1 of 4..."}
data: {"type":"progress","batchIndex":2,"totalBatches":4,"message":"Batch 2/4 complete: 25 records, 0 skipped"}
data: {"type":"complete","result":{"records":[...],"skipped":[...],"summary":{"total":100,"imported":95,"skipped":5}}}
```

### `POST /api/import/cancel`

Cancel an active import.

**Request:**
```json
{ "importId": "import_1234567890" }
```

### `GET /api/health`

Health check endpoint.

**Response:**
```json
{ "status": "healthy", "timestamp": "2024-01-01T00:00:00.000Z", "uptime": 123.45 }
```

---
