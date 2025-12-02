const { z } = require("zod");

const signupSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  rollNumber: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  venue: z.string().min(1, "Venue is required"),
  date: z
    .string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  time: z.string().min(1, "Time is required"),
  capacity: z
    .number()
    .int()
    .positive("Capacity must be a positive number")
    .or(z.string().transform((val) => parseInt(val, 10))),
  imageUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().optional(),
  organizer: z.string().min(1, "Organizer is required"),
});

const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  venue: z.string().min(1).optional(),
  date: z
    .string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional(),
  time: z.string().min(1).optional(),
  capacity: z
    .number()
    .int()
    .positive()
    .or(z.string().transform((val) => parseInt(val, 10)))
    .optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().optional(),
  organizer: z.string().min(1).optional(),
});

const updateUserRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"], {
    errorMap: () => ({ message: "Role must be either USER or ADMIN" }),
  }),
});

module.exports = {
  signupSchema,
  loginSchema,
  createEventSchema,
  updateEventSchema,
  updateUserRoleSchema,
};
