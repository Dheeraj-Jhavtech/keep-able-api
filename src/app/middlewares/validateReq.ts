import { Request, Response, NextFunction } from 'express';
import { z, AnyZodObject, ZodError } from 'zod';
import { resFailed } from '../helpers';

// ...

const validateReq = (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        return next();
    } catch (error: any) {
        if (error instanceof ZodError) {
            // return resFailed(res, 400, `${JSON.stringify(error.issues[0].path)} - ${error.issues[0].message}`);
            return resFailed(res, 400, {
                code: 'INVALID_PARAMS',
                message: error.issues[0].message,
            });
        }
        return resFailed(res, 500, {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal server error - Could Not validate the request',
        });
    }
};

// ...

export default validateReq;
