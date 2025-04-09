/**
 * @description This file contains all routes for admin panel endpoints
 */

import express, { Router } from 'express';
import AdminAuthController from '../../app/controllers/admin/auth.controller';
import AdminUserController from '../../app/controllers/admin/user.controller';
import auth from '../../app/middlewares/auth.middleware';
import isAdmin from '../../app/middlewares/is-admin.middleware';
import isSuperAdmin from '../../app/middlewares/is-super-admin.middleware';
import validateReq from '../../app/middlewares/validateReq';
import { createUserSchema, updateUserSchema } from '../../app/validations/admin/user.validation';

const router: Router = express.Router();

// Auth routes
router.post('/login', AdminAuthController.login);

// Protected routes (requires admin authentication)
router.get('/profile', auth, isAdmin, AdminAuthController.getProfile);

// Super admin only routes
router
    .route('/users')
    .post(auth, isAdmin, isSuperAdmin, validateReq(createUserSchema), AdminUserController.create)
    .get(auth, isAdmin, isSuperAdmin, AdminUserController.list);

router
    .route('/users/:id')
    .put(auth, isAdmin, isSuperAdmin, validateReq(updateUserSchema), AdminUserController.update)
    .delete(auth, isAdmin, isSuperAdmin, AdminUserController.remove);

export default router;
