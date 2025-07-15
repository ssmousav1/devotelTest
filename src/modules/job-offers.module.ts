import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { JobOffer } from '../entities/job-offer.entity';
import { JobOffersService } from '../services/job-offers.service';
import { TransformationService } from '../services/transformation.service';
import { ApiClientService } from '../services/api-client.service';
import { JobOffersController } from '../controllers/job-offers.controller';
import { JobSyncService } from '../services/job-sync.service';

@Module({
  imports: [TypeOrmModule.forFeature([JobOffer]), HttpModule],
  controllers: [JobOffersController],
  providers: [
    JobOffersService,
    TransformationService,
    ApiClientService,
    JobSyncService,
  ],
  exports: [JobOffersService],
})
export class JobOffersModule {}
