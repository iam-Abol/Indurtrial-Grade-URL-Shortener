import { Body, Controller, Post } from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateShortUrlDto } from './dtos/CreateShortUrl.dto';

@Controller('api/url')
export class UrlController {
  constructor(private urlService: UrlService) {}

  @Post('/shorten')
  shorent(@Body() body: CreateShortUrlDto) {
    const { longUrl } = body;
    return this.urlService.shorten(longUrl);
  }
}
