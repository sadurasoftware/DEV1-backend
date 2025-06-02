const Joi = require('joi');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
//register
const registerSchema = Joi.object({
  firstname: Joi.string()
    .pattern(/^[A-Za-z\s]+$/)
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.pattern.base': `"First name" can only contain letters and spaces`,
      'string.empty': `"First name" cannot be empty`,
      'string.min': `"First name" should have at least {#limit} characters`,
      'string.max': `"First name" should have at most {#limit} characters`,
      'any.required': `"First name" is required`,
    }),
  lastname: Joi.string()
    .pattern(/^[A-Za-z\s]+$/)
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.pattern.base': `"Last name" can only contain letters and spaces`,
      'string.empty': `"Last name" cannot be empty`,
      'string.min': `"Last name" should have at least {#limit} characters`,
      'string.max': `"Last name" should have at most {#limit} characters`,
      'any.required': `"Last name" is required`,
    }),
  email: Joi.string()
    .email()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .required()
    .messages({
      'string.email': `"Email" must be a valid email address`,
      'string.empty': `"Email" cannot be empty`,
      'any.required': `"Email" is required`,
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': `"Password" must contain at least {#limit} characters`,
      'string.empty': `"Password" cannot be empty`,
      'any.required': `"Password" is required`,
    }),
  terms: Joi.boolean().valid(true).required().messages({
    'any.only': `"Terms" must be accepted`,
    'any.required': `"Terms" is required`,
  }),
  department: Joi.string()
    .trim()
    .optional()
    .allow(null, '')
    .messages({
      'string.empty': `"Department" cannot be empty`,
    }),
});

//login
const loginSchema = Joi.object({
  email: Joi.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/,).required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
    }),
});

//forgetpassword
const forgetPasswordSchema = Joi.object({
  email: Joi.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/,).required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email',
  }),
});
const resendVerifyEmailSchema = Joi.object({
  email: Joi.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/,).required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email',
  }),
});
//resetPassword
const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Token is required',
    'string.base': 'Token must be a valid string',
  }),
  newPassword: Joi.string().pattern(passwordRegex).required().messages({
    'string.empty': 'Password is required',
      'string.pattern.base': 'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character',
      'any.required': 'Password is required',
  }),
});
//changePassword
const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().pattern(passwordRegex).required().messages({
    'string.empty': 'Please oldPassword is required',
    'string.pattern.base': 'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character',
    'any.required': 'Password is required',
  }),
  newPassword: Joi.string().pattern(passwordRegex).required().messages({
    'string.empty': 'Please New Password is required',
    'string.pattern.base': 'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character',
    'any.required': 'Password is required',
  }),
});
//role
const roleSchema=Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'Role name is required',
    'string.min': 'Role name must be at least 3 characters long',
    'string.max': 'Role name must not exceed 50 characters',
  }),
});

const getRollByIdsSchema=Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "id must be a number.",
    "number.integer": "id must be an integer.",
    "any.required": "id is required.",
  }),
});

const deleteRoleSchema=Joi.object({
  roleId: Joi.number().integer().required().messages({
    "number.base": "roleId must be a number.",
    "number.integer": "roleId must be an integer.",
    "any.required": "roleId is required.",
  }),
});
//module
const moduleSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'Module name is required',
    'string.min': 'Module name must be at least 3 characters long',
    'string.max': 'Module name must not exceed 50 characters',
  }),
});

const getModuleByIdSchema=Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "id must be a number.",
    "number.integer": "id must be an integer.",
    "any.required": "id is required.",
  }),
});
;
//permission
const permissionSchema=Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'Permission name is required',
    'string.min': 'Permission name must be at least 3 characters long',
    'string.max': 'Permission name must not exceed 50 characters',
  }),
});

const getPermissionByIdSchema=Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "id must be a number.",
    "number.integer": "id must be an integer.",
    "any.required": "id is required.",
  }),
});
//role-module-permission
const createRoleModulePermissionSchema = Joi.object({
  roleId: Joi.number().integer().required().messages({
    "number.base": "roleId must be a number.",
    "number.integer": "roleId must be an integer.",
    "any.required": "roleId is required.",
  }),
  moduleId: Joi.number().integer().required().messages({
    "number.base": "moduleId must be a number.",
    "number.integer": "moduleId must be an integer.",
    "any.required": "moduleId is required.",
  }),
  permissionId: Joi.number().integer().required().messages({
    "number.base": "permissionId must be a number.",
    "number.integer": "permissionId must be an integer.",
    "any.required": "permissionId is required.",
  }),
  status: Joi.boolean().required().messages({
    "boolean.base": "status must be a boolean.",
    "any.required": "status is required.",
  }),
});

