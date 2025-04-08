import { z } from 'zod';

// Admin login validation schema
export const adminLoginSchema = z.object({
    body: z.object({
        azureToken: z.string({
            required_error: 'Azure token is required',
        }),
    }),
});

// Admin refresh token validation schema
export const adminRefreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string({
            required_error: 'Refresh token is required',
        }),
    }),
});
