import { modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({
    schemaOptions: {
        timestamps: true,
        toJSON: {
            transform: (_, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    },
})
export class Category {
    @prop({ required: true, unique: true, trim: true })
    public name!: string;

    @prop({ trim: true })
    public description?: string;
}
