import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UrlRepository {
  constructor(
    @InjectRepository(Url)
    private readonly repo: Repository<Url>,
  ) {}
}
