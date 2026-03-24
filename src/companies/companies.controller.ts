import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt/jwt-guard';
import { CompaniesService } from './companies.service';

@Controller('companies')
@UseGuards(JwtGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  findActive() {
    return this.companiesService.findActive();
  }
}
