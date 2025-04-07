import { z } from 'zod';

// Guest login validation schema
export const guestLoginSchema = z.object({
    body: z.object({
        deviceId: z.string().min(1, 'Device ID is required'),
    }),
});

// Send OTP validation schema
export const sendOtpSchema = z.object({
    body: z.object({
        phone: z
            .string({
                required_error: 'Phone number is required',
            })
            .min(10, 'Phone number must be at least 10 digits')
            .max(15, 'Phone number must not exceed 15 digits')
            .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
    }),
});

// Verify OTP validation schema
export const verifyOtpSchema = z.object({
    body: z.object({
        phone: z
            .string()
            .min(10, 'Phone number must be at least 10 digits')
            .max(15, 'Phone number must not exceed 15 digits')
            .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
        otp: z.string().length(4, 'OTP must be 4 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
    }),
});

// Refresh token validation schema
export const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string({
            required_error: 'Refresh token is required',
        }),
    }),
});
