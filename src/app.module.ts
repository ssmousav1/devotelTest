import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobOffer } from './entities/job-offer.entity';
import { JobOffersModule } from './modules/job-offers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'job-offers.sqlite',
      entities: [JobOffer],
      synchronize: true,
      logging: true,
      autoLoadEntities: true,
    }),
    ScheduleModule.forRoot(),
    HttpModule,
    JobOffersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
