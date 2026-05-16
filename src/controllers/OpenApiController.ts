import { Request, Response } from 'express';

const openApiSchema = {
  openapi: "3.0.0",
  info: {
    title: "Notes API",
    version: "1.0.0",
    description: "Mult-user Notes API with tagging, filtering, and sharing capabilities."
  },
  servers: [
    { url: "/api" }
  ],
  paths: {
    "/register": {
      post: {
        summary: "Register new user",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } } } } }
        },
        responses: { "201": { description: "Created" } }
      }
    },
    "/login": {
      post: {
        summary: "Login",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } } } } }
        },
        responses: { "200": { description: "Success" }, "401": { description: "Unauthorized" } }
      }
    },
    "/notes": {
      get: {
        security: [{ BearerAuth: [] }],
        summary: "Get notes",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
          { in: "query", name: "tag", schema: { type: "string" } }
        ],
        responses: { "200": { description: "List of notes" } }
      },
      post: {
        security: [{ BearerAuth: [] }],
        summary: "Create note",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", properties: { title: { type: "string" }, content: { type: "string" }, tags: { type: "array", items: { type: "string" } } } } } }
        },
        responses: { "201": { description: "Created" } }
      }
    },
    "/notes/{id}": {
      get: {
        security: [{ BearerAuth: [] }],
        summary: "Get note by ID",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Note details" } }
      },
      put: {
        security: [{ BearerAuth: [] }],
        summary: "Update note by ID",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          content: { "application/json": { schema: { type: "object", properties: { title: { type: "string" }, content: { type: "string" }, tags: { type: "array", items: { type: "string" } } } } } }
        },
        responses: { "200": { description: "Updated note" } }
      },
      delete: {
        security: [{ BearerAuth: [] }],
        summary: "Delete note by ID",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { "204": { description: "Deleted" } }
      }
    },
    "/notes/{id}/share": {
      post: {
        security: [{ BearerAuth: [] }],
        summary: "Share note",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", properties: { share_with_email: { type: "string" } } } } }
        },
        responses: { "200": { description: "Shared" } }
      }
    },
    "/search": {
      get: {
        security: [{ BearerAuth: [] }],
        summary: "Search notes",
        parameters: [{ in: "query", name: "q", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Search results" } }
      }
    }
  },
  components: {
    securitySchemes: {
      BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
    }
  }
};

export class OpenApiController {
  static getSchema(req: Request, res: Response) {
    res.json(openApiSchema);
  }
}
