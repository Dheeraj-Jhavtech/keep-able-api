import { Request, Response } from 'express';
import { CategoryModel } from '../models';
import { resSuccess, resFailed } from '../helpers/response.helper';
import { Content } from '../models/content.model';
import { getModelForClass } from '@typegoose/typegoose';

const ContentModel = getModelForClass(Content);

/**
 * @description Create a new category
 */
async function createCategory(req: Request, res: Response): Promise<Response> {
    try {
        const { name, description } = req.body;

        const category = await CategoryModel.create({
            name,
            description,
        });

        return resSuccess(res, 201, 'Category created successfully', category);
    } catch (error: any) {
        if (error.code === 11000) {
            return resFailed(res, 400, { code: 'DUPLICATE_CATEGORY', message: 'Category name already exists' });
        }
        return resFailed(res, 500, { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
    }
}

/**
 * @description Get all categories sorted by name
 */
async function getCategories(_req: Request, res: Response): Promise<Response> {
    try {
        const categories = await CategoryModel.find().sort({ name: 1 });
        return resSuccess(res, 200, 'Categories retrieved successfully', categories);
    } catch (error: any) {
        return resFailed(res, 500, { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
    }
}

/**
 * @description Get category by ID
 */
async function getCategoryById(req: Request, res: Response): Promise<Response> {
    try {
        const category = await CategoryModel.findById(req.params.id);
        if (!category) {
            return resFailed(res, 404, { code: 'CATEGORY_NOT_FOUND', message: 'Category not found' });
        }
        return resSuccess(res, 200, 'Category retrieved successfully', category);
    } catch (error: any) {
        return resFailed(res, 500, { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
    }
}

/**
 * @description Update category
 */
async function updateCategory(req: Request, res: Response): Promise<Response> {
    try {
        const { name, description } = req.body;
        const category = await CategoryModel.findByIdAndUpdate(req.params.id, { name, description }, { new: true, runValidators: true });

        if (!category) {
            return resFailed(res, 404, { code: 'CATEGORY_NOT_FOUND', message: 'Category not found' });
        }

        return resSuccess(res, 200, 'Category updated successfully', category);
    } catch (error: any) {
        if (error.code === 11000) {
            return resFailed(res, 400, { code: 'DUPLICATE_CATEGORY', message: 'Category name already exists' });
        }
        return resFailed(res, 500, { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
    }
}

/**
 * @description Delete category
 */
async function deleteCategory(req: Request, res: Response): Promise<Response> {
    try {
        // Check if category has associated content
        const contentCount = await ContentModel.countDocuments({
            categoryIds: req.params.id,
        });

        if (contentCount > 0) {
            return resFailed(res, 400, {
                code: 'CATEGORY_IN_USE',
                message: 'Cannot delete category with associated content',
            });
        }

        const category = await CategoryModel.findByIdAndDelete(req.params.id);
        if (!category) {
            return resFailed(res, 404, { code: 'CATEGORY_NOT_FOUND', message: 'Category not found' });
        }

        return resSuccess(res, 200, 'Category deleted successfully');
    } catch (error: any) {
        return resFailed(res, 500, { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
    }
}

export default {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
