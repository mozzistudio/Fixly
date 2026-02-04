# Fixly

> Repair smarter. Not harder.

Fixly is a modern, AI-powered repair shop management platform. It handles ticket creation, device diagnostics, customer communication via WhatsApp, invoicing, inventory, and reporting.

## Features

- **Ticket Management**: Create, track, and manage repair tickets with Kanban board and list views
- **AI Diagnostics**: Automated device diagnosis and repair estimates using Claude AI
- **WhatsApp Integration**: Two-way customer communication with AI-suggested replies
- **Customer Management**: Track customers, their devices, and repair history
- **Inventory Management**: Parts tracking with low-stock alerts
- **Invoicing & Payments**: Generate invoices, record payments, track revenue
- **Reporting**: Revenue, technician performance, and ticket analytics
- **Multi-tenant**: Support for multiple repair shops with isolated data

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand + TanStack Query
- **UI Components**: Radix UI primitives

### Backend
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Real-time**: Socket.io
- **AI**: Anthropic Claude API

### Infrastructure
- **Monorepo**: Turborepo + pnpm workspaces
- **Containerization**: Docker + Docker Compose

## Project Structure

```
fixly/
├── apps/
│   └── web/                    # Next.js web app
├── packages/
│   ├── api/                    # Backend API
│   │   └── prisma/             # Database schema and migrations
│   ├── core/                   # Shared types, validators, constants
│   └── ui/                     # Design system tokens
├── docker-compose.yml
├── turbo.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose (for database)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/fixly.git
cd fixly
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the database:
```bash
docker-compose up -d postgres redis
```

4. Set up environment variables:
```bash
cp .env.example .env
```

5. Generate Prisma client and run migrations:
```bash
cd packages/api
pnpm db:generate
pnpm db:push
pnpm db:seed
```

6. Start the development servers:
```bash
# In the root directory
pnpm dev
```

The web app will be available at http://localhost:3000 and the API at http://localhost:4000.

### Demo Credentials

After seeding the database, you can log in with:
- **Email**: admin@techfixpro.com
- **Password**: password123

## Development

### Commands

```bash
# Start all services in development
pnpm dev

# Build all packages
pnpm build

# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Database commands (from packages/api)
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema to database
pnpm db:migrate     # Run migrations
pnpm db:seed        # Seed sample data
pnpm db:studio      # Open Prisma Studio
```

### Docker

Run the entire stack with Docker:
```bash
docker-compose up
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `NEXTAUTH_SECRET` | Secret for JWT signing |
| `ANTHROPIC_API_KEY` | API key for Claude AI |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Business phone ID |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp API access token |

## API Documentation

The API follows REST conventions. Key endpoints:

- `POST /api/auth/login` - User authentication
- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket
- `POST /api/tickets/:id/ai/diagnose` - AI diagnosis
- `GET /api/customers` - List customers
- `GET /api/inventory` - List inventory items
- `POST /api/invoices` - Create invoice
- `POST /api/whatsapp/send` - Send WhatsApp message

## Design System

Fixly uses a custom design system with the following colors:

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#6C3BF5` | Main actions, CTAs |
| Secondary | `#00D4AA` | Success states |
| Accent | `#FF6B35` | Urgent/warnings |
| Surface | `#FAFBFC` | Card backgrounds |
| Danger | `#EF4444` | Destructive actions |

## License

MIT License - see LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact support@fixly.app.
