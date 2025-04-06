/**
 * @description This file contain a model for creating user schema using typegoose
 * @author {Deo Sbrn}
 */

import { Ref, pre, prop } from '@typegoose/typegoose';
import mongoose from 'mongoose';

enum Role {
    SUPER_ADMIN = 'super_admin',
    ADMIN = 'admin',
    USER = 'user',
    GUEST = 'guest',
}

@pre<User>('save', function () {
    this._id = new mongoose.Types.ObjectId();
})
export class User {
    @prop()
    public _id!: mongoose.Types.ObjectId;

    @prop({ required: true })
    public name!: string;

    @prop({ index: { unique: true, sparse: true, partialFilterExpression: { role: Role.USER } } })
    public phoneNumber?: string;

    @prop({ index: { unique: true, sparse: true, partialFilterExpression: { role: { $in: [Role.ADMIN, Role.SUPER_ADMIN] } } } })
    public email?: string;

    @prop({ index: { unique: true, sparse: true, partialFilterExpression: { role: Role.GUEST } } })
    public deviceId?: string;

    @prop({ required: true, default: false })
    public isGuest!: boolean;

    @prop()
    public avatar?: string;

    @prop({ enum: Role, default: Role.USER })
    public role?: Role;
}
