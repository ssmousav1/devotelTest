import { Injectable } from '@nestjs/common';
import { JobOffer } from '../entities/job-offer.entity';
import { API1Job, API2Job } from '../interfaces/api-responses.interface';

@Injectable()
export class TransformationService {
  transformAPI1Job(job: API1Job): Partial<JobOffer> {
    const salaryRange = this.parseSalaryRange(job.details.salaryRange);

    return {
      externalId: `provider1_${job.jobId}`,
      provider: 'provider1',
      title: job.title,
      companyName: job.company.name,
      companyIndustry: job.company.industry,
      location: job.details.location,
      employmentType: job.details.type,
      salaryMin: salaryRange.min || undefined,
      salaryMax: salaryRange.max || undefined,
      salaryCurrency: salaryRange.currency,
      skills: job.skills,
      postedDate: new Date(job.postedDate),
    };
  }

  transformAPI2Job(jobId: string, job: API2Job): Partial<JobOffer> {
    return {
      externalId: `provider2_${jobId}`,
      provider: 'provider2',
      title: job.position,
      companyName: job.employer.companyName,
      companyWebsite: job.employer.website,
      location: job.location.city,
      state: job.location.state,
      isRemote: job.location.remote,
      salaryMin: job.compensation.min,
      salaryMax: job.compensation.max,
      salaryCurrency: job.compensation.currency,
      skills: job.requirements.technologies,
      experienceRequired: job.requirements.experience,
      postedDate: new Date(job.datePosted),
    };
  }

  // for adding another api provider add the transformation here as another'transformAPIJob()'

  private parseSalaryRange(salaryRange: string): {
    min: number | null;
    max: number | null;
    currency: string;
  } {
    const match = salaryRange.match(/\$(\d+)k\s*-\s*\$(\d+)k/);
    if (match) {
      return {
        min: parseInt(match[1]) * 1000,
        max: parseInt(match[2]) * 1000,
        currency: 'USD',
      };
    }
    return { min: null, max: null, currency: 'USD' };
  }
}
