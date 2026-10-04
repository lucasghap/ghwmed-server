import { Injectable } from '@nestjs/common'
import { IntegrationStatus, IntegrationType, UserRole, UserStatus } from '@prisma/client'
import { PrismaService } from 'src/prima.service'

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const [
      doctorsTotal,
      doctorsActive,
      doctorsInactive,
      adminsTotal,
      adminsActive,
      adminsInactive,
      integrationsTotal,
      integrationsActive,
      imageExamCount,
      labExamCount,
      documentCount,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: UserRole.DOCTOR } }),
      this.prisma.user.count({
        where: { role: UserRole.DOCTOR, status: UserStatus.ACTIVE },
      }),
      this.prisma.user.count({
        where: { role: UserRole.DOCTOR, status: UserStatus.INACTIVE },
      }),
      this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
      this.prisma.user.count({
        where: { role: UserRole.ADMIN, status: UserStatus.ACTIVE },
      }),
      this.prisma.user.count({
        where: { role: UserRole.ADMIN, status: UserStatus.INACTIVE },
      }),
      this.prisma.integration.count(),
      this.prisma.integration.count({
        where: { status: IntegrationStatus.ACTIVE },
      }),
      this.prisma.integration.count({
        where: { type: IntegrationType.IMAGE_EXAM },
      }),
      this.prisma.integration.count({
        where: { type: IntegrationType.LAB_EXAM },
      }),
      this.prisma.integration.count({
        where: { type: IntegrationType.MEDICAL_RECORD_DOCUMENT },
      }),
    ])

    return {
      doctors: {
        total: doctorsTotal,
        active: doctorsActive,
        inactive: doctorsInactive,
      },
      admins: {
        total: adminsTotal,
        active: adminsActive,
        inactive: adminsInactive,
      },
      integrations: {
        total: integrationsTotal,
        active: integrationsActive,
        inactive: integrationsTotal - integrationsActive,
        byType: {
          IMAGE_EXAM: imageExamCount,
          LAB_EXAM: labExamCount,
          MEDICAL_RECORD_DOCUMENT: documentCount,
        },
      },
    }
  }
}
