import { Body, Controller, Post } from '@nestjs/common';
import { UrlService } from './url.service';

@Controller('api/url')
export class UrlController {
  constructor(private urlService: UrlService) {}

  @Post('/shorten')
  shorent(@Body() body: any) {
    const { longUrl } = body;
    return this.urlService.shorten(longUrl);
  }
}