const getModulesForRoleSchema = Joi.object({
  roleId: Joi.number().integer().required().messages({
    'number.base': 'roleId must be a number.',
    'any.required': 'roleId is required.',
  }),
});

const getModulesAndPermissionsByRole  = Joi.object({
  roleId: Joi.number().integer().required().messages({
    'number.base': 'roleId must be a number.',
    'any.required': 'roleId is required.',
  }),
});

const deleteModuleSchema = Joi.object({
  moduleId: Joi.number().integer().optional().messages({
    'number.base': 'moduleId must be an integer.',
  }),
  // moduleName: Joi.string().optional().messages({
  //   'string.base': 'moduleName must be a string.',
  // }),
}).or('moduleId');

const deletePermissionSchema = Joi.object({
  permissionId: Joi.number().integer().optional().messages({
    'number.base': 'permissionId must be an integer.',
  }),
  permissionName: Joi.string().optional().messages({
    'string.base': 'permissionName must be a string.',
  }),
}).or('permissionId', 'permissionName');

const updatePermissionSchema = Joi.object({
  permissionId: Joi.number().integer().optional().messages({
    'number.base': 'permissionId must be an integer.',
  }),
  permissionName: Joi.string().optional().messages({
    'string.base': 'permissionName must be a string.',
  }),
  newPermissionName: Joi.string().required().messages({
    'string.base': 'newPermissionName must be a string.',
    'any.required': 'newPermissionName is required.',
  }),
}).or('permissionId', 'permissionName');

const updateModuleSchema = Joi.object({
  moduleId: Joi.number().integer().optional().messages({
    'number.base': 'moduleId must be an integer.',
  }),
  moduleName: Joi.string().optional().messages({
    'string.base': 'moduleName must be a string.',
  }),
  newModuleName: Joi.string().required().messages({
    'string.base': 'newModuleName must be a string.',
    'any.required': 'newModuleName is required.',
  }),
}).or('moduleId', 'moduleName');
//department
const createDepartmentSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.base': `"Name" should be a type of 'text'`,
    'string.empty': `"Name" cannot be empty`,
    'string.min': `"Name" should have at least {#limit} characters`,
    'string.max': `"Name" should have at most {#limit} characters`,
    'any.required': `"Name" is required`,
  }),
});

const getDepartmentByIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "id must be a number.",
    "number.integer": "id must be an integer.",
    "any.required": "id is required.",
  }),
});

const updateDepartmentSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.base': `"Name" should be a type of 'text'`,
    'string.empty': `"Name" cannot be empty`,
    'string.min': `"Name" should have at least {#limit} characters`,
    'string.max': `"Name" should have at most {#limit} characters`,
    'any.required': `"Name" is required`,
  }),
});

const deleteDepartmentSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "id must be a number.",
    "number.integer": "id must be an integer.",
    "any.required": "id is required.",
  }),
});
//user-management
const createUservalidator = Joi.object({
  firstname: Joi.string()
    .pattern(/^[A-Za-z\s]+$/)
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.pattern.base': `"First name" can only contain letters and spaces`,
      'string.empty': `"First name" cannot be empty`,
      'string.min': `"First name" should have at least {#limit} characters`,
      'string.max': `"First name" should have at most {#limit} characters`,
      'any.required': `"First name" is required`,
    }),
  lastname: Joi.string()
    .pattern(/^[A-Za-z\s]+$/)
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.pattern.base': `"Last name" can only contain letters and spaces`,
      'string.empty': `"Last name" cannot be empty`,
      'string.min': `"Last name" should have at least {#limit} characters`,
      'string.max': `"Last name" should have at most {#limit} characters`,
      'any.required': `"Last name" is required`,
    }),
  email: Joi.string()
    .email()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .required()
    .messages({
      'string.email': `"Email" must be a valid email address`,
      'string.empty': `"Email" cannot be empty`,
      'any.required': `"Email" is required`,
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': `"Password" must contain at least {#limit} characters`,
      'string.empty': `"Password" cannot be empty`,
      'any.required': `"Password" is required`,
    }),
  terms: Joi.boolean().valid(true).required().messages({
    'any.only': `"Terms" must be accepted`,
    'any.required': `"Terms" is required`,
  }),
  role: Joi.string().required().messages({
    'string.empty': `"Role" cannot be empty`,
    'any.required': `"Role" is required`,
  }),
  departmentId: Joi.number()
  .optional()
  .allow(null)
  .messages({
    'number.base': `"Department ID" must be a number`,
  }),
});

