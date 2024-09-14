import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';
import { CreateUser } from './types/create-user';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async findUserByEmail(email: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return null;
    }
    return user;
  }

  async createUser(createUser: CreateUser): Promise<UserDocument> {
    const newUser = new this.userModel(createUser);
    await newUser.save();
    return newUser;
  }

  async findUser(filter: FilterQuery<User>): Promise<UserDocument | null> {
    return this.userModel.findOne(filter);
  }

  async updateUser(filter: FilterQuery<User>, update: UpdateQuery<User>) {
    return this.userModel.updateOne(filter, update);
  }

  async findUserByResetPasswordToken(
    resetPasswordToken: string,
  ): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ resetPasswordToken });
    if (!user) {
      return null;
    }
    return user;
  }
}
