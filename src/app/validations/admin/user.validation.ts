import { z } from 'zod';

/**
 * @description Validation schema for creating admin user
 */
export const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email format'),
        role: z.enum(['admin', 'super_admin']).default('admin'),
        isGuest: z.boolean().default(false),
    }),
});

/**
 * @description Validation schema for updating admin user
 */
export const updateUserSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required').optional(),
        email: z.string().email('Invalid email format').optional(),
        role: z.enum(['admin', 'super_admin']).optional(),
    }),
});

/**
 * @description Type definitions for user validation schemas
 */
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