const updateUservalidator = Joi.object({
  firstname: Joi.string()
  .pattern(/^[A-Za-z\s]+$/)
  .min(3)
  .max(50)
  .required()
  .messages({
    'string.pattern.base': `"First name" can only contain letters and spaces`,
    'string.empty': `"First name" cannot be empty`,
    'string.min': `"First name" should have at least {#limit} characters`,
    'string.max': `"First name" should have at most {#limit} characters`,
    'any.required': `"First name" is required`,
  }),
  lastname: Joi.string()
  .pattern(/^[A-Za-z\s]+$/)
  .min(1)
  .max(50)
  .required()
  .messages({
    'string.pattern.base': `"Last name" can only contain letters and spaces`,
    'string.empty': `"Last name" cannot be empty`,
    'string.min': `"Last name" should have at least {#limit} characters`,
    'string.max': `"Last name" should have at most {#limit} characters`,
    'any.required': `"Last name" is required`,
  }),
  email: Joi.string().email().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/,).required().messages({
    'string.email': `"Email" must be a valid email address`,
    'string.empty': `"Email" cannot be empty`,
    'any.required': `"Email" is required`,
  }),
  password: Joi.string()
  .pattern(passwordRegex)
  .required()
  .messages({
    'string.pattern.base': `"Password" must contain at least 8 characters, including uppercase, lowercase, number, and special character`,
    'string.empty': `"Password" cannot be empty`,
    'any.required': `"Password" is required`,
  }),
  role: Joi.string().required().messages({
    'string.empty': `"Role" cannot be empty`,
    'any.required': `"Role" is required`,
  }),
  departmentId: Joi.number().integer().required().messages({
    'number.base': 'departmentId must be a number.',
    'any.required': 'departmentId is required.',
  }),
});
 

const viewUserSchema=Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "id must be a number.",
    "number.integer": "id must be an integer.",
    "any.required": "id is required.",
  }),
});

const deleteUserSchema=Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "id must be a number.",
    "number.integer": "id must be an integer.",
    "any.required": "id is required.",
  }),
});
//category
const createCategorySchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.base': `"Name" should be a type of 'text'`,
    'string.empty': `"Name" cannot be empty`,
    'string.min': `"Name" should have at least {#limit} characters`,
    'string.max': `"Name" should have at most {#limit} characters`,
    'any.required': `"Name" is required`,
  }),
});

const getCategoryByIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "id must be a number.",
    "number.integer": "id must be an integer.",
    "any.required": "id is required.",
  }),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.base': `"Name" should be a type of 'text'`,
    'string.empty': `"Name" cannot be empty`,
    'string.min': `"Name" should have at least {#limit} characters`,
    'string.max': `"Name" should have at most {#limit} characters`,
    'any.required': `"Name" is required`,
  }),
});

const deleteCategorySchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "id must be a number.",
    "number.integer": "id must be an integer.",
    "any.required": "id is required.",
  }),
});

//ticket

const createTicketSchema = Joi.object({
  title: Joi.string().min(3).max(50).required().messages({
    'string.base': `"Title" should be a type of 'text'`,
    'string.empty': `"Title" cannot be empty`,
    'string.min': `"Title" should have at least {#limit} characters`,
    'string.max': `"Title" should have at most {#limit} characters`,
    'any.required': `"Title" is required`,
  }),
  description: Joi.string().min(3).max(50).required().messages({
    'string.base': `"Description" should be a type of 'text'`,
    'string.empty': `"Description" cannot be empty`,
    'string.min': `"Description" should have at least {#limit} characters`,
    'string.max': `"Description" should have at most {#limit} characters`,
    'any.required': `"Description" is required`,
  }),
  priority: Joi.string()
  .valid("Low", "Medium", "High")
  .required()
  .messages({
    'any.only': `"Priority" must be one of ["Low", "Medium", "High"]`,
    'any.required': `"Priority" is required`,
  }),
  category: Joi.string().min(3).max(50).required().messages({
  'string.base': `"Category" should be a type of 'text'`,
  'string.empty': `"Category" cannot be empty`,
  'string.min': `"Category" should have at least {#limit} characters`,
  'string.max': `"Category" should have at most {#limit} characters`,
  'any.required': `"Category" is required`,
   }),
});
const assignTicketSchema = Joi.object({
  assignedTo: Joi.number().integer().positive().required().messages({
    'number.base': `"assignedTo" should be a valid user ID`,
    'number.integer': `"assignedTo" must be an integer`,
    'number.positive': `"assignedTo" must be a positive number`,
    'any.required': `"assignedTo" is required`,
  })
});

