import { Test, TestingModule } from '@nestjs/testing';
import { JobOffersController } from './job-offers.controller';
import { JobOffersService } from '../services/job-offers.service';
import { JobOfferQueryDto } from '../dto/job-offer-query.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('JobOffersController', () => {
  let controller: JobOffersController;
  let jobOffersService: jest.Mocked<JobOffersService>;

  const mockJobOfferData = {
    id: 1,
    externalId: 'test_job_1',
    provider: 'test',
    title: 'Software Engineer',
    companyName: 'Tech Company',
    companyIndustry: 'Technology',
    companyWebsite: 'https://example.com',
    location: 'San Francisco, CA',
    state: 'CA',
    isRemote: false,
    employmentType: 'Full-time',
    salaryMin: 80000,
    salaryMax: 120000,
    salaryCurrency: 'USD',
    skills: ['JavaScript', 'TypeScript', 'Node.js'],
    experienceRequired: 3,
    postedDate: new Date('2024-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockServiceResult = {
    data: [mockJobOfferData],
    total: 1,
    page: 1,
    totalPages: 1,
  };

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobOffersController],
      providers: [
        {
          provide: JobOffersService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<JobOffersController>(JobOffersController);
    jobOffersService = module.get(JobOffersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated job offers with default parameters', async () => {
      const query: JobOfferQueryDto = {};
      jobOffersService.findAll.mockResolvedValue(mockServiceResult);

      const result = await controller.findAll(query);

      expect(jobOffersService.findAll).toHaveBeenCalledWith({
        title: undefined,
        location: undefined,
        salaryMin: undefined,
        salaryMax: undefined,
        page: undefined,
        limit: undefined,
      });

      expect(result).toEqual({
        success: true,
        data: [mockJobOfferData],
        pagination: {
          total: 1,
          page: 1,
          totalPages: 1,
          limit: 10, // Default limit
        },
      });
    });

    it('should return filtered job offers with title query', async () => {
      const query: JobOfferQueryDto = {
        title: 'Engineer',
        page: 1,
        limit: 10,
      };
      jobOffersService.findAll.mockResolvedValue(mockServiceResult);

      const result = await controller.findAll(query);

      expect(jobOffersService.findAll).toHaveBeenCalledWith({
        title: 'Engineer',
        location: undefined,
        salaryMin: undefined,
        salaryMax: undefined,
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        success: true,
        data: [mockJobOfferData],
        pagination: {
          total: 1,
          page: 1,
          totalPages: 1,
          limit: 10,
        },
      });
    });

    it('should return filtered job offers with location query', async () => {
      const query: JobOfferQueryDto = {
        location: 'San Francisco',
        page: 1,
        limit: 5,
      };
      jobOffersService.findAll.mockResolvedValue(mockServiceResult);

      const result = await controller.findAll(query);

      expect(jobOffersService.findAll).toHaveBeenCalledWith({
        title: undefined,
        location: 'San Francisco',
        salaryMin: undefined,
        salaryMax: undefined,
        page: 1,
        limit: 5,
      });

      expect(result).toEqual({
        success: true,
        data: [mockJobOfferData],
        pagination: {
          total: 1,
          page: 1,
          totalPages: 1,
          limit: 5,
        },
      });
    });

    it('should return filtered job offers with salary range', async () => {
      const query: JobOfferQueryDto = {
        salaryMin: 70000,
        salaryMax: 150000,
        page: 2,
        limit: 20,
      };
      jobOffersService.findAll.mockResolvedValue(mockServiceResult);

      const result = await controller.findAll(query);

      expect(jobOffersService.findAll).toHaveBeenCalledWith({
        title: undefined,
        location: undefined,
        salaryMin: 70000,
        salaryMax: 150000,
        page: 2,
        limit: 20,
      });

      expect(result).toEqual({
        success: true,
        data: [mockJobOfferData],
        pagination: {
          total: 1,
          page: 1,
          totalPages: 1,
          limit: 20,
        },
      });
    });

    it('should return filtered job offers with all query parameters', async () => {
      const query: JobOfferQueryDto = {
        title: 'Software Engineer',
        location: 'San Francisco',
        salaryMin: 80000,
        salaryMax: 120000,
        page: 1,
        limit: 15,
      };
      jobOffersService.findAll.mockResolvedValue(mockServiceResult);

      const result = await controller.findAll(query);

      expect(jobOffersService.findAll).toHaveBeenCalledWith({
        title: 'Software Engineer',
        location: 'San Francisco',
        salaryMin: 80000,
        salaryMax: 120000,
        page: 1,
        limit: 15,
      });

      expect(result).toEqual({
        success: true,
        data: [mockJobOfferData],
        pagination: {
          total: 1,
          page: 1,
          totalPages: 1,
          limit: 15,
        },
      });
    });

    it('should return empty results when no jobs match filters', async () => {
      const query: JobOfferQueryDto = {
        title: 'Nonexistent Job',
      };
      const emptyResult = {
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };
      jobOffersService.findAll.mockResolvedValue(emptyResult);

      const result = await controller.findAll(query);

      expect(result).toEqual({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          totalPages: 0,
          limit: 10,
        },
      });
    });

    it('should handle large datasets with pagination', async () => {
      const query: JobOfferQueryDto = {
        page: 3,
        limit: 25,
      };
      const largeDatasetResult = {
        data: Array(25).fill(mockJobOfferData),
        total: 150,
        page: 3,
        totalPages: 6,
      };
      jobOffersService.findAll.mockResolvedValue(largeDatasetResult);

      const result = await controller.findAll(query);

      expect(result).toEqual({
        success: true,
        data: Array(25).fill(mockJobOfferData),
        pagination: {
          total: 150,
          page: 3,
          totalPages: 6,
          limit: 25,
        },
      });
    });

    it('should throw HttpException when service throws an error', async () => {
      const query: JobOfferQueryDto = {};
      const serviceError = new Error('Database connection failed');
      jobOffersService.findAll.mockRejectedValue(serviceError);

      await expect(controller.findAll(query)).rejects.toThrow(
        new HttpException(
          {
            success: false,
            message: 'Failed to fetch job offers',
            error: 'Database connection failed',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      expect(jobOffersService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors gracefully', async () => {
      const query: JobOfferQueryDto = { title: 'Test' };
      jobOffersService.findAll.mockRejectedValue(
        new Error('Service unavailable'),
      );

      let thrownError;
      try {
        await controller.findAll(query);
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(HttpException);
      expect(thrownError.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(thrownError.getResponse()).toEqual({
        success: false,
        message: 'Failed to fetch job offers',
        error: 'Service unavailable',
      });
    });

    it('should use default limit when not provided', async () => {
      const query: JobOfferQueryDto = {
        title: 'Engineer',
        page: 1,
      };
      jobOffersService.findAll.mockResolvedValue(mockServiceResult);

      const result = await controller.findAll(query);

      expect(result.pagination.limit).toBe(10);
    });

    it('should preserve custom limit in response', async () => {
      const query: JobOfferQueryDto = {
        limit: 50,
      };
      jobOffersService.findAll.mockResolvedValue(mockServiceResult);

      const result = await controller.findAll(query);

      expect(result.pagination.limit).toBe(50);
    });
  });

  describe('Controller structure', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have jobOffersService injected', () => {
      expect(controller['jobOffersService']).toBeDefined();
    });

    it('should have findAll method', () => {
      expect(typeof controller.findAll).toBe('function');
    });
  });
});
