/**
 * @description Admin authentication controller
 */

import { Request, Response } from 'express';
import { verifyAzureToken } from '../../../services/azure.service';
import { resSuccess, resFailed } from '../../helpers/response.helper';
import { generateAccessToken } from '../../../jwt/helpers/access-token.helper';
import { generateRefreshToken, verifyRefreshToken } from '../../../jwt/helpers/refresh-token.helper';
import IRequest from '../../../interfaces/i-request';
import { User } from '../../models/user.model';
import { getModelForClass } from '@typegoose/typegoose';

const UserModel = getModelForClass(User);

class AdminAuthController {
    /**
     * Handle Azure AD login
     */
    public static async login(req: Request, res: Response) {
        try {
            const { azureToken } = req.body;

            // Verify Azure AD token
            const azureUser = await verifyAzureToken(azureToken);

            // Find or create admin user
            const adminUser = await UserModel.findOne({ email: azureUser.email });
            if (!adminUser) {
                return resFailed(res, 400, {
                    message: 'User not found',
                    code: 'USER_NOT_FOUND',
                });
            }

            // Generate JWT tokens
            const token = generateAccessToken({
                id: adminUser._id,
                role: adminUser.role,
            });
            const refreshToken = generateRefreshToken({
                id: adminUser._id,
                role: adminUser.role,
            });

            return resSuccess(res, 200, 'Login successful', {
                token,
                refreshToken,
                expiresIn: 3600,
            });
        } catch (error) {
            return resFailed(res, 500, {
                message: 'Login failed: ' + (error as Error).message,
                code: 'LOGIN_FAILED',
            });
        }
    }

    /**
     * Get admin profile
     */
    public static async getProfile(req: IRequest, res: Response) {
        try {
            const adminUser = req.user;

            const { id } = adminUser || {};
            const user = await UserModel.findById(id);

            if (!user) {
                return resFailed(res, 404, {
                    message: 'User not found',
                    code: 'USER_NOT_FOUND',
                });
            }

            return resSuccess(res, 200, 'Profile fetched successfully', {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            });
        } catch (error) {
            return resFailed(res, 500, {
                message: 'Failed to fetch profile',
                code: 'PROFILE_FETCH_FAILED',
            });
        }
    }

    /**
     * Refresh access token using refresh token
     */
    public static async refreshToken(req: Request, res: Response) {
        try {
            const { refreshToken: oldRefreshToken } = req.body;

            // Verify refresh token and get payload
            const decoded = (await verifyRefreshToken(oldRefreshToken)) as any;

            if (!decoded || !decoded.id) {
                return resFailed(res, 401, {
                    message: 'Invalid refresh token',
                    code: 'INVALID_REFRESH_TOKEN',
                });
            }

            // Verify user exists and is an admin
            const adminUser = await UserModel.findById(decoded.id);
            if (!adminUser || adminUser.role !== 'admin') {
                return resFailed(res, 401, {
                    message: 'Unauthorized',
                    code: 'UNAUTHORIZED',
                });
            }

            // Generate new tokens
            const payload = { id: adminUser._id, role: adminUser.role };
            const token = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);

            return resSuccess(res, 200, 'Tokens refreshed successfully', {
                token,
                refreshToken,
                expiresIn: 3600,
            });
        } catch (error) {
            return resFailed(res, 401, {
                message: 'Invalid refresh token',
                code: 'INVALID_REFRESH_TOKEN',
            });
        }
    }
}

export default AdminAuthController;
