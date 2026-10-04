import { IntegrationResponseMode, IntegrationType } from '@prisma/client'

export const INTEGRATION_TYPES = [
  IntegrationType.IMAGE_EXAM,
  IntegrationType.LAB_EXAM,
  IntegrationType.MEDICAL_RECORD_DOCUMENT,
] as const

export const INTEGRATION_RESPONSE_MODES = [
  IntegrationResponseMode.OPEN_URL,
  IntegrationResponseMode.BASE64,
  IntegrationResponseMode.BUFFER,
] as const

export const INTEGRATION_PROVIDERS = [
  'custom',
  'ghap-flow',
  'pacs',
] as const
