/**
 * @description This file contains all routes for category management endpoints
 * @author {Naveen Kandula}
 */

import express, { Router } from 'express';
import CategoryController from '../../app/controllers/admin/category.controller';
import isAdmin from '../../app/middlewares/is-admin.middleware';
import auth from '../../app/middlewares/auth.middleware';

const router: Router = express.Router();

/**
 * @method POST
 * @access private (admin only)
 * @endpoint /api/admin/categories
 */
router.post('/', auth, isAdmin, CategoryController.createCategory);

/**
 * @method GET
 * @access private (admin only)
 * @endpoint /api/admin/categories
 */
router.get('/', auth, isAdmin, CategoryController.getCategories);

/**
 * @method GET
 * @access private (admin only)
 * @endpoint /api/admin/categories/:id
 */
router.get('/:id', auth, isAdmin, CategoryController.getCategoryById);

/**
 * @method PUT
 * @access private (admin only)
 * @endpoint /api/admin/categories/:id
 */
router.put('/:id', auth, isAdmin, CategoryController.updateCategory);

/**
 * @method DELETE
 * @access private (admin only)
 * @endpoint /api/admin/categories/:id
 */
router.delete('/:id', auth, isAdmin, CategoryController.deleteCategory);

export default router;
