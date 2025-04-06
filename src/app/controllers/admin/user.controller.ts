/**
 * @description This file contain all functions for control request and response from user endpoints api
 * @description It will handle all request and response from user endpoints api to services
 * @author {Deo Sbrn}
 */

import { Request, Response } from 'express';
import { logger } from '../../../logger';
import { hash } from '../../helpers/hash.helper';
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
            return resFailed(res, 200, message);
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
            return resFailed(res, 404, message);
        }

        const message: string = 'Success get user by id';
        return resSuccess(res, 200, message, { user });
    } catch (error: any) {
        logger.error(getUserById.name, error.message);
        return resFailed(res, 500, error.message);
    }
}

/**
 * @description Create new user
 * @param {Request} req - Express Request object
 * @param {Response} res - Express Response object
 * @returns {Promise<Response>} - Promise object of Express Response
 */
async function createUser(req: Request, res: Response): Promise<Response> {
    try {
        const { name, phoneNumber, email, password, isGuest = false, role = 'user' } = req.body;

        // Check for duplicate email/phone only if they are provided
        const query = [];
        if (phoneNumber) query.push({ phoneNumber });
        if (email) query.push({ email });

        if (query.length > 0) {
            const existsUser = await UserService.getOneUser({ $or: query });
            if (existsUser) {
                const message: string = 'Phone number or email already exists';
                return resFailed(res, 400, message);
            }
        }

        const passwordHash = await hash(password);
        const data = { name, phoneNumber, email, password: passwordHash, isGuest, role };
        const user: User = await UserService.createUser(data);

        const message: string = 'Success create new user';
        return resSuccess(res, 201, message, { user });
    } catch (error: any) {
        logger.error(createUser.name, error.message);
        return resFailed(res, 500, error.message);
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
            const message: string = 'User not found';
            return resFailed(res, 404, message);
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
                    return resFailed(res, 400, message);
                }
            }
        }
        const user: User | null = await UserService.updateOneUserById(id, data);

        const message: string = 'Success update user by id';
        return resSuccess(res, 200, message, { user });
    } catch (error: any) {
        logger.error(updateUserById.name, error.message);
        return resFailed(res, 500, error.message);
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
            return resFailed(res, 404, message);
        }

        const data = { $pull: { sessions: [] } };
        await UserService.updateOneUserById(id, data);
        await UserService.deleteOneUserById(id);

        const message: string = 'Success delete user by id';
        return resSuccess(res, 200, message);
    } catch (error: any) {
        logger.error(deleteUserById.name, error.message);
        return resFailed(res, 500, error.message);
    }
}

export default { getAllUsers, getUserById, createUser, updateUserById, deleteUserById };
