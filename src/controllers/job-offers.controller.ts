import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { JobOffersService } from '../services/job-offers.service';
import { JobOfferQueryDto } from '../dto/job-offer-query.dto';

@Controller('api/job-offers')
@UseInterceptors(ClassSerializerInterceptor)
export class JobOffersController {
  constructor(private readonly jobOffersService: JobOffersService) {}

  @Get()
  async findAll(@Query() query: JobOfferQueryDto) {
    try {
      const result = await this.jobOffersService.findAll({
        title: query.title,
        location: query.location,
        salaryMin: query.salaryMin,
        salaryMax: query.salaryMax,
        page: query.page,
        limit: query.limit,
      });

      return {
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: query.limit || 10,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch job offers',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
