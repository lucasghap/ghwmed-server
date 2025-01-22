import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prima.service';
import { CreateSchedulesAssistedDto } from './dto/create-schedules-assisted.dto';

@Injectable()
export class SchedulesAssistedsService {
  constructor(private prisma: PrismaService) {}

  async create({ scheduleMvId, userId }: CreateSchedulesAssistedDto) {
    await this.prisma.scheduleAssisted.create({
      data: {
        schedule_mv_id: scheduleMvId,
        user_id: userId,
      },
    });
  }

  async findByScheduleMvId(scheduleMvId: number) {
    const scheduleAssisted = await this.prisma.scheduleAssisted.findFirst({
      where: {
        schedule_mv_id: scheduleMvId,
      },
    });

    return scheduleAssisted;
  }

  async remove(id: string) {
    const scheduleAssisted = await this.prisma.scheduleAssisted.findUnique({
      where: {
        id,
      },
    });

    if (!scheduleAssisted) {
      throw new NotFoundException('Registro não encontrado');
    }

    await this.prisma.scheduleAssisted.delete({
      where: {
        id,
      },
    });
  }
}