const assignTicketParamsSchema = Joi.object({
  id: Joi.string()
    .guid({ version: ['uuidv4', 'uuidv5'] }) 
    .required()
    .messages({
      "string.guid": `"id" must be a valid UUID`,
      "any.required": `"id" is required`,
    }),
});
const getTicketByIdSchema = Joi.object({
  id: Joi.string()
    .guid({ version: ['uuidv4', 'uuidv5'] }) 
    .required()
    .messages({
      "string.guid": "ID must be a valid UUID.",
      "any.required": "ID is required.",
    }),
});
const getUserByTicketsSchema = Joi.object({
  userId: Joi.number().integer().required().messages({
    "number.base": "id must be a number.",
    "number.integer": "id must be an integer.",
    "any.required": "id is required.",
  }),
});
const updateTicketStatusSchema = Joi.object({
  status: Joi.string()
    .valid('Open', 'Pending', 'Resolved', 'Closed', 'In Progress')
    .required()
    .messages({
      'any.only': 'Invalid status value. Allowed values: Open, Pending, Resolved, Closed, In Progress',
      'any.required': 'Status is required',
    }),
});
const updateTicketStatusParamsSchema = Joi.object({
  id: Joi.string()
    .guid({ version: ['uuidv4', 'uuidv5'] }) 
    .required()
    .messages({
      "string.guid": "ID must be a valid UUID.",
      "any.required": "ID is required.",
    }),
});

const updateTicketParamsSchema = Joi.object({
  id: Joi.string()
    .guid({ version: ['uuidv4', 'uuidv5'] }) 
    .required()
    .messages({
      "string.guid": "ID must be a valid UUID.",
      "any.required": "ID is required.",
    }),
});
const updateTicketSchema = Joi.object({
  title: Joi.string().min(3).max(50).optional().messages({
    'string.base': `"Title" should be a type of 'text'`,
    'string.empty': `"Title" cannot be empty`,
    'string.min': `"Title" should have at least {#limit} characters`,
    'string.max': `"Title" should have at most {#limit} characters`,
  }),
  description: Joi.string().min(3).max(50).optional().messages({
    'string.base': `"Description" should be a type of 'text'`,
    'string.empty': `"Description" cannot be empty`,
    'string.min': `"Description" should have at least {#limit} characters`,
    'string.max': `"Description" should have at most {#limit} characters`,
  }),
  priority: Joi.string()
    .valid("Low", "Medium", "High")
    .optional()
    .messages({
      'any.only': `"Priority" must be one of ["Low", "Medium", "High"]`,
    }),
  category: Joi.string().min(3).max(50).optional().messages({
    'string.base': `"Category" should be a type of 'text'`,
    'string.empty': `"Category" cannot be empty`,
    'string.min': `"Category" should have at least {#limit} characters`,
    'string.max': `"Category" should have at most {#limit} characters`,
  }),
});

const viewTicketSchema = Joi.object({
  id: Joi.string()
    .guid({ version: ['uuidv4', 'uuidv5'] }) 
    .required()
    .messages({
      "string.guid": "ID must be a valid UUID.",
      "any.required": "ID is required.",
    }),
});
const deleteTicketSchema = Joi.object({
  id: Joi.string()
    .guid({ version: ['uuidv4', 'uuidv5'] }) 
    .required()
    .messages({
      "string.guid": "ID must be a valid UUID.",
      "any.required": "ID is required.",
    }),
});

const getImageSchema = Joi.object({
  ticketId: Joi.string().uuid().required().messages({
    'string.empty': 'ticketId is required',
    'string.guid': 'ticketId must be a valid UUID',
    'any.required': 'ticketId is required',
  }),
  filename: Joi.string().min(3).required().messages({
    'string.empty': 'filename is required',
    'any.required': 'filename is required',
    'string.min': 'filename must be at least {#limit} characters',
  }),
});

