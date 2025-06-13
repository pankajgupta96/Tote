const mongoose = require('mongoose');
const Joi = require('joi');

const addressSchema = new mongoose.Schema({
  state: {
    type: String,
    required: [true, 'State is required'],
    minlength: [2, 'State must be at least 2 characters'],
    maxlength: [50, 'State cannot exceed 50 characters']
  },
  zip: {
    type: Number,
    required: [true, 'ZIP code is required']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    minlength: [2, 'City must be at least 2 characters'],
    maxlength: [50, 'City cannot exceed 50 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    minlength: [5, 'Address must be at least 5 characters'],
    maxlength: [200, 'Address cannot exceed 200 characters']
  }
});



const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: Number,
    match: /^[0-9]{10}$/
  },
  addresses: {
    type: [addressSchema]
  },
  googleId: {
    type: String
  },
  facebookId: {
  type: String
},
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});


const validateUser = (data, isUpdate = false) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: isUpdate 
      ? Joi.string().min(6).optional() 
      : Joi.string().min(6).required(),
    phone: Joi.string().custom((value, helpers) => {
      if (value && !phone(value).isValid) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'Phone validation').optional(),  
    addresses: Joi.array().items(
      Joi.object({
        state: Joi.string().min(2).max(50).required(),
        zip: Joi.number().integer().positive().required(),
        city: Joi.string().min(2).max(50).required(),
        address: Joi.string().min(5).max(200).required()
      })
    ).optional()  
  
  });

  return schema.validate(data, {abortEarly: false} );
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
  });

  return schema.validate(data, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });
};




const User = mongoose.model('User', userSchema);

module.exports = {
  User,
  validateUser,
  validateLogin
};

