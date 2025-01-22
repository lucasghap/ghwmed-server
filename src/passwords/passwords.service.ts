import { Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { EmailsService } from 'src/emails/emails.service';
import { PrismaService } from 'src/prima.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Injectable()
export class PasswordsService {
  constructor(
    private prisma: PrismaService,
    private emailsService: EmailsService,
  ) {}

  async forgotPassword({ cpf }: ForgotPasswordDto) {
    const cpfExists = await this.prisma.user.findUnique({
      where: {
        cpf,
      },
    });

    if (!cpfExists)
      throw new NotFoundException(
        'Não encontramos nenhum cadastrado vinculado ao seu CPF',
      );

    const newPassword = 'ghap#123';

    const passwordHash = await hash(newPassword, 8);

    await this.prisma.user.update({
      data: {
        password: passwordHash,
      },
      where: {
        id: cpfExists.id,
      },
    });

    await this.emailsService.send({
      to: [cpfExists.email],
      subject: 'Redefinição de Senha',
      html: `<p>Sua nova senha é: ${newPassword}</p>`,
    });
  }
}
