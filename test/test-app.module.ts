import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { JobOffersModule } from '../src/modules/job-offers.module';
import { testDatabaseConfig } from './test-database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.test', // Use test environment file if it exists
    }),
    TypeOrmModule.forRoot(testDatabaseConfig),
    ScheduleModule.forRoot(),
    HttpModule,
    JobOffersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class TestAppModule {}