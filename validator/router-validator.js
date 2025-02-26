const Joi = require('joi');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const registerSchema = Joi.object({
  firstname: Joi.string().min(3).required().messages({
    'string.empty': 'Firstname is required',
    'string.min': 'Username must be at least 3 characters long',
  }),
  lastname: Joi.string().min(3).required().messages({
    'string.empty': 'Lastname is required',
    'string.min': 'Lastname must be at least 3 characters long',
  }),
  email: Joi.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/,).required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email',
  }),
  password: Joi.string().pattern(passwordRegex).required().messages({
    'string.empty': 'Password is required',
    'string.pattern.base':
      'Password should be a combination of one uppercase, one lowercase, one special character, one digit, and be between 8 and 20 characters long',
  }),
  // confirmPassword: Joi.string().pattern(passwordRegex).required().messages({
  //   'string.empty': 'Confirm Password is required',
  //   'string.pattern.base':
  //     'Password should be a combination of one uppercase, one lowercase, one special character, one digit, and be between 8 and 20 characters long',
  // }),
  role: Joi.string().required().messages({
    'string.empty': 'Role is required',
    'string.base': 'Role must be a valid string',
  }),
  terms : Joi.boolean().required().messages({
    'string.empty': 'Terms is required',
    'string.base': 'Terms must be a valid string',
  })
});

const loginSchema = Joi.object({
  email: Joi.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/,).required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email',
  }),
  password: Joi.string().pattern(passwordRegex).required().messages({
    'string.empty': 'Password is required',
  }),
});

const forgetPasswordSchema = Joi.object({
  email: Joi.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/,).required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email',
  }),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Token is required',
    'string.base': 'Token must be a valid string',
  }),
  newPassword: Joi.string().pattern(passwordRegex).required().messages({
    'string.empty': 'New password is required',
    'string.pattern.base':
      'Password should be a combination of one uppercase, one lowercase, one special character, one digit, and be between 8 and 20 characters long',
  }),
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().pattern(passwordRegex).required().messages({
    'string.empty': 'Please enter your old password',
  }),
  newPassword: Joi.string().pattern(passwordRegex).required().messages({
    'string.empty': 'Please enter a new password',
    'string.pattern.base':
      'Password should be a combination of one uppercase, one lowercase, one special character, one digit, and be between 8 and 20 characters long',
  }),
});

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

const updateRoleSchema=Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "id must be a number.",
    "number.integer": "id must be an integer.",
    "any.required": "id is required.",
  }),
});

const deleteRoleSchema=Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "id must be a number.",
    "number.integer": "id must be an integer.",
    "any.required": "id is required.",
  }),
});

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
const updateModuleByIdSchema=Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "id must be a number.",
    "number.integer": "id must be an integer.",
    "any.required": "id is required.",
  }),
});

const deleteModuleByIdSchema=Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "id must be a number.",
    "number.integer": "id must be an integer.",
    "any.required": "id is required.",
  }),
});

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

const updatePermissionByIdSchema=Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "id must be a number.",
    "number.integer": "id must be an integer.",
    "any.required": "id is required.",
  }),
});

const deletePermissionByIdSchema=Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "id must be a number.",
    "number.integer": "id must be an integer.",
    "any.required": "id is required.",
  }),
});

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
  moduleName: Joi.string().optional().messages({
    'string.base': 'moduleName must be a string.',
  }),
}).or('moduleId', 'moduleName');

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

  roleValidator: validate(roleSchema),
  getRoleByIdvalidator: validateParams(getRollByIdsSchema),
  updateRoleValidator: validateParams(updateRoleSchema),
  deleteRoleValidator: validateParams(deleteRoleSchema),

  moduleValidator: validate(moduleSchema),
  getModulesValidator: validateParams(getModuleByIdSchema),
  updateModuleValidator :validateParams(updateModuleByIdSchema),
  deleteModulevalidator: validateParams(deleteModuleByIdSchema),

  permissionValidator: validate(permissionSchema),
  getPermissionValidator: validateParams(getPermissionByIdSchema),
  updatePermissionValidator: validateParams(updatePermissionByIdSchema),
  deletePermissionValidator: validateParams(deletePermissionByIdSchema),

  createRoleModulePermissionValidator: validate(createRoleModulePermissionSchema),
  getModulesForRoleValidator:validateQuery(getModulesForRoleSchema),
  getModulesAndPermissionsByRoleValidator:validateQuery(getModulesAndPermissionsByRole),
  deleteModuleSchemaValidator:validate(deleteModuleSchema),
  deletePermissionSchemaValidator:validate(deletePermissionSchema),
  updatePermissionSchemaValidator:validate(updatePermissionSchema),
  updateModuleSchemaValidator:validate(updateModuleSchema),
};
