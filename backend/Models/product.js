// const mongoose = require("mongoose");
// const Joi = require('joi');

// const productSchema = mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'Product name is required'],
//         minlength: [2, 'Product name must be at least 2 characters'],
//         maxlength: [100, 'Product name cannot exceed 100 characters']
//     },
//     price: {
//         type: Number,
//         required: [true, 'Price is required'],
//         min: [0, 'Price cannot be negative']
//     },
//     category: {
//         type: String,
//         required: [true, 'Category is required']
//     },
//     stock: {
//         type: Number,
//         required: [true, 'Stock is required'],
//         min: [0, 'Stock cannot be negative']
//     },
//     description: {
//         type: String,
//         maxlength: [1000, 'Description cannot exceed 1000 characters']
//     },
    
// });

// const validateProduct = (data) => {
//     const schema = Joi.object({
//   name: Joi.string().min(2).required().messages({
//     "string.empty": "Please enter the product name"
//   }),
//   price: Joi.number().positive().required().messages({
//     "number.base": "Price must be a number",
//     "any.required": "Please enter the product price"
//   }),
//   category: Joi.string().min(1).required().messages({
//     "string.empty": "Please enter the category",
//     "any.required": "Category is required"
//   }),
//   stock: Joi.number().integer().min(0).required().messages({
//     "number.base": "Stock must be a number",
//     "any.required": "Stock is required"
//   }),
//   description: Joi.string().min(10).required().messages({
//     "string.empty": "Please enter the product description",
//    "any.required": "Product description is required"
//   })
// });


// return schema.validateProduct(data, {
//     abortEarly: false,
//     allowUnknown: false,
//     stripUnknown: true
//   })

// module.exports = {
//     productModel: mongoose.model("Product", productSchema),
//     validateProduct
// }};



// const mongoose = require("mongoose");
// const Joi = require('joi');


// const productSchema = mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Product name is required'],
//     minlength: [2, 'Product name must be at least 2 characters'],
//     maxlength: [100, 'Product name cannot exceed 100 characters']
//   },
//   price: {
//     type: Number,
//     required: [true, 'Price is required'],
//     min: [0, 'Price cannot be negative']
//   },
//   category: {
//     type: String,
//     required: [true, 'Category is required']
//   },
//   stock: {
//     type: Number,
//     required: [true, 'Stock is required'],
//     min: [0, 'Stock cannot be negative']
//   },
//   description: {
//     type: String,
//     maxlength: [1000, 'Description cannot exceed 1000 characters']
//   },
// });

// const validateProduct = (data) => {
// const validateProduct = (data) => {
//   const schema = Joi.object({
//     name: Joi.string().min(2).required().empty("").messages({
//       "string.empty": "Please enter the product name",
//       "any.required": "Product name is required"
//     }),
//     price: Joi.number().positive().required().messages({
//       "number.base": "Price must be a number",
//       "any.required": "Please enter the product price"
//     }),
//     category: Joi.string().required().empty("").messages({
//       "string.empty": "Please enter the category",
//       "any.required": "Category is required"
//     }),
//     stock: Joi.number().integer().min(0).required().messages({
//       "number.base": "Stock must be a number",
//       "any.required": "Please enter the stock"
//     }),
//     description: Joi.string().min(10).required().empty("").messages({
//       "string.empty": "Please enter the product description",
//       "any.required": "Product description is required"
//     })
//   });

//   return schema.validate(data, {
//     abortEarly: false,
//     allowUnknown: false,
//     stripUnknown: true
//   });
// };
// };
// module.exports = {
//   productModel: mongoose.model("Product", productSchema),
//   validateProduct
// };



const mongoose = require("mongoose");
const Joi = require('joi');


const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    minlength: [2, 'Product name must be at least 2 characters'],
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
});


const validateProduct = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      "string.empty": "Please enter the product name",
      "any.required": "Product name is required",
      "string.min": "Product name must be at least 2 characters",
      "string.max": "Product name cannot exceed 100 characters"
    }),
    price: Joi.number().positive().required().messages({
      "number.base": "Price must be a number",
      "number.positive": "Price must be a positive number",
      "any.required": "Price is required"
    }),
    category: Joi.string().required().messages({
      "string.empty": "Please enter the category",
      "any.required": "Category is required"
    }),
    stock: Joi.number().integer().min(0).required().messages({
      "number.base": "Stock must be a number",
      "number.integer": "Stock must be an integer",
      "number.min": "Stock cannot be negative",
      "any.required": "Stock is required"
    }),
    description: Joi.string().max(1000).messages({
      "string.max": "Description cannot exceed 1000 characters"
    })
  });

  return schema.validate(data, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });
};

module.exports = {
  productModel: mongoose.model("Product", productSchema),
  validateProduct
};
