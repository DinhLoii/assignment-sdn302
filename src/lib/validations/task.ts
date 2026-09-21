import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required")
    .max(120, "Title must not exceed 120 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description must not exceed 1000 characters")
    .optional()
    .nullable(),
  status: z
    .enum(["TODO", "IN_PROGRESS", "DONE"], {
      message: "Status must be TODO, IN_PROGRESS, or DONE",
    })
    .default("TODO"),
  priority: z
    .enum(["LOW", "MEDIUM", "HIGH"], {
      message: "Priority must be LOW, MEDIUM, or HIGH",
    })
    .default("MEDIUM"),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Please enter a valid date",
    }),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
