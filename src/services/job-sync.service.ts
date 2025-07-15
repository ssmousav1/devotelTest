import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { JobOffersService } from './job-offers.service';
import { CronJob } from 'cron';

@Injectable()
export class JobSyncService implements OnModuleInit {
  private readonly logger = new Logger(JobSyncService.name);

  constructor(
    private readonly jobOffersService: JobOffersService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    this.logger.log('Running initial job synchronization on startup');
    await this.syncJobs();

    // Set up dynamic cron job
    const cronExpression = this.configService.get<string>(
      'CRON_SCHEDULE',
      '0 */6 * * * * ',
    );

    const job = new CronJob(cronExpression, async (): Promise<void> => {
      await this.handleCron();
    });

    this.schedulerRegistry.addCronJob('job-sync', job);
    job.start();

    this.logger.log(
      `Job sync scheduled with cron expression: ${cronExpression}`,
    );
  }

  async handleCron() {
    this.logger.log('Running scheduled job synchronization');
    await this.syncJobs();
  }

  async syncJobs() {
    try {
      await this.jobOffersService.syncJobsFromProviders();
      this.logger.log('Job synchronization completed successfully');
    } catch (error) {
      this.logger.error('Job synchronization failed', error.message);
    }
  }
}
