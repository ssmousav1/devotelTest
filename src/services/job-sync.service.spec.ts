import { Test, TestingModule } from '@nestjs/testing';
import { JobSyncService } from './job-sync.service';
import { JobOffersService } from './job-offers.service';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';

// Mock cron module before imports
jest.mock('cron');

describe('JobSyncService', () => {
  let service: JobSyncService;
  let jobOffersService: jest.Mocked<JobOffersService>;
  let configService: jest.Mocked<ConfigService>;
  let schedulerRegistry: jest.Mocked<SchedulerRegistry>;
  let mockCronJob: any;
  let CronJobMock: jest.Mock;

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    mockCronJob = {
      start: jest.fn(),
      stop: jest.fn(),
    };

    // Mock the CronJob constructor
    CronJobMock = jest.fn().mockImplementation(() => mockCronJob);
    require('cron').CronJob = CronJobMock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobSyncService,
        {
          provide: JobOffersService,
          useValue: {
            syncJobsFromProviders: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: SchedulerRegistry,
          useValue: {
            addCronJob: jest.fn(),
            getCronJob: jest.fn(),
            deleteCronJob: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JobSyncService>(JobSyncService);
    jobOffersService = module.get(JobOffersService);
    configService = module.get(ConfigService);
    schedulerRegistry = module.get(SchedulerRegistry);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should run initial sync and set up cron job with default schedule', async () => {
      const defaultCronExpression = '0 */6 * * *';
      configService.get.mockReturnValue(defaultCronExpression);
      jobOffersService.syncJobsFromProviders.mockResolvedValue(undefined);

      const loggerSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation();

      await service.onModuleInit();

      // Verify initial sync was called
      expect(jobOffersService.syncJobsFromProviders).toHaveBeenCalledTimes(1);

      // Verify cron expression was fetched from config
      expect(configService.get).toHaveBeenCalledWith(
        'CRON_SCHEDULE',
        '0 */6 * * *',
      );

      // Verify cron job was created with correct parameters
      expect(CronJobMock).toHaveBeenCalledWith(
        defaultCronExpression,
        expect.any(Function),
      );

      // Verify cron job was registered
      expect(schedulerRegistry.addCronJob).toHaveBeenCalledWith(
        'job-sync',
        mockCronJob,
      );

      // Verify cron job was started
      expect(mockCronJob.start).toHaveBeenCalled();

      // Verify logger messages
      expect(loggerSpy).toHaveBeenCalledWith(
        'Running initial job synchronization on startup',
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        `Job sync scheduled with cron expression: ${defaultCronExpression}`,
      );

      loggerSpy.mockRestore();
    });

    it('should use custom cron expression from environment', async () => {
      const customCronExpression = '0 0 * * *'; // Daily at midnight
      configService.get.mockReturnValue(customCronExpression);
      jobOffersService.syncJobsFromProviders.mockResolvedValue(undefined);

      const loggerSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation();

      await service.onModuleInit();

      expect(configService.get).toHaveBeenCalledWith(
        'CRON_SCHEDULE',
        '0 */6 * * *',
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        `Job sync scheduled with cron expression: ${customCronExpression}`,
      );

      loggerSpy.mockRestore();
    });

    it('should handle initial sync failure gracefully', async () => {
      configService.get.mockReturnValue('0 */6 * * *');
      jobOffersService.syncJobsFromProviders.mockRejectedValue(
        new Error('Sync failed'),
      );

      const loggerErrorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      await service.onModuleInit();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Job synchronization failed',
        'Sync failed',
      );

      loggerErrorSpy.mockRestore();
    });
  });

  describe('handleCron', () => {
    it('should log and call syncJobs when cron triggers', async () => {
      jobOffersService.syncJobsFromProviders.mockResolvedValue(undefined);
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation();

      await service.handleCron();

      expect(loggerSpy).toHaveBeenCalledWith(
        'Running scheduled job synchronization',
      );
      expect(jobOffersService.syncJobsFromProviders).toHaveBeenCalledTimes(1);

      loggerSpy.mockRestore();
    });
  });

  describe('syncJobs', () => {
    it('should successfully sync jobs and log success', async () => {
      jobOffersService.syncJobsFromProviders.mockResolvedValue(undefined);
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation();

      await service.syncJobs();

      expect(jobOffersService.syncJobsFromProviders).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Job synchronization completed successfully',
      );

      loggerSpy.mockRestore();
    });

    it('should handle sync errors and log them', async () => {
      const error = new Error('Provider API is down');
      jobOffersService.syncJobsFromProviders.mockRejectedValue(error);
      const loggerErrorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      await service.syncJobs();

      expect(jobOffersService.syncJobsFromProviders).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Job synchronization failed',
        'Provider API is down',
      );

      loggerErrorSpy.mockRestore();
    });
  });

  describe('cron job execution', () => {
    it('should register cron job with correct callback', async () => {
      configService.get.mockReturnValue('* * * * *');
      jobOffersService.syncJobsFromProviders.mockResolvedValue(undefined);

      let capturedCallback: () => Promise<void>;

      // Capture the callback passed to CronJob
      CronJobMock.mockImplementation((expression, callback) => {
        capturedCallback = callback;
        return mockCronJob;
      });

      await service.onModuleInit();

      // Verify CronJob was called
      expect(CronJobMock).toHaveBeenCalledWith(
        '* * * * *',
        expect.any(Function),
      );

      // Test the callback by executing it
      const handleCronSpy = jest.spyOn(service, 'handleCron');

      // Execute the captured callback
      await capturedCallback!();

      // Verify handleCron was called
      expect(handleCronSpy).toHaveBeenCalledTimes(1);

      handleCronSpy.mockRestore();
    });
  });

  afterAll(() => {
    // Ensure all timers are cleared
    jest.clearAllTimers();
  });
});
