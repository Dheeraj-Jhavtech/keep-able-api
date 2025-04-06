import { modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({
    schemaOptions: {
        timestamps: true,
    },
})
export class Category {
    @prop({ required: true, unique: true })
    public name!: string;
}
