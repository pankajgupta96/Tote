const mongoose = require("mongoose");
const Joi = require('joi');

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        minlength: [2, 'Category name must be at least 2 characters'],
        maxlength: [50, 'Category name cannot exceed 50 characters']
    }
});

const validateCategory = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required()
    });

    return schema.validate(data);
};

module.exports = {
    categoryModel: mongoose.model("Category", categorySchema),
    validateCategory
};