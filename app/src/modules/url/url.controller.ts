import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateShortUrlDto } from './dtos/CreateShortUrl.dto';
import express from 'express';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { RedirectMetadata } from './interfaces/redirect-metadata.interface';

@Controller('')
export class UrlController {
  constructor(private urlService: UrlService) {}

  @Post('shorten')
  @UseGuards(JwtAuthGuard)
  shorten(@Body() body: CreateShortUrlDto, @Req() req) {
    const { longUrl, expiresInDays } = body;
    return this.urlService.shorten(longUrl, req.user.userId, expiresInDays);
  }
  @Get('urls/my')
  @UseGuards(JwtAuthGuard)
  async myUrls(@Req() req) {
    return this.urlService.findMyUrls(req.user.userId);
  }

  @Delete('urls/:id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.urlService.delete(id, req.user.userId);
  }

  @Get(':code')
  async redirect(
    @Param('code') code: string,
    @Res() res: express.Response,
    @Req() req: express.Request,
  ) {
    const metadata: RedirectMetadata = {
      ip: req.ip ?? '',
      userAgent: req.headers['user-agent'] ?? '',
      referer: req.headers.referer ?? '',
    };

    const url = await this.urlService.redirect(code, metadata);

    return res.redirect(302, url);
  }
}