const exportTicketsSchema = Joi.object({
  format: Joi.string()
    .valid('csv', 'excel', 'pdf')
    .required()
    .messages({
      'any.only': 'Invalid format. Use csv, excel, or pdf',
      'string.empty': 'Format is required',
      'any.required': 'Format is required',
    }),
  startDate: Joi.date().iso().optional().messages({
    'date.format': 'Start date must be a valid ISO date',
  }),
  endDate: Joi.date().iso().optional().messages({
    'date.format': 'End date must be a valid ISO date',
  }),
});

const addcommentSchemaParams =Joi.object({
  ticketId: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid ticket ID format',
    'any.required': 'ticketId is required',
  }),
});
const addcommentSchema = Joi.object({
  commentText: Joi.string().min(1).required().messages({
    'string.empty': 'Comment text cannot be empty',
    'any.required': 'Comment text is required',
  }),
});

const updatecommentSchemaParams =Joi.object({
  ticketId: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid ticket ID format',
    'any.required': 'ticketId is required',
  }),
  commentId: Joi.number().integer().required().messages({
    "number.base": "CommentId must be a number.",
    "number.integer": "CommentId must be an integer.",
    "any.required": "CommentId is required.",
  }),
});
const updatecommentSchema = Joi.object({
  commentText: Joi.string().min(3).optional().required().messages({
    'string.empty': 'Comment text cannot be empty',
    'any.required': 'Comment text is required',
  }),
});
const getTicketCommentParams =Joi.object({
  ticketId: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid ticket ID format',
    'any.required': 'ticketId is required',
  }),
});

const  deleteCommentSchema = Joi.object({
  commentId: Joi.number().integer().required().messages({
    "number.base": "CommentId must be a number.",
    "number.integer": "CommentId must be an integer.",
    "any.required": "CommentId is required.",
  }),
});
const  getCommentByIdSchema = Joi.object({
  commentId: Joi.number().integer().required().messages({
    "number.base": "CommentId must be a number.",
    "number.integer": "CommentId must be an integer.",
    "any.required": "CommentId is required.",
  }),
});

//Country

const createCountrySchema = Joi.object({
  name: Joi.string().trim().min(2).required().messages({
    'string.empty': 'Country name is required',
    'string.min': 'Country name must be at least 2 characters long',
    'any.required': 'Country name is required',
  })
});
const getCountryByIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "CountryId must be a number.",
    "number.integer": "CountryId must be an integer.",
    "any.required": "CountryId is required.",
  }),
});
const updateCountrySchemaParams = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "CountryId must be a number.",
    "number.integer": "CountryId must be an integer.",
    "any.required": "CountryId is required.",
  }),
})
const updateCountrySchema = Joi.object({
  name: Joi.string().trim().min(2).required().messages({
    'string.empty': 'Country name is required',
    'string.min': 'Country name must be at least 2 characters long',
    'any.required': 'Country name is required',
  })
});
const deleteCountrySchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "CountryId must be a number.",
    "number.integer": "CountryId must be an integer.",
    "any.required": "CountryId is required.",
  }),
});
const getCountryWithStatesAndBranchesSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "CountryId must be a number.",
    "number.integer": "CountryId must be an integer.",
    "any.required": "CountryId is required.",
  }), 
});

const updateMasterDataSchema = Joi.object({
  countryId: Joi.number().integer().required().messages({
    'any.required': 'countryId is required',
    'number.base': 'countryId must be a number',
  }),
  countryName: Joi.string().trim().optional(),

  stateId: Joi.number().integer().required().messages({
    'any.required': 'stateId is required',
    'number.base': 'stateId must be a number',
  }),
  stateName: Joi.string().trim().optional(),

  locationId: Joi.number().integer().required().messages({
    'any.required': 'locationId is required',
    'number.base': 'locationId must be a number',
  }),
  locationName: Joi.string().trim().optional(),

  branchId: Joi.number().integer().required().messages({
    'any.required': 'branchId is required',
    'number.base': 'branchId must be a number',
  }),
  branchName: Joi.string().trim().optional(),

  pincode: Joi.number().integer().optional().messages({
    'number.base': 'pincode must be a number',
    'number.integer': 'pincode must be an integer',
  }),
  countryRefId: Joi.number().integer().optional().messages({
    'number.base': 'countryRefId must be a number',
    'number.integer': 'countryRefId must be an integer',
  }),
  stateRefId: Joi.number().integer().optional().messages({
    'number.base': 'stateRefId must be a number',
    'number.integer': 'stateRefId must be an integer',
  }),
  locationRefId: Joi.number().integer().optional().messages({
    'number.base': 'locationRefId must be a number',
    'number.integer': 'locationRefId must be an integer',
  }),
});



