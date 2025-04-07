/**
 * @description This file contain all functions for control request and response from user endpoints api
 * @description It will handle all request and response from user endpoints api to services
 * @author {Deo Sbrn}
 */

import { Request, Response } from 'express';
import { logger } from '../../../logger';
import { resFailed, resSuccess } from '../../helpers/response.helper';
import { User } from '../../models/user.model';
import UserService from '../../services/user.service';

/**
 * @description Get all users
 * @param {Request} _ - Express Request object
 * @param {Response} res - Express Response object
 * @returns {Promise<Response>} - Promise object of Express Response
 */
async function getAllUsers(_: Request, res: Response): Promise<Response> {
    try {
        const users: User[] = await UserService.getAllUsers();

        if (!users.length) {
            const message: string = 'Users empty';
            return resFailed(res, 200, {
                code: 'USERS_EMPTY',
                message,
            });
        }

        const message: string = 'Success get all users';
        return resSuccess(res, 200, message, { users });
    } catch (error: any) {
        logger.error(getAllUsers.name, error.message);
        return resFailed(res, 500, error.message);
    }
}

/**
 * @description Get user by id
 * @param {Request} req - Express Request object
 * @param {Response} res - Express Response object
 * @returns {Promise<Response>} - Promise object of Express Response
 */
async function getUserById(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = req.params;
        const user: User | null = await UserService.getOneUserById(id);

        if (!user) {
            const message: string = 'User not found';
            return resFailed(res, 404, {
                code: 'USER_NOT_FOUND',
                message,
            });
        }

        const message: string = 'Success get user by id';
        return resSuccess(res, 200, message, { user });
    } catch (error: any) {
        logger.error(getUserById.name, error.message);
        return resFailed(res, 500, {
            code: 'GET_FAILED',
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
async function createAdminUser(req: Request, res: Response): Promise<Response> {
    try {
        const { name, email, isGuest = false, role = 'admin' } = req.body;

        const existsUser = await UserService.getOneUser({ email });
        if (existsUser) {
            const message: string = 'Phone number or email already exists';
            return resFailed(res, 400, {
                code: 'DUPLICATE_DATA',
                message,
            });
        }
        const data = { name, email, isGuest, role };
        const user: User = await UserService.createUser(data);

        const message: string = 'Success create new user';
        return resSuccess(res, 201, message, { user });
    } catch (error: any) {
        logger.error(createAdminUser.name, error.message);
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
async function updateUserById(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = req.params;
        const isExistsUser: User | null = await UserService.getOneUserById(id);

        if (!isExistsUser) {
            return resFailed(res, 404, {
                code: 'USER_NOT_FOUND',
                message: 'User not found',
            });
        }

        const { name, phoneNumber, email, isGuest, role } = req.body;
        const data = { name, phoneNumber, email, isGuest, role };

        // Check for duplicate email/phone if they are being updated
        if (phoneNumber || email) {
            const query = [];
            if (phoneNumber) query.push({ phoneNumber, _id: { $ne: id } });
            if (email) query.push({ email, _id: { $ne: id } });

            if (query.length > 0) {
                const existsUser = await UserService.getOneUser({ $or: query });
                if (existsUser) {
                    const message: string = 'Phone number or email already exists';
                    return resFailed(res, 400, {
                        code: 'DUPLICATE_DATA',
                        message,
                    });
                }
            }
        }
        const user: User | null = await UserService.updateOneUserById(id, data);

        const message: string = 'Success update user by id';
        return resSuccess(res, 200, message, { user });
    } catch (error: any) {
        logger.error(updateUserById.name, error.message);
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
async function deleteUserById(req: Request, res: Response): Promise<Response> {
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

        const data = { $pull: { sessions: [] } };
        await UserService.updateOneUserById(id, data);
        await UserService.deleteOneUserById(id);

        const message: string = 'Success delete user by id';
        return resSuccess(res, 200, message);
    } catch (error: any) {
        logger.error(deleteUserById.name, error.message);
        return resFailed(res, 500, {
            code: 'DELETE_FAILED',
            message: error.message,
        });
    }
}

export default { getAllUsers, getUserById, createAdminUser, updateUserById, deleteUserById };
