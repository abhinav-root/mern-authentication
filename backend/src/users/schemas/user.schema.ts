import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ type: String, required: true, unique: true })
  password: string;

  @Prop({ type: String, required: true, lowercase: true, trim: true })
  name: string;

  @Prop({ default: null, type: Date })
  lastLoginAt: Date | null;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: null, type: String })
  resetPasswordToken: string | null;

  @Prop({ default: null, type: Date })
  resetPasswordTokenExpiresAt: Date | null;

  @Prop({ default: null, type: String })
  verificationCode: string | null;

  @Prop({ default: null, type: Date })
  verificationCodeExpiresAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
