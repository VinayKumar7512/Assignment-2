# GrowEasy CRM Frontend

Modern SaaS UI for AI-powered CSV import, built with Next.js 15, TypeScript, TailwindCSS, and shadcn/ui.

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Development
npm run dev

# Production build
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4 + shadcn/ui
- **Tables**: TanStack Table
- **Upload**: react-dropzone
- **CSV Parsing**: PapaParse
- **HTTP**: Axios
- **Icons**: Lucide Icons
- **Theming**: next-themes (dark mode)
- **Toasts**: Sonner

## Components

| Component | Description |
|-----------|-------------|
| `Hero` | Landing section with CTA |
| `UploadCard` | Drag & drop CSV upload |
| `CsvPreview` | TanStack Table with sorting, pagination |
| `ImportProgress` | SSE-driven progress bar |
| `ResultsTable` | AI-mapped results with tabs |
| `SummaryCards` | Animated import statistics |
| `Header` | Navigation with dark mode toggle |
| `Footer` | Footer with AI status |

## Custom Hooks

| Hook | Description |
|------|-------------|
| `useCsvParser` | Client-side CSV parsing with PapaParse |
| `useImport` | Import lifecycle management with SSE |

## Environment Variables

See [.env.example](.env.example).

## Deployment

Optimized for Vercel deployment. Simply import the `frontend` directory as a Vercel project.
