/**
 * @description This file contain a model for creating user schema using typegoose
 * @author {Deo Sbrn}
 */

import { Ref, pre, prop } from '@typegoose/typegoose';
import mongoose from 'mongoose';

enum Role {
    ADMIN = 'admin',
    USER = 'user',
}

@pre<User>('save', function () {
    this._id = new mongoose.Types.ObjectId();
})
export class User {
    @prop()
    public _id!: mongoose.Types.ObjectId;

    @prop({ required: true })
    public name!: string;

    @prop({ required: true, unique: true })
    public phoneNumber!: string;

    @prop({ required: true, unique: true })
    public email!: string;

    @prop({ required: true })
    public password!: string;

    @prop()
    public avatar?: string;

    @prop()
    public bio?: string;

    @prop({ enum: Role, default: Role.USER })
    public role?: Role;
}
