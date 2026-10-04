import { createZodDto } from 'nestjs-zod'
import { z } from 'nestjs-zod/z'

const createAuthBodySchema = z.object({
  cpf: z.string().nullish(),
  email: z.string().nullish(),
  password: z.string().nullish(),
  providerId: z.string().nullish(),
  token: z.string().nullish(),
})

class CreateAuthDto extends createZodDto(createAuthBodySchema) {}

export { createAuthBodySchema, CreateAuthDto }