//State
const createStateSchema = Joi.object({
  name: Joi.string().trim().min(2).required().messages({
    'string.empty': 'State name is required',
    'string.min': 'State name must be at least 2 characters long',
    'any.required': 'State name is required',
  }),
  countryId: Joi.number().integer().required().messages({
    "number.base": "CountryId must be a number.",
    "number.integer": "CountryId must be an integer.",
    "any.required": "CountryId is required.",
  }),
});
const getStateByIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "StateId must be a number.",
    "number.integer": "StateId must be an integer.",
    "any.required": "StateId is required.",
  })
});
const updateStateParams = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "StateId must be a number.",
    "number.integer": "StateId must be an integer.",
    "any.required": "StateId is required.",
  }),
});
const updateStateSchema = Joi.object({
  name: Joi.string().trim().min(2).required().messages({
    'string.empty': 'State name is required',
    'string.min': 'State name must be at least 2 characters long',
    'any.required': 'State name is required',
  }),
  countryId: Joi.number().integer().required().messages({
    "number.base": "CountryId must be a number.",
    "number.integer": "CountryId must be an integer.",
    "any.required": "CountryId is required.",
  }),
});
const deleteStateSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "StateId must be a number.",
    "number.integer": "StateId must be an integer.",
    "any.required": "StateId is required.",
  }),
});
const getStatesByCountrySchema =Joi.object({
  countryId: Joi.number().integer().required().messages({
    "number.base": "CountryId must be a number.",
    "number.integer": "CountryId must be an integer.",
    "any.required": "CountryId is required.",
  }),
});

//Location 

const createLocationSchema = Joi.object({
  name: Joi.string().trim().min(2).required().messages({
    'string.empty': 'Location name is required',
    'string.min': 'Location name must be at least 2 characters long',
    'any.required': 'Location name is required',
  }),
  countryId: Joi.number().integer().required().messages({
    "number.base": "CountryId must be a number.",
    "number.integer": "CountryId must be an integer.",
    "any.required": "CountryId is required.",
  }),
  stateId: Joi.number().integer().required().messages({
    "number.base": "StateId must be a number.",
    "number.integer": "StateId must be an integer.",
    "any.required": "StateId is required.",
  }),
});
const getLocationByIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "LocationId must be a number.",
    "number.integer": "LocationId must be an integer.",
    "any.required": "LocationId is required.",
  })
});
const updateLocationParams = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "LocationId must be a number.",
    "number.integer": "LocationId must be an integer.",
    "any.required": "LocationId is required.",
  }),
});
const updateLocationSchema = Joi.object({
  name: Joi.string().trim().min(2).required().messages({
    'string.empty': 'Location name is required',
    'string.min': 'Location name must be at least 2 characters long',
    'any.required': 'Location name is required',
  }),
  countryId: Joi.number().integer().required().messages({
    "number.base": "CountryId must be a number.",
    "number.integer": "CountryId must be an integer.",
    "any.required": "CountryId is required.",
  }),
  stateId: Joi.number().integer().required().messages({
    "number.base": "StateId must be a number.",
    "number.integer": "StateId must be an integer.",
    "any.required": "StateId is required.",
  }),
});
const deleteLocationSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "LocationId must be a number.",
    "number.integer": "LocationId must be an integer.",
    "any.required": "LocationId is required.",
  }),
});
const getLocationsByStateSchema =Joi.object({
  stateId: Joi.number().integer().required().messages({
    "number.base": "StateId must be a number.",
    "number.integer": "StateId must be an integer.",
    "any.required": "StateId is required.",
  }),
  });
 const getLocationsByCountryAndStateSchema =Joi.object({
  countryId: Joi.number().integer().required().messages({
    "number.base": "CountryId must be a number.",
    "number.integer": "CountryId must be an integer.",
    "any.required": "CountryId is required.",
  }),
  stateId: Joi.number().integer().required().messages({
    "number.base": "StateId must be a number.",
    "number.integer": "StateId must be an integer.",
    "any.required": "StateId is required.",
  }),
 })
  //Branch

