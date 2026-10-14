import { createZodDto } from 'nestjs-zod'
import { z } from 'nestjs-zod/z'

const setFirstPasswordBodySchema = z.object({
  cpf: z.string().min(11),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

class SetFirstPasswordDto extends createZodDto(setFirstPasswordBodySchema) {}

export { setFirstPasswordBodySchema, SetFirstPasswordDto }
