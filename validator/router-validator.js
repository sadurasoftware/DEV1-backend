const Joi = require('joi');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const registerSchema = Joi.object({
  username: Joi.string().min(3).required().messages({
    'string.empty': 'Username is required',
    'string.min': 'Username must be at least 3 characters long',
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
  role: Joi.string().required().messages({
    'string.empty': 'Role is required',
    'string.base': 'Role must be a valid string',
  }),
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
  })
})

const moduleSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'Module name is required',
    'string.min': 'Module name must be at least 3 characters long',
    'string.max': 'Module name must not exceed 50 characters',
  }),
});

const permissionSchema=Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'Permission name is required',
    'string.min': 'Permission name must be at least 3 characters long',
    'string.max': 'Permission name must not exceed 50 characters',
  }),
});

// const createRoleModulePermissionSchema = Joi.object({
//   roleId: Joi.number().integer().required(),
//   moduleId: Joi.array().items(Joi.number().integer().required()).required(),
//   permissionId: Joi.array().items(Joi.number().integer().required()).required(),
// }).custom((value, helpers) => {
//   if (value.moduleId.length !== value.permissionId.length) {
//     return helpers.message('moduleId and permissionId arrays must have the same length');
//   }
//   return value;
// });;

// const getModulesForRoleSchema = Joi.object({
//   roleId: Joi.number().integer().required().messages({
//     'number.base': 'roleId must be a number.',
//     'any.required': 'roleId is required.',
//   }),
// });

// const getModulesAndPermissionsByRole  = Joi.object({
//   roleId: Joi.number().integer().required().messages({
//     'number.base': 'roleId must be a number.',
//     'any.required': 'roleId is required.',
//   }),
// });
const addpermissionSchema = Joi.object({
  moduleId: Joi.number().integer().required(),
  permissions: Joi.array().items(
    Joi.object({
      permissionId: Joi.number().integer().required(),
    }).required()
  ).required(),
});

const rolePermissionsSchema = Joi.object({
  roleId: Joi.number().integer().required(),
  modulePermissions: Joi.array().items(addpermissionSchema).required(),
});
const removePermissionsSchema = Joi.object({
  roleId: Joi.number().integer().required().messages({
    'number.base': 'roleId must be a number.',
    'any.required': 'roleId is required.',
  }),
  moduleId: Joi.array().items(Joi.number().integer()).required().messages({
    'array.base': 'moduleId must be an array.',
    'any.required': 'moduleId is required.',
    'array.includes': 'moduleId must contain only numbers.',
  }),
  permissionId: Joi.array().items(Joi.number().integer()).required().messages({
    'array.base': 'permissionId must be an array.',
    'any.required': 'permissionId is required.',
    'array.includes': 'permissionId must contain only numbers.',
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

module.exports = {
  registerValidator: validate(registerSchema),
  loginValidator: validate(loginSchema),
  forgetPasswordValidator: validate(forgetPasswordSchema),
  resetPasswordValidator: validate(resetPasswordSchema),
  changePasswordValidator: validate(changePasswordSchema),
  roleValidator: validate(roleSchema),
  moduleValidator: validate(moduleSchema),
  permissionValidator: validate(permissionSchema),
  // createRoleModulePermissionValidator:validate(createRoleModulePermissionSchema),
  // getModulesForRoleValidator:validate(getModulesForRoleSchema),
  // getModulesAndPermissionsByRoleValidator:validate(getModulesAndPermissionsByRole),
  addModulePermissionValidator:validate(rolePermissionsSchema),
  removePermissionsSchemaValidator:validate(removePermissionsSchema),
  deleteModuleSchemaValidator:validate(deleteModuleSchema),
  deletePermissionSchemaValidator:validate(deletePermissionSchema),
  updatePermissionSchemaValidator:validate(updatePermissionSchema),
  updateModuleSchemaValidator:validate(updateModuleSchema),
};
