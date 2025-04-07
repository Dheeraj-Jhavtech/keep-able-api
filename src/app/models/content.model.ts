import { modelOptions, prop, Ref } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { User } from './user.model';

export enum ContentType {
    VIDEO = 'video',
    PODCAST = 'podcast',
    IMAGE = 'image',
    TEXT = 'text',
    FILE = 'file',
}

export enum ContentStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
}

export enum ProcessingStatus {
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

@modelOptions({
    schemaOptions: {
        timestamps: true,
    },
})
export class Content {
    @prop({ required: true })
    public title!: string;

    @prop({ required: true })
    public shortDescription!: string;

    @prop()
    public longDescription?: string;

    @prop({ type: () => [String], default: [] })
    public tags!: string[];

    @prop({ type: () => [Types.ObjectId], ref: 'Category' })
    public categoryIds!: Ref<'Category'>[];

    @prop({ required: true, enum: ContentType })
    public type!: ContentType;

    @prop({ required: true, default: true })
    public visibility!: boolean;

    @prop()
    public coverImageUrl?: string;

    @prop()
    public fileUrl?: string;

    @prop()
    public fileId?: string;

    @prop({ required: true, enum: ContentStatus, default: ContentStatus.DRAFT })
    public status!: ContentStatus;

    @prop({ required: true, enum: ProcessingStatus, default: ProcessingStatus.PROCESSING })
    public processingStatus!: ProcessingStatus;

    @prop()
    public publishedAt?: Date;

    @prop()
    public expirationDate?: Date;

    @prop({ required: true, default: 1 })
    public version!: number;

    @prop({ required: true, default: 1 })
    public dbVersion!: number;

    @prop({ required: true, ref: () => User })
    public authorId!: Ref<User>;
}
