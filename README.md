<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Job Offers API

A backend application built with NestJS that integrates with multiple job offer APIs, transforms the data into a unified structure, stores it in a SQLite database, and provides a RESTful API to retrieve and filter the transformed data.

## Features

- **Data Transformation**: Fetches job data from two different API providers and transforms them into a unified structure
- **Scheduled Synchronization**: Uses cron jobs to periodically fetch and update job data
- **Database Storage**: Stores transformed data in SQLite with duplicate prevention
- **RESTful API**: Provides endpoints to retrieve job offers with filtering and pagination
- **Error Handling**: Robust error handling with logging and graceful failure recovery
- **Testing**: Comprehensive unit and integration tests
- **scalablity** New API providers can simply be added via adding them to `transformation.services.ts` and `api-client.service.ts`

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Project Setup

1. Clone the repository and navigate to the project directory:
```bash
cd job-offers-api
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (optional):
Create a `.env` file in the root directory:
```env
NODE_ENV=development
DATABASE_PATH=job-offers.sqlite
API1_URL=https://assignment.devotel.io/api/provider1/jobs
API2_URL=https://assignment.devotel.io/api/provider2/jobs
CRON_SCHEDULE=0 */6 * * * *
PORT=3000
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Documentation

### GET /api/job-offers

Retrieves job offers with optional filtering and pagination.

#### Query Parameters:
- `title` (optional): Filter by job title (case-insensitive partial match)
- `location` (optional): Filter by location (case-insensitive partial match)
- `salaryMin` (optional): Filter jobs with max salary >= this value
- `salaryMax` (optional): Filter jobs with min salary <= this value
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

#### Example Request:
```bash
GET /api/job-offers?title=engineer&location=new york&salaryMin=60000&page=1&limit=10
```

#### Example Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "externalId": "provider1_P1-249",
      "provider": "provider1",
      "title": "Software Engineer",
      "companyName": "Tech Corp",
      "companyIndustry": "Technology",
      "location": "New York, NY",
      "state": null,
      "isRemote": false,
      "employmentType": "Full-Time",
      "salaryMin": "80000.00",
      "salaryMax": "120000.00",
      "salaryCurrency": "USD",
      "skills": ["JavaScript", "React", "Node.js"],
      "experienceRequired": null,
      "postedDate": "2025-07-01",
      "createdAt": "2025-07-13T10:00:00.000Z",
      "updatedAt": "2025-07-13T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "totalPages": 5,
    "limit": 10
  }
}
```

## Database Schema

The application uses a single `job_offers` table with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| externalId | VARCHAR | Unique identifier from the provider |
| provider | VARCHAR | Source API provider |
| title | VARCHAR | Job title |
| companyName | VARCHAR | Company name |
| companyIndustry | VARCHAR | Company industry (nullable) |
| companyWebsite | VARCHAR | Company website (nullable) |
| location | VARCHAR | Job location |
| state | VARCHAR | State/Province (nullable) |
| isRemote | BOOLEAN | Remote work availability |
| employmentType | VARCHAR | Type of employment (nullable) |
| salaryMin | DECIMAL | Minimum salary (nullable) |
| salaryMax | DECIMAL | Maximum salary (nullable) |
| salaryCurrency | VARCHAR | Salary currency |
| skills | TEXT | Required skills (array) |
| experienceRequired | INTEGER | Years of experience (nullable) |
| postedDate | DATE | Job posting date |
| createdAt | TIMESTAMP | Record creation timestamp |
| updatedAt | TIMESTAMP | Record update timestamp |

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Architecture

The application follows a modular architecture with clear separation of concerns:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and data transformation
- **Entities**: Define database schema using TypeORM
- **DTOs**: Validate and transform request/response data
- **Modules**: Organize related components

### Key Components:

1. **ApiClientService**: Fetches data from external job APIs
2. **TransformationService**: Transforms different API formats into unified structure
3. **JobOffersService**: Manages database operations and business logic
4. **JobSyncService**: Handles scheduled synchronization with cron jobs
5. **JobOffersController**: Exposes RESTful endpoints

## Error Handling

The application implements comprehensive error handling:

- Global exception filter for consistent error responses
- Graceful handling of API failures with logging
- Database error handling with transaction support
- Validation errors with clear messages

## Logging

All major operations are logged including:
- API fetch operations
- Data transformation processes
- Database operations
- Cron job executions
- Error occurrences

## License

MIT
