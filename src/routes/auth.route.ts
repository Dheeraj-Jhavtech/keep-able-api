/**
 * @description This file contains all routes for authentication endpoints
 */

import { Router } from 'express';
import AuthController from '../app/controllers/auth.controller';
import auth from '../app/middlewares/auth.middleware';
import validateReq from '../app/middlewares/validateReq';
import { guestLoginSchema, sendOtpSchema, verifyOtpSchema, refreshTokenSchema } from '../app/validations/auth.validation';

const router = Router();

/**
 * @endpoint /api/v1/auth/guest-login
 * @method POST
 * @access Public
 */
router.post('/guest-login', validateReq(guestLoginSchema), AuthController.guestLogin);

/**
 * @endpoint /api/v1/auth/send-otp
 * @method POST
 * @access Public
 */
router.post('/send-otp', validateReq(sendOtpSchema), AuthController.sendOTP);

/**
 * @endpoint /api/v1/auth/verify-otp
 * @method POST
 * @access Public
 */
router.post('/verify-otp', validateReq(verifyOtpSchema), AuthController.verifyOTP);

/**
 * @endpoint /api/v1/auth/refresh-token
 * @method POST
 * @access Public
 */
router.post('/refresh-token', validateReq(refreshTokenSchema), AuthController.refreshToken);

/**
 * @endpoint /api/v1/profile
 * @method GET
 * @access Private
 */
router.get('/profile', auth, AuthController.getProfile);

export default router;
