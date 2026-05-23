import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateShortUrlDto } from './dtos/CreateShortUrl.dto';
import express from 'express';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';

@Controller('')
export class UrlController {
  constructor(private urlService: UrlService) {}

  @Post('shorten')
  @UseGuards(JwtAuthGuard)
  shorten(@Body() body: CreateShortUrlDto) {
    const { longUrl } = body;
    return this.urlService.shorten(longUrl);
  }

  @Get(':code')
  async redirect(@Param('code') code: string, @Res() res: express.Response) {
    const url = await this.urlService.redirect(code);
    return res.redirect(302, url.longUrl);
  }
}
