import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async create(email: string, password: string) {
    const SALT_ROUNDS = 12;
    const existingUser = await this.repo.findOne({
      where: { email },
      select: ['id'],
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = this.repo.create({
      email,
      password_hash,
    });

    try {
      return await this.repo.save(user);
    } catch (err) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const { password_hash, ...result } = user;
    return result;
  }
}
