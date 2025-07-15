import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { JobOffer } from '../src/entities/job-offer.entity';

export const testDatabaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:', // Use in-memory database for tests
  entities: [JobOffer],
  synchronize: true,
  logging: false, // Disable logging in tests for cleaner output
  autoLoadEntities: true,
  dropSchema: true, // Drop schema before each test run
};