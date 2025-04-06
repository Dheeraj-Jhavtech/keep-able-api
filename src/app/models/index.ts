/**
 * @description This file contains all models
 * @author {Deo Sbrn}
 */

import { getModelForClass, setGlobalOptions } from '@typegoose/typegoose';
import { User } from './user.model';
import { Content } from './content.model';
import { Category } from './category.model';
import { Download } from './download.model';
import { Media } from './media.model';

/**
 * @description This function is used to set global options for all models
 */
setGlobalOptions({ schemaOptions: { timestamps: true } });

// Convert class schema to mongoose model
export const UserModel = getModelForClass(User);
export const ContentModel = getModelForClass(Content);
export const CategoryModel = getModelForClass(Category);
export const DownloadModel = getModelForClass(Download);
export const MediaModel = getModelForClass(Media);
