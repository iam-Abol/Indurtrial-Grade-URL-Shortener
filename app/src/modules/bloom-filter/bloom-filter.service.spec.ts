import { Test, TestingModule } from '@nestjs/testing';
import { BloomFilterService } from './bloom-filter.service';

describe('BloomFilterService', () => {
  let service: BloomFilterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BloomFilterService],
    }).compile();

    service = module.get<BloomFilterService>(BloomFilterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