const createBranchSchema = Joi.object({
  name: Joi.string().trim().min(2).required().messages({
    'string.empty': 'Branch name is required',
    'string.min': 'Branch name must be at least 2 characters long',
    'any.required': 'Branch name is required',
  }),
  pincode: Joi.number().integer().required().messages({
    "number.base": "Pincode must be a number.",
    "number.integer": "Pincode must be an integer.",
    "any.required": "Pincode is required.",
  }),
  countryId: Joi.number().integer().required().messages({
    "number.base": "CountryId must be a number.",
    "number.integer": "CountryId must be an integer.",
    "any.required": "CountryId is required.",
  }),
  stateId: Joi.number().integer().required().messages({
    "number.base": "StateId must be a number.",
    "number.integer": "StateId must be an integer.",
    "any.required": "StateId is required.",
  }),
  locationId: Joi.number().integer().required().messages({
    "number.base": "LocationId must be a number.",
    "number.integer": "LocationId must be an integer.",
    "any.required": "LocationId is required.",
  }),
});
const getBranchByIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "BranchId must be a number.",
    "number.integer": "BranchId must be an integer.",
    "any.required": "BranchId is required.",
  })
});
const updateBranchParams = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "BranchId must be a number.",
    "number.integer": "BranchId must be an integer.",
    "any.required": "BranchId is required.",
  }),
});
const updateBranchSchema = Joi.object({
  name: Joi.string().trim().min(2).required().messages({
    'string.empty': 'Branch name is required',
    'string.min': 'Branch name must be at least 2 characters long',
    'any.required': 'Branch name is required',
  }),
  pincode: Joi.number().integer().required().messages({
    "number.base": "Pincode must be a number.",
    "number.integer": "Pincode must be an integer.",
    "any.required": "Pincode is required.",
  }),
  countryId: Joi.number().integer().required().messages({
    "number.base": "CountryId must be a number.",
    "number.integer": "CountryId must be an integer.",
    "any.required": "CountryId is required.",
  }),
  stateId: Joi.number().integer().required().messages({
    "number.base": "StateId must be a number.",
    "number.integer": "StateId must be an integer.",
    "any.required": "StateId is required.",
  }),
  locationId: Joi.number().integer().required().messages({
    "number.base": "LocationId must be a number.",
    "number.integer": "LocationId must be an integer.",
    "any.required": "LocationId is required.",
  }),
});
const deleteBranchSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "BranchId must be a number.",
    "number.integer": "BranchId must be an integer.",
    "any.required": "BranchId is required.",
  }),
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ errors: error.details.map((err) => err.message) });
  }
  next();
};
const validateQuery = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.query, { abortEarly: false });
  if (error) {
    return res.status(400).json({ errors: error.details.map((err) => err.message) });
  }
  next();
};

const validateParams= (schema) => (req, res, next) => {
  const { error } = schema.validate(req.params, { abortEarly: false });
  if (error) {
    return res.status(400).json({ errors: error.details.map((err) => err.message) });
  }
  next();
};

