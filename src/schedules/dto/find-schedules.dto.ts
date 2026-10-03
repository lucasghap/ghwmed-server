export interface FindSchedulesDto {
  initialDate: string
  finalDate: string
  userId: string
  companyIds?: string[]
}