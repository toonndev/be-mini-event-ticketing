import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mini Event Ticketing API',
      version: '1.0.0',
      description: 'REST API for mini event ticketing system',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:8080',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'admin'] },
          },
        },
        Event: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time', nullable: true },
            venue: { type: 'string' },
            ticketPrice: { type: 'number', example: 500 },
            category: { type: 'string', enum: ['concert', 'conference', 'sport', 'workshop', 'festival', 'exhibition', 'other'] },
            imageUrl: { type: 'string', nullable: true },
            totalTickets: { type: 'integer' },
            remainingTickets: { type: 'integer' },
            maxTicketsPerUser: { type: 'integer', example: 5 },
            status: { type: 'string', enum: ['draft', 'published', 'cancelled'] },
            ticketStatus: { type: 'string', enum: ['available', 'almost_full', 'sold_out'] },
            tags: { type: 'array', items: { type: 'string' }, nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        PaginatedEvents: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/Event' } },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer', example: 50 },
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                totalPages: { type: 'integer', example: 5 },
              },
            },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            eventId: { type: 'string', format: 'uuid' },
            eventName: { type: 'string' },
            eventDate: { type: 'string', format: 'date-time' },
            venue: { type: 'string' },
            quantity: { type: 'integer' },
            bookedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 1104 },
            msg: { type: 'string', example: 'NOT_FOUND' },
            description: { type: 'string', example: 'Requested entity record does not exist' },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Validation error' },
            details: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    password: { type: 'string', minLength: 6, example: 'secret123' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      token: { type: 'string' },
                      user: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
            409: { description: 'Email already in use', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    password: { type: 'string', example: 'secret123' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      token: { type: 'string' },
                      user: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/auth/users/{id}/role': {
        patch: {
          tags: ['Auth'],
          summary: 'Promote or demote user role (admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'User ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['role'],
                  properties: {
                    role: { type: 'string', enum: ['user', 'admin'], example: 'admin' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Role updated successfully',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/User' } },
              },
            },
            400: { description: 'Invalid role value', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Forbidden — admin only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/events/categories': {
        get: {
          tags: ['Events'],
          summary: 'Get all available event categories',
          responses: {
            200: {
              description: 'List of categories',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['concert', 'conference', 'sport', 'workshop', 'festival', 'exhibition', 'other'],
                  },
                },
              },
            },
          },
        },
      },
      '/api/events': {
        get: {
          tags: ['Events'],
          summary: 'Get all events (paginated)',
          description: 'Returns only `published` events by default. If an **admin** Bearer token is provided, returns events of all statuses (draft/published/cancelled).',
          security: [{ bearerAuth: [] }, {}],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number (1-indexed)' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 }, description: 'Items per page' },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by event name or description (case-insensitive)' },
            { name: 'category', in: 'query', schema: { type: 'string', enum: ['concert', 'conference', 'sport', 'workshop', 'festival', 'exhibition', 'other'] }, description: 'Filter by category' },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['draft', 'published', 'cancelled'] }, description: 'Filter by status — **admin token required**, ignored for public requests' },
          ],
          responses: {
            200: {
              description: 'Paginated list of events',
              headers: {
                'Content-Range': {
                  schema: { type: 'string', example: 'items 0-9/50' },
                  description: 'Range of returned items and total count',
                },
              },
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/PaginatedEvents' } },
              },
            },
          },
        },
        post: {
          tags: ['Events'],
          summary: 'Create a new event (admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'description', 'date', 'venue', 'category', 'totalTickets'],
                  properties: {
                    name: { type: 'string', example: 'Tech Conference 2026' },
                    description: { type: 'string', example: 'Annual tech conference' },
                    date: { type: 'string', format: 'date-time', example: '2026-06-01T10:00:00Z' },
                    endDate: { type: 'string', format: 'date-time', example: '2026-06-01T18:00:00Z' },
                    venue: { type: 'string', example: 'Bangkok Convention Center' },
                    ticketPrice: { type: 'number', minimum: 0, example: 500 },
                    category: { type: 'string', enum: ['concert', 'conference', 'sport', 'workshop', 'festival', 'exhibition', 'other'], example: 'conference' },
                    imageUrl: { type: 'string', example: 'https://example.com/banner.jpg' },
                    totalTickets: { type: 'integer', minimum: 1, example: 200 },
                    maxTicketsPerUser: { type: 'integer', minimum: 1, maximum: 20, example: 5 },
                    status: { type: 'string', enum: ['draft', 'published', 'cancelled'], example: 'published' },
                    tags: { type: 'array', items: { type: 'string' }, example: ['tech', 'ai'] },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Event created successfully',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Event' } },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Forbidden — admin only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/events/{id}/live': {
        get: {
          tags: ['Events'],
          summary: 'Live ticket updates via SSE',
          description: 'Server-Sent Events stream — pushes `{ remainingTickets, ticketStatus }` every time a booking or cancellation occurs.',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: {
              description: 'SSE stream',
              content: {
                'text/event-stream': {
                  schema: {
                    type: 'object',
                    properties: {
                      remainingTickets: { type: 'integer', example: 48 },
                      ticketStatus: { type: 'string', enum: ['available', 'almost_full', 'sold_out'] },
                    },
                  },
                },
              },
            },
            404: { description: 'Event not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/events/{id}': {
        get: {
          tags: ['Events'],
          summary: 'Get event by ID',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: {
              description: 'Event detail',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Event' } },
              },
            },
            404: { description: 'Event not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        patch: {
          tags: ['Events'],
          summary: 'Update an event (admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Tech Conference 2026' },
                    description: { type: 'string', example: 'Updated description' },
                    date: { type: 'string', format: 'date-time', example: '2026-09-01T10:00:00Z', description: 'Must be a future date' },
                    endDate: { type: 'string', format: 'date-time', example: '2026-09-01T18:00:00Z' },
                    venue: { type: 'string', example: 'Bangkok Convention Center' },
                    ticketPrice: { type: 'number', minimum: 0, example: 500 },
                    category: { type: 'string', enum: ['concert', 'conference', 'sport', 'workshop', 'festival', 'exhibition', 'other'] },
                    imageUrl: { type: 'string', example: 'https://example.com/banner.jpg' },
                    totalTickets: { type: 'integer', minimum: 1, example: 300, description: 'Cannot be less than already-booked count' },
                    maxTicketsPerUser: { type: 'integer', minimum: 1, maximum: 20, example: 5 },
                    status: { type: 'string', enum: ['draft', 'published', 'cancelled'] },
                    tags: { type: 'array', items: { type: 'string' }, example: ['tech', 'ai'] },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Event updated successfully',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Event' } },
              },
            },
            400: { description: 'Validation error or totalTickets below booked count', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Forbidden — admin only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Event not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          tags: ['Events'],
          summary: 'Delete an event (admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: {
              description: 'Event deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Event deleted' },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Forbidden — admin only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Event not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/admin/events/{id}/bookings': {
        get: {
          tags: ['Admin'],
          summary: 'Get all bookings for an event (admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Event ID' },
          ],
          responses: {
            200: {
              description: 'List of bookings with buyer info',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        bookingId: { type: 'string', format: 'uuid' },
                        quantity: { type: 'integer' },
                        bookedAt: { type: 'string', format: 'date-time' },
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', format: 'uuid' },
                            name: { type: 'string' },
                            email: { type: 'string', format: 'email' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Forbidden — admin only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Event not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/admin/users': {
        get: {
          tags: ['Admin'],
          summary: 'Get all users (admin only)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'List of all users',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Forbidden — admin only', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/bookings': {
        post: {
          tags: ['Bookings'],
          summary: 'Create a booking',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['eventId', 'quantity'],
                  properties: {
                    eventId: { type: 'string', format: 'uuid' },
                    quantity: { type: 'integer', minimum: 1, maximum: 5 },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Booking created',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Booking' } },
              },
            },
            400: { description: 'Quota exceeded', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Event not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            409: { description: 'Not enough tickets', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/bookings/{id}': {
        delete: {
          tags: ['Bookings'],
          summary: 'Cancel a booking and refund tickets',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Booking ID' },
          ],
          responses: {
            200: {
              description: 'Booking cancelled and tickets refunded',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Booking cancelled' },
                      refundedTickets: { type: 'integer', example: 2 },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Booking not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/bookings/me': {
        get: {
          tags: ['Bookings'],
          summary: 'Get my bookings',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'List of my bookings',
              content: {
                'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Booking' } } },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
