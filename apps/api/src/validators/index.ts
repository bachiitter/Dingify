import { OpenAPIHono, z } from "@hono/zod-openapi";
import {
  extendZodWithOpenApi,
  ZodOpenApiOperationObject,
  createDocument,
} from "zod-openapi";
import * as yaml from "yaml";

extendZodWithOpenApi(z);

const app = new OpenAPIHono();
const registry = app.openAPIRegistry;

// Define the Event Schema with detailed OpenAPI extensions
export const EventSchema = z
  .object({
    name: z.string().openapi({
      description: "The name of the event.",
      example: "Annual Meetup",
    }),
    channel: z.string().openapi({
      description: "The channel name associated with the event.",
      example: "Main Channel",
    }),
    event: z.string().openapi({
      description: "The specific event being described.",
      example: "Tech Conference",
    }),
    icon: z.string().optional().openapi({
      description: "An optional icon for visual representation of the event.",
      example: "icon_event.png",
    }),
    notify: z.boolean().openapi({
      description:
        "Flag indicating whether users should be notified about the event.",
      example: true,
    }),
    tags: z
      .record(z.string())
      .optional()
      .openapi({
        description:
          "Tags providing additional context or categorization for the event.",
        example: { Networking: "Yes", Tech: "Yes" },
      }),
  })
  .openapi({ ref: "Event" });

// Schema for creating an event
export const EventCreateSchema = z
  .object({
    name: z.string().openapi({
      description: "The name of the event.",
      example: "You got a new payment",
    }),
    channel: z.string().openapi({
      description: "The channel name where the event is registered.",
      example: "new-channel-name",
    }),
    icon: z.string().optional().openapi({
      description: "An optional icon representing the event.",
      example: "🎉",
    }),
    notify: z.boolean().openapi({
      description: "Whether to notify users about the event.",
      example: true,
    }),
    tags: z
      .record(z.string())
      .optional()
      .openapi({
        description: "Additional tags providing context for the event.",
        example: { plan: "premium", cycle: "monthly" },
      }),
  })
  .openapi({ ref: "EventCreate" });

// CRUD operations for Events
export const logEvent: ZodOpenApiOperationObject = {
  operationId: "logEvent",
  summary: "Log a new event",
  description: "Logs a new event for a user in a specified channel.",
  requestBody: {
    description: "Details of the event to log.",
    content: {
      "application/json": {
        schema: EventCreateSchema,
      },
    },
  },
  responses: {
    "201": {
      description: "Event logged successfully.",
      content: {
        "application/json": {
          schema: EventSchema,
        },
      },
    },
    "404": {
      description: "Channel or project not found.",
    },
    "400": {
      description: "Invalid input data.",
    },
  },
};

// Generate an OpenAPI document
const document = createDocument({
  openapi: "3.1.0",
  info: {
    title: "User and Event Management API",
    description: "API for managing users, their events, and projects.",
    version: "1.0.0",
  },
  servers: [
    {
      url: "https://example.com",
      description: "The production server.",
    },
  ],
  paths: {
    "/events": { post: logEvent },
  },
  components: {
    schemas: {
      Event: EventSchema,
      EventCreate: EventCreateSchema,
    },
  },
});

console.log(yaml.stringify(document));
