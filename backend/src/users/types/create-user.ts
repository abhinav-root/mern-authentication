export type CreateUser = {
  name: string;
  email: string;
  password: string;
  verificationCode: string;
  verificationCodeExpiresAt: Date;
};
