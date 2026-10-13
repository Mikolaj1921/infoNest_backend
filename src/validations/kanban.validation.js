// fix: юзання zod для валідації

const { z } = require('zod');

const createTaskCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(1)
      .max(100),
    workspaceId: z.string({ required_error: 'Workspace ID is required' }),
  }),
});

const updateTaskCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(1)
      .max(100),
  }),
});

const createBoardTaskSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(1)
      .max(200),
    description: z.string().nullable().optional(),
    columnId: z.string({ required_error: 'Column ID is required' }),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    dueDate: z.string().datetime().nullable().optional(),
  }),
});

const updateBoardTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().max(200).optional(),
    description: z.string().nullable().optional(),
    columnId: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    dueDate: z.string().datetime().nullable().optional(),
  }),
});

const reorderTasksSchema = z.object({
  body: z.object({
    tasks: z.array(
      z.object({
        id: z.string({ required_error: 'Task ID is required' }),

        position: z.number().int(),
        columnId: z.string({ required_error: 'Column ID is required' }),
      }),
    ),
  }),
});

module.exports = {
  createTaskCategorySchema,
  updateTaskCategorySchema,
  createBoardTaskSchema,
  updateBoardTaskSchema,
  reorderTasksSchema,
};
