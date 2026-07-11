# GrowEasy CRM Backend

AI-powered CSV import engine built with Express, TypeScript, and Gemini AI.

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your Gemini API key to .env
# GEMINI_API_KEY=your_key_here

# Development
npm run dev

# Production build
npm run build
npm start
```

## Architecture

```
src/
├── ai/              # Gemini AI integration
│   ├── prompt.ts    # System + user prompt engineering
│   ├── geminiClient.ts  # API client with retry logic
│   └── responseParser.ts  # Response validation
├── config/          # Environment configuration
├── controllers/     # Route handlers
├── middleware/       # Express middleware (upload, errors, rate limiting)
├── routes/          # Express routes
├── services/        # Business logic (import pipeline)
├── types/           # TypeScript type definitions
├── utils/           # Utilities (CSV parsing, batching, logging)
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/import` | Upload CSV for AI mapping (SSE stream) |
| POST | `/api/import/cancel` | Cancel active import |
| GET | `/api/health` | Health check |

## Environment Variables

See [.env.example](.env.example) for all available configuration options.

## Deployment

Configured for Railway deployment. See `railway.json` for configuration.
