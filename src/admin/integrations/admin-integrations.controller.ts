import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { IntegrationStatus } from '@prisma/client'
import { AuthUser, CurrentUser } from 'src/auth/jwt/current-user'
import { JwtGuard } from 'src/auth/jwt/jwt-guard'
import { USER_ROLES } from 'src/auth/roles'
import { Roles } from 'src/auth/roles.decorator'
import { RolesGuard } from 'src/auth/roles.guard'
import { AdminIntegrationsService } from './admin-integrations.service'
import { CreateIntegrationDto } from './dto/create-integration.dto'
import { ListIntegrationsDto } from './dto/list-integrations.dto'
import { UpdateIntegrationDto } from './dto/update-integration.dto'

@Controller('admin/integrations')
@UseGuards(JwtGuard, RolesGuard)
@Roles(USER_ROLES.ADMIN)
export class AdminIntegrationsController {
  constructor(
    private readonly integrationsService: AdminIntegrationsService,
  ) {}

  @Get()
  list(@Query() query: ListIntegrationsDto) {
    return this.integrationsService.list(query)
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.integrationsService.findById(id)
  }

  @Post()
  create(
    @CurrentUser() actor: AuthUser,
    @Body() dto: CreateIntegrationDto,
  ) {
    return this.integrationsService.create(actor.id, dto)
  }

  @Put(':id')
  update(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateIntegrationDto,
  ) {
    return this.integrationsService.update(actor.id, id, dto)
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Body() body: { status: IntegrationStatus },
  ) {
    return this.integrationsService.updateStatus(actor.id, id, body.status)
  }

  @Delete(':id')
  remove(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.integrationsService.remove(actor.id, id)
  }
}
