/**
 * @description This file contain a method to init express application
 * @description It will connect to database MongoDB and use all middlewares
 * @description It also contain all routes for all endpoints
 * @author {Deo Sbrn}
 */

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import { rateLimit } from 'express-rate-limit';
import morgan from 'morgan';
import { resFailed } from './app/helpers/response.helper';
import { corsConfig, limitterConfig } from './config/app';
import database from './config/database';
import mainRoute from './routes/main.route';
import healthCheckRoute from './routes/health-check.route';
import authRoute from './routes/auth.route';
import adminRoute from './routes/admin/index';

/**
 * @description Init express application
 * @returns {Application} - Express application
 */
const init = function (): Application {
    // * Init express app
    const app: Application = express();

    // * Connect to database
    database();

    // * Middlewares
    app.use(cors(corsConfig()));
    app.use(rateLimit(limitterConfig()));
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('dev'));

    // * Main Route
    app.use('/api/v1/auth', authRoute);
    app.use('/api/v1/admin', adminRoute);
    app.use('/api', mainRoute);
    app.use('/health-check', healthCheckRoute);

    // * 404 Not Found
    app.use((_, res) =>
        resFailed(res, 404, {
            message: 'Not Found',
            code: 'NOT_FOUND',
        }),
    );

    // * Return express app
    return app;
};

export default init;
