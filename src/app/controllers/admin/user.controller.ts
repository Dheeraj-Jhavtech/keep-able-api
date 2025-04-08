/**
 * @description Admin user management controller for handling CRUD operations
 */

import { Request, Response } from 'express';
import { logger } from '../../../logger';
import { resFailed, resSuccess } from '../../helpers/response.helper';
import { User } from '../../models/user.model';
import UserService from '../../services/user.service';
import IRequest from '../../../interfaces/i-request';

/**
 * @description Get all users
 * @param {Request} _ - Express Request object
 * @param {Response} res - Express Response object
 * @returns {Promise<Response>} - Promise object of Express Response
 */
async function getAllAdminUsers(_: Request, res: Response): Promise<Response> {
    try {
        const adminUsers: User[] = await UserService.getAllUsers({ role: 'admin' });

        if (!adminUsers.length) {
            const message: string = 'Admin users empty';
            return resFailed(res, 200, {
                code: 'ADMIN_USERS_EMPTY',
                message,
            });
        }

        const message: string = 'Success get all admin users';
        return resSuccess(res, 200, message, { users: adminUsers });
    } catch (error: any) {
        logger.error(getAllAdminUsers.name, error.message);
        return resFailed(res, 500, {
            code: 'LIST_FAILED',
            message: error.message,
        });
    }
}

/**
 * @description Create new user
 * @param {Request} req - Express Request object
 * @param {Response} res - Express Response object
 * @returns {Promise<Response>} - Promise object of Express Response
 */
async function create(req: Request, res: Response): Promise<Response> {
    try {
        const { name, email, role, isGuest } = req.body;

        const existsUser = await UserService.getOneUser({ email });
        if (existsUser) {
            return resFailed(res, 400, {
                code: 'DUPLICATE_EMAIL',
                message: 'Email already exists',
            });
        }

        const user: User = await UserService.createUser({ name, email, role, isGuest });

        const message: string = 'Success create new user';
        return resSuccess(res, 201, message, {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error: any) {
        logger.error(create.name, error.message);
        return resFailed(res, 500, {
            code: 'CREATE_FAILED',
            message: error.message,
        });
    }
}

/**
 * @description Update user by id
 * @param {Request} req - Express Request object
 * @param {Response} res - Express Response object
 * @returns {Promise<Response>} - Promise object of Express Response
 */
async function update(req: IRequest, res: Response): Promise<Response> {
    try {
        const { id } = req.params;
        const isExistsUser: User | null = await UserService.getOneUserById(id);

        if (!isExistsUser) {
            return resFailed(res, 404, {
                code: 'USER_NOT_FOUND',
                message: 'User not found',
            });
        }

        // Prevent super admin from being demoted
        if (isExistsUser.role === 'super_admin' && req.user?.role !== 'super_admin') {
            return resFailed(res, 403, {
                code: 'FORBIDDEN',
                message: 'Cannot modify super admin user',
            });
        }

        const { name, email, role, isGuest } = req.body;

        // Check for duplicate email if it's being updated
        if (email && email !== isExistsUser.email) {
            const existsUser = await UserService.getOneUser({ email, _id: { $ne: id } });
            if (existsUser) {
                return resFailed(res, 400, {
                    code: 'DUPLICATE_EMAIL',
                    message: 'Email already exists',
                });
            }
        }

        const user: User | null = await UserService.updateOneUserById(id, { name, email, role, isGuest });

        const message: string = 'Success update user by id';
        return resSuccess(res, 200, message, {
            id: user?._id,
            name: user?.name,
            email: user?.email,
            role: user?.role,
        });
    } catch (error: any) {
        logger.error(update.name, error.message);
        return resFailed(res, 500, {
            code: 'UPDATE_FAILED',
            message: error.message,
        });
    }
}

/**
 * @description Delete user by id
 * @param {Request} req - Express Request object
 * @param {Response} res - Express Response object
 * @returns {Promise<Response>} - Promise object of Express Response
 */
async function remove(req: IRequest, res: Response): Promise<Response> {
    try {
        const { id } = req.params;
        const isExistsUser: User | null = await UserService.getOneUserById(id);

        if (!isExistsUser) {
            const message: string = 'User not found';
            return resFailed(res, 404, {
                code: 'USER_NOT_FOUND',
                message,
            });
        }

        // Prevent super admin from being deleted
        if (isExistsUser.role === 'super_admin') {
            return resFailed(res, 403, {
                code: 'FORBIDDEN',
                message: 'Cannot delete super admin user',
            });
        }

        // Prevent users from deleting themselves
        if (req.user?.id === id) {
            return resFailed(res, 403, {
                code: 'FORBIDDEN',
                message: 'Cannot delete your own account',
            });
        }

        await UserService.deleteOneUserById(id);

        const message: string = 'Success delete user by id';
        return resSuccess(res, 200, message);
    } catch (error: any) {
        logger.error(remove.name, error.message);
        return resFailed(res, 500, {
            code: 'DELETE_FAILED',
            message: error.message,
        });
    }
}

export default { list: getAllAdminUsers, create, update, remove };
