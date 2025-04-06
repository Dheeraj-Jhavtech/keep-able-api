import type { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import { MongooseError } from 'mongoose';
import z, { ZodError, type ZodIssue } from 'zod';
import ErrorHandler from './ErrorHandler';

const ErrorSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    statusCode: z.number(),
    error: z.any(),
});

type ExtendedZodIssue = ZodIssue & {
    received: string;
};

// type ErrorType = TypeOf<typeof ErrorSchema>

export const globalErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof MongooseError) {
        // Wrong mongodb id error
        if (err.name === 'CastError') {
            const message = 'Resourse not found.';
            err = new ErrorHandler(message, 400);
        }

        // Duplicate key error
        if (err.code === 11000) {
            const message = `Duplicate ${Object.keys(err.keyValue as string[]).join(',')} entered`;
            err = new ErrorHandler(message, 400);
        }
    }

    if (err instanceof JsonWebTokenError) {
        // wrong JWT error
        if (err.name === 'JsonWebTokenError') {
            const message = 'JWT token is invalid please try again';
            err = new ErrorHandler(message, 400);
        }

        // JWT expired error
        if (err.name === 'JsonWebTokenError') {
            const message = 'JWT token is expired please try again';
            err = new ErrorHandler(message, 400);
        }
    }

    // if (err instanceof multer.MulterError) {
    //     err = new ErrorHandler(err.message, 400);
    // }

    // if (err instanceof AxiosError) {
    //     if (err?.response !== undefined) {
    //         const message: string = err?.response?.data?.error?.message ?? 'Axios API error occurred';
    //         err = new ErrorHandler(message, 400);
    //     }
    // }

    if (err instanceof ZodError) {
        const message = `Invalid input: ${err.errors
            .map((e) => e as ExtendedZodIssue)
            .map((e) => `${e.message} ${e.path.join('.')} ${e.received}`)
            .join(', ')}`;

        err = new ErrorHandler(message, 400);
    }

    if (err.statusCode === undefined) {
        err.statusCode = 500;
    }

    if (err.message === undefined) {
        err.message = 'Internal Server Error';
    }

    if (err.success === undefined) {
        err.success = false;
    }

    const error = ErrorSchema.parse(err);

    return res.status(error.statusCode).json({
        success: error.success,
        message: err.message,
    });
};
