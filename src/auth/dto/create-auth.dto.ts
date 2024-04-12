import { createZodDto } from 'nestjs-zod'
import { z } from 'nestjs-zod/z'

const createAuthBodySchema = z.object({
  cpf: z.string(),
  password: z.string(),
  providerId: z.string().nullable(),
  token: z.string().nullable()
})

class CreateAuthDto extends createZodDto(createAuthBodySchema) {}

export { createAuthBodySchema, CreateAuthDto }
