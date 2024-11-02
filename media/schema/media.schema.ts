import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MediaDocument = HydratedDocument<Media>;

@Schema({
  timestamps: true,
  validateBeforeSave: true,
  autoIndex: true,
  toJSON: { virtuals: true },
})
export class Media {
  @Prop({ type: String })
  key: string;

  @Prop({ type: String })
  url: string;

  @Prop({ type: String })
  type: string;

  @Prop()
  size: number;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
