export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "TaskPulse API Documentation",
    version: "3.0.0",
    description:
      "Assignment 3 & 4 – Task & Team Management Application: Real-time Collaboration, Team Chat, Live Kanban Sync, In-App Notifications, and 3-Tier RBAC.",
    contact: {
      name: "DINH VAN LOI (QE190167)",
      url: "https://github.com/DinhLoii/assignment-sdn302",
    },
  },
  servers: [
    {
      url: "/",
      description: "Current Server Environment",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token obtained from `/api/auth/login` or `/api/auth/register`",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "cm8..." },
          name: { type: "string", example: "Demo Evaluator" },
          email: { type: "string", example: "test@example.com" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Team: {
        type: "object",
        properties: {
          id: { type: "string", example: "cm8..." },
          name: { type: "string", example: "TaskPulse Core Platform" },
          description: { type: "string", example: "Primary engineering workspace" },
          ownerId: { type: "string", example: "cm8..." },
          createdAt: { type: "string", format: "date-time" },
          currentUserRole: { type: "string", enum: ["OWNER", "MEMBER"], example: "OWNER" },
          _count: {
            type: "object",
            properties: {
              members: { type: "integer", example: 3 },
              tasks: { type: "integer", example: 8 },
            },
          },
        },
      },
      TeamMember: {
        type: "object",
        properties: {
          id: { type: "string" },
          teamId: { type: "string" },
          userId: { type: "string" },
          role: { type: "string", enum: ["OWNER", "MEMBER"], example: "MEMBER" },
          joinedAt: { type: "string", format: "date-time" },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "string", example: "cm8..." },
          title: { type: "string", example: "Implement JWT Authentication" },
          description: { type: "string", example: "Secure HTTP-only cookies with bcryptjs" },
          status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"], example: "IN_PROGRESS" },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"], example: "HIGH" },
          dueDate: { type: "string", format: "date-time", nullable: true },
          teamId: { type: "string", nullable: true },
          assigneeId: { type: "string", nullable: true },
          creatorId: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          assignee: { $ref: "#/components/schemas/User" },
          creator: { $ref: "#/components/schemas/User" },
        },
      },
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "object" },
          error: { type: "string", nullable: true },
          timestamp: { type: "string", format: "date-time" },
        },
      },
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        description:
          "Creates a new user account with hashed password and returns an auth session with JWT token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "John Doe" },
                  email: { type: "string", example: "john@example.com" },
                  password: { type: "string", minLength: 6, example: "Password123!" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User registered successfully" },
          400: { description: "Validation error" },
          409: { description: "Email already exists" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login user & receive JWT token",
        description: "Validates credentials and returns JWT token in JSON and HTTP-Only cookie.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "test@example.com" },
                  password: { type: "string", example: "Password123!" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful with token" },
          401: { description: "Invalid email or password" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Logout user",
        description: "Clears the authentication HTTP-Only cookie.",
        responses: {
          200: { description: "Logged out successfully" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current authenticated user profile",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Current user profile" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/teams": {
      get: {
        tags: ["Teams"],
        summary: "List teams the current user belongs to",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "List of user teams with member count and role" },
          401: { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Teams"],
        summary: "Create a new team",
        description: "The authenticated user creates a team and automatically becomes its Owner.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Mobile Development Team" },
                  description: { type: "string", example: "Workspace for iOS and Android apps" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Team created successfully" },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/teams/{id}": {
      get: {
        tags: ["Teams"],
        summary: "Get team details, members, and tasks",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Team details with members and tasks" },
          403: { description: "Forbidden: Not a member of this team" },
          404: { description: "Team not found" },
        },
      },
      put: {
        tags: ["Teams"],
        summary: "Update team info (Owner only)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Updated Team Name" },
                  description: { type: "string", example: "Updated description" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Team updated successfully" },
          403: { description: "Forbidden: Only the Owner can update" },
        },
      },
      delete: {
        tags: ["Teams"],
        summary: "Delete a team (Owner only)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Team deleted successfully" },
          403: { description: "Forbidden: Only the Owner can delete" },
        },
      },
    },
    "/api/teams/{id}/members": {
      post: {
        tags: ["Team Members"],
        summary: "Add a member to team by email (Owner only)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", example: "alice@example.com" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Member added to team" },
          400: { description: "Validation error" },
          403: { description: "Forbidden: Only Owner can add members" },
          404: { description: "User not found" },
          409: { description: "User already in team" },
        },
      },
    },
    "/api/teams/{id}/members/{userId}": {
      delete: {
        tags: ["Team Members"],
        summary: "Remove a member from team (Owner only)",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "userId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Member removed from team" },
          400: { description: "Cannot remove team owner" },
          403: { description: "Forbidden: Only Owner can remove members" },
          404: { description: "Member not found" },
        },
      },
    },
    "/api/teams/{id}/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List tasks for a team with filters",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["ALL", "TODO", "IN_PROGRESS", "DONE"] },
          },
          {
            name: "priority",
            in: "query",
            schema: { type: "string", enum: ["ALL", "LOW", "MEDIUM", "HIGH"] },
          },
          { name: "assigneeId", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: { description: "List of team tasks" },
          403: { description: "Forbidden: Not a member of this team" },
        },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create a task in a team",
        description: "Any member of the team can create tasks and assign them to team members.",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string", example: "Build automated test suite" },
                  description: { type: "string", example: "Unit and integration tests with Jest" },
                  status: {
                    type: "string",
                    enum: ["TODO", "IN_PROGRESS", "DONE"],
                    example: "TODO",
                  },
                  priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"], example: "MEDIUM" },
                  dueDate: { type: "string", format: "date-time" },
                  assigneeId: { type: "string", example: "cm8..." },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Task created successfully" },
          400: { description: "Validation error or invalid assignee" },
          403: { description: "Forbidden: Not a team member" },
        },
      },
    },
    "/api/tasks/{id}": {
      get: {
        tags: ["Tasks"],
        summary: "Get task details by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Task details" },
          404: { description: "Task not found" },
        },
      },
      put: {
        tags: ["Tasks"],
        summary: "Update task (team members can update details, status, priority, assignee)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Updated task title" },
                  description: { type: "string" },
                  status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"] },
                  priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
                  dueDate: { type: "string", format: "date-time" },
                  assigneeId: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Task updated successfully" },
          403: { description: "Forbidden: Not a team member" },
          404: { description: "Task not found" },
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete a task (Creator, Assignee, or Team Owner only)",
        description:
          "Enforces role-based authorization check: only task creator, assignee, or team owner can delete.",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Task deleted successfully" },
          403: { description: "Forbidden: Permission denied" },
          404: { description: "Task not found" },
        },
      },
    },
  },
};
