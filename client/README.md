# Property Management Client

A React application for property management with role-based authentication.

## Features

- **Authentication System**: Login/Register with JWT tokens
- **Role-based Access**: Tenant and Owner roles with different permissions
- **Protected Routes**: Automatic redirects based on authentication status
- **Responsive Design**: Built with Tailwind CSS
- **Type Safety**: Full TypeScript support

## Tech Stack

- React 19 with TypeScript
- React Router DOM v6 for routing
- Axios for API calls
- Tailwind CSS for styling
- Vite for development and building

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy .env file and update VITE_API_URL if needed
VITE_API_URL=http://localhost:3000
```

3. Start development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Navbar.tsx      # Navigation component
│   └── ProtectedRoute.tsx # Route protection
├── context/            # React Context providers
│   └── AuthContext.tsx # Authentication state management
├── lib/               # Utility libraries
│   └── axios.ts       # Axios configuration
├── pages/             # Page components
│   ├── HomePage.tsx   # Dashboard page
│   ├── LoginPage.tsx  # Login form
│   └── RegisterPage.tsx # Registration form
├── types/             # TypeScript type definitions
│   └── index.ts       # Shared types
└── App.tsx            # Main application component
```

## Authentication Flow

1. **Registration**: Users select role (tenant/owner) and create account
2. **Login**: Email/password authentication with JWT token
3. **Token Storage**: Tokens stored in localStorage with automatic refresh
4. **Role-based Routing**: Different access levels for tenants vs owners
5. **Auto-logout**: Automatic logout on token expiration

## Available Routes

- `/login` - Login page (public)
- `/register` - Registration page (public)
- `/` - Dashboard (protected)
- `/add-property` - Add property form (owner only)

## API Integration

The client is configured to work with the backend API:
- Base URL: `VITE_API_URL` environment variable
- Authentication: Bearer token in Authorization header
- Error handling: Automatic logout on 401 responses