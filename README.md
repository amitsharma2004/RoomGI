# Rental Truth - Property Review Platform

A hackathon project that brings transparency to rental properties through tenant reviews and deposit tracking.

## Features Implemented

### Level 1 - Core Features (Complete)
- User Authentication - Email/password login with tenant/owner roles
- Property Creation - Owners can add properties with location, rent, type

### Level 2 - Differentiator (Complete)  
- Tenant Reviews - Rate deposit return & reality (1-5 stars)
- Deposit Honesty Score - Automatic calculation (Yes=100, Partial=50, No=0)
- Property Stats - Real-time scoring and review aggregation

### Level 3 - Wow Factor (Complete)
- Scam & Red-Flag System - Report problematic properties
- Warning Levels - Automatic risk assessment (2+ flags = warning, 5+ = danger)

## Tech Stack

- **Backend**: Node.js + TypeScript + Express
- **Database**: PostgreSQL with migrations
- **Authentication**: JWT tokens (ready for Firebase integration)
- **Architecture**: Modular service-based design

## Database Schema

```sql
- users (id, email, role, password_hash)
- properties (id, owner_id, location, rent, property_type, verified)
- reviews (id, user_id, property_id, deposit_status, reality_rating, comment)
- flags (id, user_id, property_id, reason, description)
```

## Quick Start

### 1. Setup Database
```bash
# Install PostgreSQL and create database
createdb rental_truth

# Run migrations and seed data
npm run db:reset
```

### 2. Environment Setup
```bash
# Update .env file
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rental_truth
DB_USER=your_user
DB_PASSWORD=your_password
```

### 3. Start Development
```bash
npm install
npm run dev
# Server runs on http://localhost:3000
```

## API Endpoints

### Authentication
```bash
POST /api/auth/register - Register user
POST /api/auth/login    - Login user
```

### Properties  
```bash
GET  /api/properties           - Search properties
GET  /api/properties/:id       - Get property with stats
POST /api/properties           - Create property (owners only)
GET  /api/properties/my        - Get my properties (owners only)
```

### Reviews
```bash
POST /api/reviews                    - Submit review (tenants only)
GET  /api/reviews/property/:id       - Get property reviews
GET  /api/reviews/property/:id/scores - Get deposit & reality scores
GET  /api/reviews/my                 - Get my reviews
```

### Flags (Red Flag System)
```bash
POST /api/flags                 - Report property issue
GET  /api/flags/property/:id    - Get property flag status
GET  /api/flags/reasons         - Get available flag reasons
```

## Example Usage

### 1. Register as Tenant
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"tenant@example.com","password":"password","role":"tenant"}'
```

### 2. Submit Property Review
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"propertyId":"PROPERTY_ID","depositStatus":"yes","realityRating":5,"comment":"Great landlord!"}'
```

### 3. Flag Problematic Property
```bash
curl -X POST http://localhost:3000/api/flags \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"propertyId":"PROPERTY_ID","reason":"deposit_scam","description":"Landlord kept deposit unfairly"}'
```

## Hackathon Implementation Status

| Feature | Status | Priority |
|---------|--------|----------|
| User Auth | Complete | Level 1 |
| Property CRUD | Complete | Level 1 |
| Review System | Complete | Level 2 |
| Deposit Scoring | Complete | Level 2 |
| Flag System | Complete | Level 3 |
| Database Integration | Complete | Core |
| API Documentation | Complete | Core |

## Next Steps (If Time Permits)

1. **Frontend UI** - React/Next.js Property History Cards
2. **Admin Verification** - Property verification badge system  
3. **Firebase Auth** - Replace JWT with Firebase Authentication
4. **Real-time Updates** - WebSocket notifications for new reviews/flags
5. **Advanced Search** - Filters, sorting, map integration

## Deployment Ready

The API is production-ready with:
- TypeScript for type safety
- PostgreSQL for data persistence  
- Modular architecture for scalability
- Error handling and validation
- Database migrations and seeding
- Comprehensive API documentation

Perfect for demo and further development!