import { IsInt, IsOptional, IsUrl, Max, Min } from 'class-validator';

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
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  expiresInDays?: number;
}
