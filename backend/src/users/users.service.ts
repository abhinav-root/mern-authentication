import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from './schemas/user.schema';
import { CreateUser } from './types/create-user';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return null;
    }
    return user;
  }

  async createUser(createUser: CreateUser): Promise<User> {
    const newUser = new this.userModel(createUser);
    await newUser.save();
    return newUser;
  }
}
