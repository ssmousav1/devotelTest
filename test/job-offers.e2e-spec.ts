import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TestAppModule } from './test-app.module';
import { Repository, DataSource } from 'typeorm';
import { JobOffer } from '../src/entities/job-offer.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('JobOffersController (e2e)', () => {
  let app: INestApplication;
  let jobOfferRepository: Repository<JobOffer>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    jobOfferRepository = moduleFixture.get<Repository<JobOffer>>(
      getRepositoryToken(JobOffer),
    );

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Clear database before each test
    await jobOfferRepository.clear();
  });

  afterEach(async () => {
    // Clean up database connections
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    await app.close();
  });

  describe('/api/job-offers (GET)', () => {
    it('should return empty array when no jobs exist', () => {
      return request(app.getHttpServer())
        .get('/api/job-offers')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toEqual([]);
          expect(res.body).toHaveProperty('pagination');
          expect(res.body.pagination).toEqual({
            total: 0,
            page: 1,
            totalPages: 0,
            limit: 10,
          });
        });
    });

    it('should return paginated job offers', async () => {
      // Insert test data
      const testJobs: Partial<JobOffer>[] = [];
      for (let i = 1; i <= 15; i++) {
        testJobs.push({
          externalId: `test_job_${i}`,
          provider: 'test',
          title: `Test Job ${i}`,
          companyName: `Company ${i}`,
          location: i % 2 === 0 ? 'New York' : 'San Francisco',
          salaryMin: 50000 + i * 1000,
          salaryMax: 80000 + i * 1000,
          salaryCurrency: 'USD',
          postedDate: new Date(),
        });
      }
      await jobOfferRepository.save(testJobs);

      return request(app.getHttpServer())
        .get('/api/job-offers?page=1&limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveLength(10);
          expect(res.body.pagination).toEqual({
            total: 15,
            page: 1,
            totalPages: 2,
            limit: 10,
          });
        });
    });

    it('should filter by title', async () => {
      await jobOfferRepository.save([
        {
          externalId: 'job1',
          provider: 'test',
          title: 'Software Engineer',
          companyName: 'Tech Co',
          location: 'Remote',
          postedDate: new Date(),
        },
        {
          externalId: 'job2',
          provider: 'test',
          title: 'Product Manager',
          companyName: 'Business Co',
          location: 'NYC',
          postedDate: new Date(),
        },
      ]);

      return request(app.getHttpServer())
        .get('/api/job-offers?title=Engineer')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].title).toBe('Software Engineer');
        });
    });

    it('should filter by location', async () => {
      await jobOfferRepository.save([
        {
          externalId: 'job1',
          provider: 'test',
          title: 'Developer',
          companyName: 'Tech Co',
          location: 'San Francisco, CA',
          postedDate: new Date(),
        },
        {
          externalId: 'job2',
          provider: 'test',
          title: 'Designer',
          companyName: 'Design Co',
          location: 'New York, NY',
          postedDate: new Date(),
        },
      ]);

      return request(app.getHttpServer())
        .get('/api/job-offers?location=Francisco')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].location).toContain('San Francisco');
        });
    });

    it('should filter by salary range', async () => {
      await jobOfferRepository.save([
        {
          externalId: 'job1',
          provider: 'test',
          title: 'Junior Dev',
          companyName: 'Tech Co',
          location: 'Remote',
          salaryMin: 40000,
          salaryMax: 60000,
          postedDate: new Date(),
        },
        {
          externalId: 'job2',
          provider: 'test',
          title: 'Senior Dev',
          companyName: 'Big Tech',
          location: 'Remote',
          salaryMin: 80000,
          salaryMax: 120000,
          postedDate: new Date(),
        },
      ]);

      return request(app.getHttpServer())
        .get('/api/job-offers?salaryMin=70000')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].title).toBe('Senior Dev');
        });
    });

    it('should validate query parameters', () => {
      return request(app.getHttpServer())
        .get('/api/job-offers?page=0&limit=200')
        .expect(400);
    });

    it('should handle multiple filters simultaneously', async () => {
      await jobOfferRepository.save([
        {
          externalId: 'job1',
          provider: 'test',
          title: 'Senior Software Engineer',
          companyName: 'Tech Corp',
          location: 'San Francisco, CA',
          salaryMin: 100000,
          salaryMax: 150000,
          postedDate: new Date(),
        },
        {
          externalId: 'job2',
          provider: 'test',
          title: 'Junior Developer',
          companyName: 'Startup Inc',
          location: 'New York, NY',
          salaryMin: 60000,
          salaryMax: 80000,
          postedDate: new Date(),
        },
        {
          externalId: 'job3',
          provider: 'test',
          title: 'Senior Engineer',
          companyName: 'Big Tech',
          location: 'San Francisco, CA',
          salaryMin: 120000,
          salaryMax: 180000,
          postedDate: new Date(),
        },
      ]);

      return request(app.getHttpServer())
        .get('/api/job-offers?title=Senior&location=Francisco&salaryMin=110000')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(
            res.body.data.every((job) => job.title.includes('Senior')),
          ).toBe(true);
          expect(
            res.body.data.every((job) =>
              job.location.includes('San Francisco'),
            ),
          ).toBe(true);
          expect(res.body.data.every((job) => job.salaryMax >= 110000)).toBe(
            true,
          );
        });
    });

    it('should handle case-insensitive title search', async () => {
      await jobOfferRepository.save([
        {
          externalId: 'job1',
          provider: 'test',
          title: 'JavaScript Developer',
          companyName: 'Web Co',
          location: 'Remote',
          postedDate: new Date(),
        },
        {
          externalId: 'job2',
          provider: 'test',
          title: 'Python Engineer',
          companyName: 'Data Co',
          location: 'Remote',
          postedDate: new Date(),
        },
      ]);

      return request(app.getHttpServer())
        .get('/api/job-offers?title=javascript')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].title).toBe('JavaScript Developer');
        });
    });

    it('should handle salary range filtering correctly', async () => {
      await jobOfferRepository.save([
        {
          externalId: 'job1',
          provider: 'test',
          title: 'Low Salary Job',
          companyName: 'Budget Co',
          location: 'Remote',
          salaryMin: 30000,
          salaryMax: 40000,
          postedDate: new Date(),
        },
        {
          externalId: 'job2',
          provider: 'test',
          title: 'Medium Salary Job',
          companyName: 'Average Co',
          location: 'Remote',
          salaryMin: 70000,
          salaryMax: 90000,
          postedDate: new Date(),
        },
        {
          externalId: 'job3',
          provider: 'test',
          title: 'High Salary Job',
          companyName: 'Premium Co',
          location: 'Remote',
          salaryMin: 120000,
          salaryMax: 150000,
          postedDate: new Date(),
        },
      ]);

      // Test salaryMax filter
      return request(app.getHttpServer())
        .get('/api/job-offers?salaryMax=100000')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(res.body.data.every((job) => job.salaryMax <= 100000)).toBe(
            true,
          );
        });
    });

    it('should handle pagination edge cases', async () => {
      // Create exactly 25 jobs to test pagination
      const testJobs: Partial<JobOffer>[] = [];
      for (let i = 1; i <= 25; i++) {
        testJobs.push({
          externalId: `job_${i}`,
          provider: 'test',
          title: `Job ${i}`,
          companyName: `Company ${i}`,
          location: 'Test Location',
          postedDate: new Date(),
        });
      }
      await jobOfferRepository.save(testJobs);

      // Test last page
      return request(app.getHttpServer())
        .get('/api/job-offers?page=3&limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(5); // Only 5 jobs on last page
          expect(res.body.pagination).toEqual({
            total: 25,
            page: 3,
            totalPages: 3,
            limit: 10,
          });
        });
    });

    it('should return 400 for invalid page parameter', () => {
      return request(app.getHttpServer())
        .get('/api/job-offers?page=-1')
        .expect(400);
    });

    it('should return 400 for invalid limit parameter', () => {
      return request(app.getHttpServer())
        .get('/api/job-offers?limit=0')
        .expect(400);
    });

    it('should return 400 for limit exceeding maximum', () => {
      return request(app.getHttpServer())
        .get('/api/job-offers?limit=101')
        .expect(400);
    });

    it('should return 400 for invalid salary parameters', () => {
      return request(app.getHttpServer())
        .get('/api/job-offers?salaryMin=-1000')
        .expect(400);
    });

    it('should handle no results for specific filters', async () => {
      await jobOfferRepository.save([
        {
          externalId: 'job1',
          provider: 'test',
          title: 'Developer',
          companyName: 'Tech Co',
          location: 'San Francisco',
          salaryMin: 80000,
          salaryMax: 120000,
          postedDate: new Date(),
        },
      ]);

      return request(app.getHttpServer())
        .get('/api/job-offers?title=NonexistentJob')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toEqual([]);
          expect(res.body.pagination.total).toBe(0);
        });
    });

    it('should handle complex location searches', async () => {
      await jobOfferRepository.save([
        {
          externalId: 'job1',
          provider: 'test',
          title: 'Developer',
          companyName: 'Tech Co',
          location: 'San Francisco, California, USA',
          postedDate: new Date(),
        },
        {
          externalId: 'job2',
          provider: 'test',
          title: 'Developer',
          companyName: 'Tech Co',
          location: 'Los Angeles, California, USA',
          postedDate: new Date(),
        },
        {
          externalId: 'job3',
          provider: 'test',
          title: 'Developer',
          companyName: 'Tech Co',
          location: 'Austin, Texas, USA',
          postedDate: new Date(),
        },
      ]);

      return request(app.getHttpServer())
        .get('/api/job-offers?location=California')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(
            res.body.data.every((job) => job.location.includes('California')),
          ).toBe(true);
        });
    });

    it('should handle special characters in search parameters', async () => {
      await jobOfferRepository.save([
        {
          externalId: 'job1',
          provider: 'test',
          title: 'C++ Developer',
          companyName: 'Tech Co',
          location: 'Remote',
          postedDate: new Date(),
        },
        {
          externalId: 'job2',
          provider: 'test',
          title: 'C# Developer',
          companyName: 'Microsoft',
          location: 'Seattle',
          postedDate: new Date(),
        },
      ]);

      return request(app.getHttpServer())
        .get('/api/job-offers?title=C%2B%2B') // URL encoded C++
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].title).toBe('C++ Developer');
        });
    });

    it('should maintain consistent response structure', async () => {
      await jobOfferRepository.save([
        {
          externalId: 'job1',
          provider: 'test',
          title: 'Test Job',
          companyName: 'Test Company',
          location: 'Test Location',
          postedDate: new Date(),
        },
      ]);

      return request(app.getHttpServer())
        .get('/api/job-offers')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success');
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(res.body.pagination).toHaveProperty('total');
          expect(res.body.pagination).toHaveProperty('page');
          expect(res.body.pagination).toHaveProperty('totalPages');
          expect(res.body.pagination).toHaveProperty('limit');
          expect(typeof res.body.success).toBe('boolean');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });
});
