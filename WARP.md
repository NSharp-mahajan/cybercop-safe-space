# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

CyberCop Safe Space is a comprehensive cybersecurity platform built with React + TypeScript + Vite on the frontend and Supabase as the backend. The application provides tools for FIR (First Information Report) generation, scam detection, AI-powered chat assistance, and community-driven security solutions.

## Common Development Commands

### Frontend Development
```powershell
# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development environment
npm run build:dev

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

### Supabase Backend
```powershell
# Start local Supabase stack
supabase start

# Stop local Supabase stack
supabase stop

# Reset local database
supabase db reset

# Generate TypeScript types from database
supabase gen types typescript --local > src/integrations/supabase/types.ts

# Create new migration
supabase migration new <migration_name>

# Apply migrations
supabase db push

# Deploy edge functions
supabase functions deploy <function_name>
```

### Testing Individual Components
```powershell
# Run specific page/component in development
# Navigate to specific routes after starting dev server:
# http://localhost:8080/fir-generator
# http://localhost:8080/chat
# http://localhost:8080/dashboard
# http://localhost:8080/password-checker
# http://localhost:8080/ocr-fraud
```

## Architecture Overview

### Frontend Structure
- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: Radix UI primitives with ShadCN/UI components
- **Styling**: Tailwind CSS with custom cyber-themed colors and glow effects
- **State Management**: React Query for server state, React hooks for local state
- **Routing**: React Router with layout-based structure
- **Form Handling**: React Hook Form with Zod validation

### Backend Structure
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth (supports anonymous sessions)
- **Edge Functions**: Deno-based serverless functions for AI chat, OCR, URL checking
- **Real-time**: Supabase real-time subscriptions for live updates

### Key Application Features
1. **FIR Generator**: Multi-language support for police report generation
2. **AI Chat Assistant**: GPT-4 powered cybersecurity guidance with fallback responses
3. **Scam Detection**: URL checking and community reporting
4. **OCR Fraud Detection**: Document analysis for fraudulent content
5. **Password Security**: Strength checking and security recommendations
6. **Community Reports**: Shared scam database and user contributions

### Database Schema
- `fir_reports`: Police reports with RLS policies for user/anonymous access
- `chats` & `chat_messages`: AI conversation history
- `scam_reports`: Community-submitted scam data
- `users`: Extended user profiles (linked to Supabase auth)

### Component Architecture
```
src/
├── pages/           # Route-based page components
├── components/      # Reusable UI components
│   ├── ui/         # ShadCN/UI primitive components
│   └── Layout/     # App layout components
├── services/       # Business logic and API calls
├── hooks/          # Custom React hooks
├── lib/           # Utility functions
└── integrations/  # External service integrations
    └── supabase/  # Database client and types
```

### Supabase Edge Functions
- `chat`: AI-powered cybersecurity assistance
- `url-check`: Malicious URL detection
- `scam-report`: Community scam reporting
- `ocr-fraud-detection`: Document fraud analysis

## Development Guidelines

### Working with Supabase
- All database operations use TypeScript-generated types from `src/integrations/supabase/types.ts`
- RLS policies ensure data isolation between users and anonymous sessions
- Edge functions handle AI integrations and heavy processing
- Local development uses Supabase CLI with Docker containers

### Styling Conventions
- Uses cyber-themed design system with neon colors and glow effects
- Custom Tailwind classes: `glow-primary`, `glow-accent`, `gradient-primary`, `gradient-dark`
- Responsive design with mobile-first approach
- Dark mode support through CSS variables

### State Management Patterns
- Server state managed by React Query with automatic caching and invalidation
- Form state handled by React Hook Form with Zod schemas
- Global UI state (toasts, modals) through context providers
- Authentication state managed by Supabase client

### Authentication Flow
- Supports both authenticated users and anonymous sessions
- Anonymous users get temporary UUIDs for session tracking
- FIR submissions work for both user types with appropriate data isolation

### Adding New Features
1. Create database migration if needed: `supabase migration new feature_name`
2. Update TypeScript types: `supabase gen types typescript --local`
3. Add service layer functions in `src/services/`
4. Create React components in appropriate directories
5. Add routing in `App.tsx` if needed
6. Update Supabase RLS policies for data access control

### Environment Configuration
- Local development uses `.env` file (not committed)
- Supabase configuration in `supabase/config.toml`
- Vite configuration supports absolute imports with `@/` prefix

### Testing Approach
- Manual testing through development server
- Component testing should focus on form validation and user interactions
- Integration testing important for Supabase operations and Edge functions
- Mock services available for offline development (e.g., `mockChatService.ts`)
