import { modelOptions, prop, Ref } from '@typegoose/typegoose';
import { User } from './user.model';

export enum MediaType {
    VIDEO = 'video',
    AUDIO = 'audio',
    IMAGE = 'image',
    FILE = 'file',
}

@modelOptions({
    schemaOptions: {
        timestamps: true,
    },
})
export class Media {
    @prop({ required: true })
    public fileId!: string;

    @prop({ required: true })
    public fileUrl!: string;

    @prop({ required: true, enum: MediaType })
    public type!: MediaType;

    @prop({ required: true, ref: () => User })
    public uploadedBy!: Ref<User>;
}
