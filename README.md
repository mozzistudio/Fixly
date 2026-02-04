# Fixly

AI-powered repair shop platform that connects customers with trusted local repair shops through intelligent diagnostics.

## Features

- **AI-Powered Diagnostics**: Get instant analysis of repair needs with cost estimates and recommended actions
- **Smart Chat Assistant**: 24/7 AI chat support for repair-related questions
- **Verified Shop Network**: Connect with vetted local repair shops
- **Real-time Tracking**: Monitor repair progress from submission to completion
- **User Reviews**: Read authentic reviews to find the best repair services

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **AI Integration**: OpenAI GPT-4

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/fixly.git
cd fixly
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Random secret for auth
- `OPENAI_API_KEY`: Your OpenAI API key

4. Set up the database:
```bash
npm run db:generate
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── repair-requests/ # Repair request CRUD
│   │   ├── shops/        # Shop management
│   │   └── reviews/      # Review system
│   ├── auth/             # Auth pages (signin, register)
│   ├── repairs/          # Repair request pages
│   ├── shops/            # Shop discovery pages
│   └── how-it-works/     # Info pages
├── components/            # React components
├── lib/                   # Utility functions
│   ├── ai/               # AI diagnosis service
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Database client
│   └── validations.ts    # Zod schemas
└── prisma/
    └── schema.prisma     # Database schema
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Repair Requests
- `GET /api/repair-requests` - List user's repair requests
- `POST /api/repair-requests` - Create new repair request with AI diagnosis
- `GET /api/repair-requests/[id]` - Get repair request details
- `PATCH /api/repair-requests/[id]` - Update repair request
- `DELETE /api/repair-requests/[id]` - Delete repair request
- `POST /api/repair-requests/[id]/chat` - Chat with AI about repair

### Shops
- `GET /api/shops` - List repair shops with filters
- `POST /api/shops` - Register a new shop
- `GET /api/shops/[id]` - Get shop details
- `PATCH /api/shops/[id]` - Update shop info
- `DELETE /api/shops/[id]` - Delete shop

### Reviews
- `POST /api/reviews` - Submit a review

## Database Schema

Key models:
- **User**: Customers and shop owners
- **Shop**: Repair shop profiles with specialties
- **RepairRequest**: Customer repair requests with AI diagnosis
- **Message**: Chat messages for repair requests
- **Review**: Customer reviews for completed repairs

## License

MIT
