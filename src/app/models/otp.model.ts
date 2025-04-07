import { modelOptions, prop, Ref } from '@typegoose/typegoose';
import { User } from './user.model';

@modelOptions({
    schemaOptions: {
        timestamps: true,
    },
})
export class OTP {
    @prop({ required: true, ref: () => User })
    public userId!: Ref<User>;

    @prop({
        required: true,
        validate: {
            validator: (v: string) => /^\d{4}$/.test(v),
            message: 'OTP must be exactly 4 digits',
        },
    })
    public otpNumber!: string;

    @prop({ required: true })
    public expiresAt!: Date;

    @prop({ required: true, default: false })
    public isUsed!: boolean;

    @prop({ required: true, default: 0 })
    public attempts!: number;
}
