import { Injectable, OnModuleInit } from '@nestjs/common';

import { BloomFilter } from 'bloom-filters';

import { UrlService } from '../url/url.service';

@Injectable()
export class BloomFilterService implements OnModuleInit {
  private filter: BloomFilter;

  private readonly EXPECTED_ITEMS = 10_000_000;
  private readonly FALSE_POSITIVE_RATE = 0.01;
  constructor(private urlService: UrlService) {
    this.filter = BloomFilter.create(
      this.EXPECTED_ITEMS,
      this.FALSE_POSITIVE_RATE,
    );
  }
  async onModuleInit() {
    console.log('Hydrating Bloom Filter...');
    const allCodes = await this.urlService.getShortCodes();
    allCodes.forEach((u) => this.filter.add(u.shortCode));
    console.log(`Bloom Filter ready with ${allCodes.length} codes.`);
  }
  add(shortCode: string) {
    this.filter.add(shortCode);
  }
  mightContain(shortCode: string): boolean {
    return this.filter.has(shortCode);
  }
}