module.exports = {
  registerValidator: validate(registerSchema),
  loginValidator: validate(loginSchema),
  forgetPasswordValidator: validate(forgetPasswordSchema),
  resetPasswordValidator: validate(resetPasswordSchema),
  changePasswordValidator: validate(changePasswordSchema),
  resendVerifyEmailValidator : validate(resendVerifyEmailSchema),
  
  roleValidator: validate(roleSchema),
  getRoleByIdvalidator: validateParams(getRollByIdsSchema),
 
  moduleValidator: validate(moduleSchema),
  getModulesValidator: validateParams(getModuleByIdSchema),
 
  permissionValidator: validate(permissionSchema),
  getPermissionValidator: validateParams(getPermissionByIdSchema),
  
  createRoleModulePermissionValidator: validate(createRoleModulePermissionSchema),
  getModulesForRoleValidator:validateQuery(getModulesForRoleSchema),
  getModulesAndPermissionsByRoleValidator:validateQuery(getModulesAndPermissionsByRole),
  deleteModuleSchemaValidator:validateParams(deleteModuleSchema),
  deletePermissionSchemaValidator:validateParams(deletePermissionSchema),
  updatePermissionSchemaValidator:validate(updatePermissionSchema),
  updateModuleSchemaValidator:validate(updateModuleSchema),
  deleteRoleValidator: validateParams(deleteRoleSchema),

  createDepartmentSchemaValidator: validate(createDepartmentSchema),
  getDepartmentByIdSchemaValidator: validateParams(getDepartmentByIdSchema),
  updateDepartmentSchemaValidator: validate(updateDepartmentSchema),
  deleteDepartmentSchemaValidator: validateParams(deleteDepartmentSchema),

  createUservalidator: validate(createUservalidator),
  updateUservalidator: validate(updateUservalidator),
  viewUservalidator: validateParams(viewUserSchema),
  deleteUservalidator: validateParams(deleteUserSchema),

  createCategorySchemaValidator: validate(createCategorySchema),
  getCategoryByIdSchemaValidator: validateParams(getCategoryByIdSchema),
  updateCategorySchemaValidator: validate(updateCategorySchema),
  deleteCategorySchemaValidator: validateParams(deleteCategorySchema),

  createTicketSchemaValidator: validate(createTicketSchema),
  assignTicketParamsSchemaValidator: validateParams(assignTicketParamsSchema),

  assignTicketSchemaValidator: validate(assignTicketSchema),
  getTicketByIdSchemaValidator: validateParams(getTicketByIdSchema),
  getUserByTicketsSchemaValidator: validateParams(getUserByTicketsSchema),

  updateTicketParamsSchemaValidator: validateParams(updateTicketParamsSchema),
  updateTicketSchemaValidator: validate(updateTicketSchema),

  viewTicketSchemaValidator: validateParams(viewTicketSchema),
  deleteTicketSchemaValidator: validateParams(deleteTicketSchema),
  exportTicketsSchemaValidator: validateQuery(exportTicketsSchema),
  getImageSchemaValidator: validateParams(getImageSchema),

  updateTicketStatusSchemaValidator: validate(updateTicketStatusSchema),
  updateTicketStatusParamsSchemaValidator: validateParams(updateTicketStatusParamsSchema),
  deleteTicketSchemaValidator: validateParams(deleteTicketSchema),

  addcommentParmasValidator : validateParams(addcommentSchemaParams),
  addcommentValidator : validate(addcommentSchema),
  updateCommentParamsValidation : validateParams(updatecommentSchemaParams),
  updatecommentValidatior : validate(updatecommentSchema),
  getTicketCommentValidator : validateParams(getTicketCommentParams),
  deleteCommentValidator : validateParams(deleteCommentSchema),
  getCommentByIdValidator : validateParams(getCommentByIdSchema),

  createCountrySchemaValidator : validate(createCountrySchema),
  getCountryByIdSchemaValidator : validateParams(getCountryByIdSchema),
  updateCountrySchemaParamsValidator : validateParams(updateCountrySchemaParams),
  updateCountrySchemaValidator : validate(updateCountrySchema),
  deleteCountrySchemaValidator : validateParams(deleteCountrySchema),
  getCountryWithStatesAndBranchesSchemaValidator : validateParams(getCountryWithStatesAndBranchesSchema),
  updateMasterDataSchemaValidator : validate(updateMasterDataSchema),
  
  createStateSchemaValidator : validate(createStateSchema),
  getStateByIdSchemaValidator : validateParams(getStateByIdSchema),
  updateStateSchemaParamsValidator : validateParams(updateStateParams),
  updateStateSchemaValidator : validate(updateStateSchema),
  deleteStateSchemaValidator : validateParams(deleteStateSchema),
  getStatesByCountrySchemaValidator : validateQuery(getStatesByCountrySchema),

  createLocationSchemaValidator : validate(createLocationSchema),
  getLocationByIdSchemaValidator : validateParams(getLocationByIdSchema),
  updateLocationSchemaParamsValidator : validateParams(updateLocationParams),
  updateLocationSchemaValidator : validate(updateLocationSchema),
  deleteLocationSchemaValidator : validateParams(deleteLocationSchema),
  getLocationsByStateSchemaValidator : validateQuery(getLocationsByStateSchema),
  getLocationsByCountryAndStateSchemaValidator : validateQuery(getLocationsByCountryAndStateSchema),

  createBranchSchemaValidator : validate(createBranchSchema),
  getBranchByIdSchemaValidator : validateParams(getBranchByIdSchema),
  updateBranchSchemaParamsValidator : validateParams(updateBranchParams),
  updateBranchSchemaValidator : validate(updateBranchSchema),
  deleteBranchSchemaValidator : validateParams(deleteBranchSchema),
  

  
};
