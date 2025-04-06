import { modelOptions, prop, Ref } from '@typegoose/typegoose';
import { User } from './user.model';
import { Content } from './content.model';

@modelOptions({
    schemaOptions: {
        timestamps: true,
    },
})
export class Download {
    @prop({ required: true, ref: () => User })
    public userId!: Ref<User>;

    @prop({ required: true, ref: () => Content })
    public contentId!: Ref<Content>;

    @prop({ required: true, default: Date.now })
    public downloadedAt!: Date;
}
