import { PrismaClient, UserRole, UserStatus } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const DEFAULT_ADMIN = {
  name: 'Administrador',
  email: 'master@ghap.com.br',
  password: 'ghap#123',
}

async function main() {
  const passwordHash = await hash(DEFAULT_ADMIN.password, 8)

  const existing = await prisma.user.findUnique({
    where: { email: DEFAULT_ADMIN.email },
  })

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: existing.name || DEFAULT_ADMIN.name,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    })

    console.log(`Administrador já existia e foi mantido ativo: ${DEFAULT_ADMIN.email}`)
    return
  }

  await prisma.user.create({
    data: {
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      password: passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  })

  console.log(`Administrador padrão criado: ${DEFAULT_ADMIN.email}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
