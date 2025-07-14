import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  API1Response,
  API2Response,
} from '../interfaces/api-responses.interface';

@Injectable()
export class ApiClientService {
  private readonly logger = new Logger(ApiClientService.name);
  private readonly api1Url: string;
  private readonly api2Url: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.api1Url =
      this.configService.get<string>('API1_URL') ||
      'https://assignment.devotel.io/api/provider1/jobs';
    this.api2Url =
      this.configService.get<string>('API2_URL') ||
      'https://assignment.devotel.io/api/provider2/jobs';
  }

  async fetchFromProvider1(): Promise<API1Response> {
    try {
      this.logger.log('Fetching data from Provider 1');
      const response = await firstValueFrom(
        this.httpService.get<API1Response>(this.api1Url),
      );
      this.logger.log(
        `Fetched ${response.data.jobs.length} jobs from Provider 1`,
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching from Provider 1', error.message);
      throw new Error(`Failed to fetch from Provider 1: ${error.message}`);
    }
  }

  async fetchFromProvider2(): Promise<API2Response> {
    try {
      this.logger.log('Fetching data from Provider 2');
      const response = await firstValueFrom(
        this.httpService.get<API2Response>(this.api2Url),
      );
      const jobCount = Object.keys(response.data.data.jobsList).length;
      this.logger.log(`Fetched ${jobCount} jobs from Provider 2`);
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching from Provider 2', error.message);
      throw new Error(`Failed to fetch from Provider 2: ${error.message}`);
    }
  }

  async fetchAllJobs(): Promise<{
    provider1: API1Response | null;
    provider2: API2Response | null;
  }> {
    const [provider1Data, provider2Data] = await Promise.allSettled([
      this.fetchFromProvider1(),
      this.fetchFromProvider2(),
    ]);

    const result: {
      provider1: API1Response | null;
      provider2: API2Response | null;
    } = {
      provider1: null,
      provider2: null,
    };

    if (provider1Data.status === 'fulfilled') {
      result.provider1 = provider1Data.value;
    } else {
      this.logger.error(
        'Failed to fetch from Provider 1',
        provider1Data.reason,
      );
    }

    if (provider2Data.status === 'fulfilled') {
      result.provider2 = provider2Data.value;
    } else {
      this.logger.error(
        'Failed to fetch from Provider 2',
        provider2Data.reason,
      );
    }

    return result;
  }
}
