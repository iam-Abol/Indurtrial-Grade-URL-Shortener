import { IsString, IsUrl } from 'class-validator';

export class CreateShortUrlDto {
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
    },
    {
      message: 'Invalid URL format',
    },
  )
  longUrl: string;
}
