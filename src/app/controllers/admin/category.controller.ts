import { Request, Response } from 'express';
import { CategoryModel } from '../../models';
import IRequest from '../../../interfaces/i-request';

class CategoryController {
    /**
     * Create a new category
     * @param {IRequest} req
     * @param {Response} res
     */
    async createCategory(req: IRequest, res: Response) {
        try {
            const category = await CategoryModel.create(req.body);
            return res.status(201).json({
                success: true,
                data: category,
                message: 'Category created successfully',
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Get all categories
     * @param {Request} req
     * @param {Response} res
     */
    async getCategories(req: Request, res: Response) {
        try {
            const categories = await CategoryModel.find();
            return res.status(200).json({
                success: true,
                data: categories,
                message: 'Categories retrieved successfully',
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Get category by ID
     * @param {Request} req
     * @param {Response} res
     */
    async getCategoryById(req: Request, res: Response) {
        try {
            const category = await CategoryModel.findById(req.params.id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found',
                });
            }
            return res.status(200).json({
                success: true,
                data: category,
                message: 'Category retrieved successfully',
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Update category
     * @param {Request} req
     * @param {Response} res
     */
    async updateCategory(req: Request, res: Response) {
        try {
            const category = await CategoryModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found',
                });
            }
            return res.status(200).json({
                success: true,
                data: category,
                message: 'Category updated successfully',
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Delete category
     * @param {Request} req
     * @param {Response} res
     */
    async deleteCategory(req: Request, res: Response) {
        try {
            const category = await CategoryModel.findByIdAndDelete(req.params.id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found',
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Category deleted successfully',
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
}

export default new CategoryController();
