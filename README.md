# RoomGI - Property Review Platform

A modern property rental platform with transparent reviews and real-time features.

## Features

- 🏠 **Property Listings** - Browse and search rental properties
- ⭐ **Verified Reviews** - Authentic reviews from real tenants
- 💰 **Deposit Transparency** - See deposit return rates
- 📍 **Location Mapping** - Interactive maps with property locations
- 🔄 **Real-time Updates** - Live viewing counts and availability
- 📱 **Responsive Design** - Works on all devices
- 🔐 **Secure Authentication** - JWT-based user authentication

## Tech Stack

### Backend
- **Node.js** with TypeScript
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Socket.io** - Real-time communication
- **Cloudinary** - Image storage
- **JWT** - Authentication

### Frontend
- **React** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Leaflet** - Maps

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd roomgi
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL=postgres://postgres:postgres123@localhost:5432/roomgi
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres123
DB_NAME=roomgi

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Server
PORT=3001
NODE_ENV=production

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Production Deployment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Development Mode
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development services
docker-compose -f docker-compose.dev.yml down
```

## Manual Setup (Without Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Backend Setup
```bash
# Install dependencies
npm install

# Set up environment variables (create .env file)
cp .env.example .env

# Run database migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev
```

### Frontend Setup
```bash
cd client

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:3001" > .env

# Start development server
npm run dev
```

## Docker Services

### Production (`docker-compose.yml`)
- **database**: PostgreSQL 15 with persistent data
- **backend**: Node.js API server (port 3001)
- **frontend**: Nginx serving React app (port 80)

### Development (`docker-compose.dev.yml`)
- **database**: PostgreSQL 15 with persistent data
- **backend**: Node.js with hot reload (port 3001)
- **frontend**: Vite dev server with hot reload (port 5173)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Properties
- `GET /api/properties` - List all properties
- `POST /api/properties` - Create property (owners only)
- `GET /api/properties/:id` - Get property details
- `PATCH /api/properties/:id/availability` - Update availability

### Reviews
- `GET /api/reviews/property/:id` - Get property reviews
- `POST /api/reviews` - Create review

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `PORT` | Backend server port | 3001 |
| `NODE_ENV` | Environment mode | development |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - |

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts (tenants and owners)
- `properties` - Property listings
- `reviews` - Property reviews and ratings
- `flags` - Property flags/reports
- `bookings` - Booking requests

## Development

### Database Commands
```bash
# Test database connection
npm run db:test

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Reset database
npm run db:reset
```

### Docker Commands
```bash
# Build images
docker-compose build

# View container logs
docker-compose logs [service-name]

# Execute commands in container
docker-compose exec backend npm run db:migrate
docker-compose exec database psql -U postgres -d roomgi

# Remove all containers and volumes
docker-compose down -v
```

## Health Checks

All services include health checks:
- **Backend**: `GET /health` - Database connectivity
- **Frontend**: HTTP 200 response
- **Database**: PostgreSQL ready check

## Production Considerations

1. **Environment Variables**: Use secure values for JWT_SECRET
2. **Database**: Use managed PostgreSQL service
3. **Images**: Configure Cloudinary for image storage
4. **SSL**: Use reverse proxy (nginx/traefik) for HTTPS
5. **Monitoring**: Add logging and monitoring solutions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request