import { IsString } from 'class-validator';

export class ShortenDto {
  @IsString()
  test: string;
}
