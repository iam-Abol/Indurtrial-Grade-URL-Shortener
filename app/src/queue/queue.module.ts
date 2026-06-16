import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'analytics',
    }),
  ],
})
export class QueueModule {}
