# Notes API Project

A production-ready RESTful multi-user Notes App API using Node.js, Express, and MongoDB.

## Features Built-In
* **Controller-Service-Route Architecture:** Clean separation of business logic and routing.
* **Authentication:** Secure Registration/Login using JWT and `bcrypt` password hashing.
* **Security:** Powered by `helmet`, `cors`, and `express-rate-limit` to prevent abuse.
* **Payload Validation:** Strict typed validation on all routes via `zod`.
* **MongoDB Querying:** Advanced Mongoose integrations including Pagination, Tag Filtering, Array Updates (Sharing), and `$text` searching.
* **OpenAPI Documentation:** Endpoints perfectly documented at `/openapi.json`.
* **Global Error Handling:** Centralized middleware logic for API resiliency.

## Setup & Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Rename `.env.example` to `.env` and provide your MongoDB connection string and JWT secret:
   ```env
   PORT="3000"
   MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/notes-db"
   JWT_SECRET="YOUR_SUPER_SECRET_KEY"
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   *(Server starts at `http://localhost:3000`)*

## Running the Automated Test Suite

We have provided a comprehensive End-to-End API Test Script that acts as a real client. It connects to your locally running server, performs a lifecycle of actions (registering, authenticating, creating/updating notes, text searching, etc.), and ensures your MongoDB instance is accurately persisting data.

**Requirements:** Your API Server must be running first!

Open a completely new terminal window and run:
```bash
npm run test
```

## API Routes

### Authentication Routes
- **`POST /register`** - Register a new user
  - Validation: `registerSchema`
  - Rate Limited: Yes (100 requests per 15 minutes)
  
- **`POST /login`** - Login user
  - Validation: `loginSchema`
  - Rate Limited: Yes (100 requests per 15 minutes)

### Protected Note Routes
All note routes require JWT authentication via `authenticateJWT` middleware.

- **`GET /notes`** - Get all notes
- **`POST /notes`** - Create a new note
  - Validation: `createNoteSchema`
  
- **`GET /notes/:id`** - Get a specific note by ID
  - Validation: `noteIdParamSchema`
  
- **`PUT /notes/:id`** - Update a specific note
  - Validation: `updateNoteSchema`
  
- **`DELETE /notes/:id`** - Delete a specific note
  - Validation: `noteIdParamSchema`
  
- **`POST /notes/:id/share`** - Share a note
  - Validation: `shareNoteSchema`

### Search Route
- **`GET /search`** - Search notes (Protected - requires JWT)
  - Validation: `searchSchema`

### OpenAPI Documentation
- **`GET /openapi.json`** - Get OpenAPI schema documentation
