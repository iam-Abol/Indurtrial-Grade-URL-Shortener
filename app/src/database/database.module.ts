import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
//test
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'Abolz',
      password: '123456',
      database: 'url_shortener',
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
