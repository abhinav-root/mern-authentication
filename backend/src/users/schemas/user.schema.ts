import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, unique: true })
  password: string;

  @Prop({ required: true, lowercase: true, trim: true })
  name: string;

  @Prop()
  lastLoginAt: Date;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordTokenExpiresAt?: Date;

  @Prop()
  verificationCode?: string;

  @Prop()
  verificationCodeExpiresAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
