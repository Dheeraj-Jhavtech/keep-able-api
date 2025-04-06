/**
 * @description This file contains all functions for handling authentication requests
 */

import { Request, Response } from 'express';
import { UserModel } from '../models';
import { OTP } from '../models/otp.model';
import { User } from '../models/user.model';
import { generateAccessToken } from '../../jwt/helpers/access-token.helper';
import { generateRefreshToken, verifyRefreshToken } from '../../jwt/helpers/refresh-token.helper';
import { resSuccess, resFailed } from '../helpers/response.helper';
import { getModelForClass } from '@typegoose/typegoose';
import { logger } from '../../logger/index';
import IRequest from '../../interfaces/i-request';

const OTPModel = getModelForClass(OTP);

/**
 * @description Handle guest login using device ID
 */
async function guestLogin(req: Request, res: Response): Promise<Response> {
    try {
        const { deviceId } = req.body;

        // Find or create guest user
        let user = await UserModel.findOne({ deviceId, isGuest: true });

        if (!user) {
            user = await UserModel.create({
                name: `Guest-${deviceId.slice(0, 8)}`,
                deviceId,
                isGuest: true,
                role: 'guest',
            });
        }

        // Generate tokens
        const payload = { id: user._id, role: user.role };
        const token = generateAccessToken(payload, '1h');
        const refreshToken = generateRefreshToken(payload, '7d');

        return resSuccess(res, 200, 'Guest login successful', {
            token,
            refreshToken,
            expiresIn: 3600, // 1 hour in seconds
        });
    } catch (error: any) {
        logger.error('guestLogin', error.message);
        return resFailed(res, 500, { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
    }
}

/**
 * @description Send OTP to user's phone number
 */
async function sendOTP(req: Request, res: Response): Promise<Response> {
    try {
        const { phone } = req.body;

        // Find or create user
        let user = await UserModel.findOne({ phoneNumber: phone });

        if (!user) {
            user = await UserModel.create({
                name: `User-${phone.slice(-4)}`,
                phoneNumber: phone,
                isGuest: false,
                role: 'user',
            });
        }

        // Generate 4-digit OTP
        const otpNumber = Math.floor(1000 + Math.random() * 9000).toString();

        // Save OTP
        await OTPModel.create({
            userId: user._id,
            otpNumber,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
            isUsed: false,
            attempts: 0,
        });

        // TODO: Integrate with actual SMS service
        // For now, just return success response
        return resSuccess(res, 200, 'OTP sent successfully');
    } catch (error: any) {
        logger.error('sendOTP', error.message);
        return resFailed(res, 500, { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
    }
}

/**
 * @description Verify OTP and generate tokens
 */
async function verifyOTP(req: Request, res: Response): Promise<Response> {
    try {
        const { phone, otp } = req.body;

        const user = await UserModel.findOne({ phoneNumber: phone });

        if (!user) {
            return resFailed(res, 404, { code: 'USER_NOT_FOUND', message: 'User not found' });
        }

        const otpRecord = await OTPModel.findOne({
            userId: user._id,
            isUsed: false,
            expiresAt: { $gt: new Date() },
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return resFailed(res, 400, { code: 'OTP_EXPIRED', message: 'OTP expired or not found' });
        }

        if (otpRecord.attempts >= 3) {
            return resFailed(res, 400, { code: 'MAX_ATTEMPTS_EXCEEDED', message: 'Maximum attempts exceeded' });
        }

        // 0000 will be master otp - remove this after the notification is implemented
        // Check for master OTP (0000) or actual OTP
        if (otp !== '0000' && otpRecord.otpNumber !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return resFailed(res, 400, { code: 'INVALID_OTP', message: 'Invalid OTP' });
        }

        // Mark OTP as used
        otpRecord.isUsed = true;
        await otpRecord.save();

        // Generate tokens
        const payload = { id: user._id, role: user.role };
        const token = generateAccessToken(payload, '1h');
        const refreshToken = generateRefreshToken(payload, '7d');

        return resSuccess(res, 200, 'OTP verified successfully', {
            token,
            refreshToken,
            expiresIn: 3600, // 1 hour in seconds
        });
    } catch (error: any) {
        logger.error('verifyOTP', error.message);
        return resFailed(res, 500, { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
    }
}

/**
 * @description Refresh access token using refresh token
 */
async function refreshToken(req: Request, res: Response): Promise<Response> {
    try {
        const { refreshToken: oldRefreshToken } = req.body;

        // Verify refresh token and get payload
        const decoded = (await verifyRefreshToken(oldRefreshToken)) as any;

        if (!decoded || !decoded.id) {
            return resFailed(res, 401, { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid refresh token' });
        }

        const user = await UserModel.findById(decoded.id);

        if (!user) {
            return resFailed(res, 404, { code: 'USER_NOT_FOUND', message: 'User not found' });
        }

        // Generate new tokens
        const payload = { id: user._id, role: user.role };
        const token = generateAccessToken(payload, '1h');
        const refreshToken = generateRefreshToken(payload, '7d');

        return resSuccess(res, 200, 'Tokens refreshed successfully', {
            token,
            refreshToken,
            expiresIn: 3600, // 1 hour in seconds
        });
    } catch (error: any) {
        logger.error('refreshToken', error.message);
        return resFailed(res, 401, { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid refresh token' });
    }
}

/**
 * @description Get user profile
 */
async function getProfile(req: IRequest, res: Response): Promise<Response> {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return resFailed(res, 401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
        }

        const user = await UserModel.findById(userId, { __v: 0 });

        if (!user) {
            return resFailed(res, 404, { code: 'USER_NOT_FOUND', message: 'User not found' });
        }

        return resSuccess(res, 200, 'Profile retrieved successfully', {
            id: user._id,
            name: user.name,
            phone: user.phoneNumber,
            email: user.email,
            role: user.role,
            isGuest: user.isGuest,
        });
    } catch (error: any) {
        logger.error('getProfile', error.message);
        return resFailed(res, 500, { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
    }
}

export default {
    guestLogin,
    sendOTP,
    verifyOTP,
    refreshToken,
    getProfile,
};
