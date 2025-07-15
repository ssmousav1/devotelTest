import { Test, TestingModule } from '@nestjs/testing';
import { TransformationService } from './transformation.service';
import { API1Job, API2Job } from '../interfaces/api-responses.interface';

describe('TransformationService', () => {
  let service: TransformationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransformationService],
    }).compile();

    service = module.get<TransformationService>(TransformationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transformAPI1Job', () => {
    it('should transform API1 job correctly', () => {
      const api1Job: API1Job = {
        jobId: 'P1-123',
        title: 'Software Engineer',
        details: {
          location: 'New York, NY',
          type: 'Full-Time',
          salaryRange: '$80k - $120k',
        },
        company: {
          name: 'Tech Corp',
          industry: 'Technology',
        },
        skills: ['JavaScript', 'React', 'Node.js'],
        postedDate: '2025-07-01T10:00:00Z',
      };

      const result = service.transformAPI1Job(api1Job);

      expect(result).toEqual({
        externalId: 'provider1_P1-123',
        provider: 'provider1',
        title: 'Software Engineer',
        companyName: 'Tech Corp',
        companyIndustry: 'Technology',
        location: 'New York, NY',
        employmentType: 'Full-Time',
        salaryMin: 80000,
        salaryMax: 120000,
        salaryCurrency: 'USD',
        skills: ['JavaScript', 'React', 'Node.js'],
        postedDate: new Date('2025-07-01T10:00:00Z'),
      });
    });

    it('should handle missing salary range', () => {
      const api1Job: API1Job = {
        jobId: 'P1-124',
        title: 'Developer',
        details: {
          location: 'Remote',
          type: 'Contract',
          salaryRange: 'Competitive',
        },
        company: {
          name: 'StartUp Inc',
          industry: 'Software',
        },
        skills: [],
        postedDate: '2025-07-02T10:00:00Z',
      };

      const result = service.transformAPI1Job(api1Job);

      expect(result.salaryMin).toBeUndefined();
      expect(result.salaryMax).toBeUndefined();
      expect(result.salaryCurrency).toBe('USD');
    });
  });

  describe('transformAPI2Job', () => {
    it('should transform API2 job correctly', () => {
      const jobId = 'job-456';
      const api2Job: API2Job = {
        position: 'Backend Engineer',
        location: {
          city: 'San Francisco',
          state: 'CA',
          remote: true,
        },
        compensation: {
          min: 90000,
          max: 140000,
          currency: 'USD',
        },
        employer: {
          companyName: 'Big Tech',
          website: 'https://bigtech.com',
        },
        requirements: {
          experience: 3,
          technologies: ['Java', 'Spring', 'AWS'],
        },
        datePosted: '2025-07-03',
      };

      const result = service.transformAPI2Job(jobId, api2Job);

      expect(result).toEqual({
        externalId: 'provider2_job-456',
        provider: 'provider2',
        title: 'Backend Engineer',
        companyName: 'Big Tech',
        companyWebsite: 'https://bigtech.com',
        location: 'San Francisco',
        state: 'CA',
        isRemote: true,
        salaryMin: 90000,
        salaryMax: 140000,
        salaryCurrency: 'USD',
        skills: ['Java', 'Spring', 'AWS'],
        experienceRequired: 3,
        postedDate: new Date('2025-07-03'),
      });
    });
  });
});
