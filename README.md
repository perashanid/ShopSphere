# E-commerce Backend Server

Modern, secure backend API for the e-commerce website built with Node.js, Express, and MongoDB.

## Features

- **Express.js** server with comprehensive middleware setup
- **MongoDB** database with Mongoose ODM
- **JWT Authentication** with refresh tokens
- **Security** middleware (Helmet, CORS, Rate limiting)
- **Error handling** with custom error middleware
- **Validation** using express-validator
- **Logging** with Morgan
- **Compression** for optimized responses
- **Environment-based configuration**

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment variables:**
   Copy `.env.example` to `.env` and configure your settings:
   ```bash
   cp .env.example .env
   ```

3. **Start MongoDB:**
   Make sure MongoDB is running on your system or update `MONGODB_URI` in `.env`

4. **Test database connection:**
   ```bash
   npm run test:db
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:db` - Test database connection
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## API Endpoints

### Health Check
- `GET /health` - Server health status

### API Info
- `GET /api` - API information and status

## Project Structure

```
src/
├── config/          # Configuration files
│   ├── config.js    # App configuration
│   └── database.js  # Database connection
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
│   ├── auth.js      # Authentication middleware
│   ├── errorHandler.js # Error handling
│   └── validation.js   # Validation middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic services
├── utils/           # Utility functions
│   ├── asyncHandler.js # Async error handling
│   ├── response.js     # Response utilities
│   └── testConnection.js # DB connection test
└── index.js         # Server entry point
```

## Environment Variables

See `.env.example` for all required environment variables.

## Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate limiting** - Prevent abuse
- **JWT** - Secure authentication
- **Input validation** - Prevent malicious input
- **Error handling** - Secure error responses

## Next Steps

1. Implement data models (Product, User, Order, Category)
2. Create authentication system
3. Build API endpoints for products, users, orders
4. Add payment processing integration
5. Implement caching with Redis