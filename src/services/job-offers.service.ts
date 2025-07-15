import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobOffer } from '../entities/job-offer.entity';
import { TransformationService } from './transformation.service';
import { ApiClientService } from './api-client.service';

@Injectable()
export class JobOffersService {
  private readonly logger = new Logger(JobOffersService.name);

  constructor(
    @InjectRepository(JobOffer)
    private readonly jobOfferRepository: Repository<JobOffer>,
    private readonly transformationService: TransformationService,
    private readonly apiClientService: ApiClientService,
  ) {}

  async syncJobsFromProviders(): Promise<void> {
    this.logger.log('Starting job synchronization');
    // you can add new API providers by adding the to'apiClientService'
    const { provider1, provider2 } = await this.apiClientService.fetchAllJobs();

    const transformedJobs: Partial<JobOffer>[] = [];

    if (provider1) {
      const provider1Jobs = provider1.jobs.map((job) =>
        this.transformationService.transformAPI1Job(job),
      );
      transformedJobs.push(...provider1Jobs);
    }

    if (provider2) {
      const provider2Jobs = Object.entries(provider2.data.jobsList).map(
        ([jobId, job]) =>
          this.transformationService.transformAPI2Job(jobId, job),
      );
      transformedJobs.push(...provider2Jobs);
    }

    await this.saveJobsToDatabase(transformedJobs);

    this.logger.log(
      `Synchronization complete. Processed ${transformedJobs.length} jobs`,
    );
  }

  private async saveJobsToDatabase(jobs: Partial<JobOffer>[]): Promise<void> {
    for (const job of jobs) {
      try {
        const existingJob = await this.jobOfferRepository.findOne({
          where: { externalId: job.externalId },
        });

        if (existingJob) {
          await this.jobOfferRepository.update(existingJob.id, job);
          this.logger.log(`Updated job ${job.externalId}`);
        } else {
          await this.jobOfferRepository.save(job);
          this.logger.log(`Created new job ${job.externalId}`);
        }
      } catch (error) {
        this.logger.error(`Error saving job ${job.externalId}`, error.message);
      }
    }
  }

  async findAll(filters: {
    title?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    data: JobOffer[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query = this.jobOfferRepository.createQueryBuilder('job');

    if (filters.title) {
      query.andWhere('LOWER(job.title) LIKE LOWER(:title)', {
        title: `%${filters.title}%`,
      });
    }

    if (filters.location) {
      query.andWhere('LOWER(job.location) LIKE LOWER(:location)', {
        location: `%${filters.location}%`,
      });
    }

    if (filters.salaryMin) {
      query.andWhere('job.salaryMax >= :salaryMin', {
        salaryMin: filters.salaryMin,
      });
    }

    if (filters.salaryMax) {
      query.andWhere('job.salaryMin <= :salaryMax', {
        salaryMax: filters.salaryMax,
      });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);
    query.orderBy('job.postedDate', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
