// Validation schemas for Kanban-related operations

const Joi = require('joi');

// schema for creating a new task category
const createTaskCategorySchema = Joi.object({
  name: Joi.string().required().trim().max(100),
  workspaceId: Joi.string().required(),
});

// schema for updating an existing task category
const updateTaskCategorySchema = Joi.object({
  name: Joi.string().required().trim().max(100),
});

// schema for creating a new board task
const createBoardTaskSchema = Joi.object({
  title: Joi.string().required().trim().max(200),
  description: Joi.string().allow('', null),
  columnId: Joi.string().required(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').default('MEDIUM'),
  dueDate: Joi.date().allow(null),
});

// schema for updating an existing board task
const updateBoardTaskSchema = Joi.object({
  title: Joi.string().trim().max(200),
  description: Joi.string().allow('', null),
  columnId: Joi.string(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH'),
  dueDate: Joi.date().allow(null),
});

// schema for reordering tasks within a column
const reorderTasksSchema = Joi.object({
  tasks: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        position: Joi.value().required(),
        columnId: Joi.string().required(),
      }),
    )
    .required(),
});

module.exports = {
  createTaskCategorySchema,
  updateTaskCategorySchema,
  createBoardTaskSchema,
  updateBoardTaskSchema,
  reorderTasksSchema,
};
