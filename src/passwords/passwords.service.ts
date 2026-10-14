import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcryptjs';
import { EmailsService } from 'src/emails/emails.service';
import { PrismaService } from 'src/prima.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { SetFirstPasswordDto } from './dto/set-first-password.dto';

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

    if (!cpfExists.email)
      throw new BadRequestException(
        'Seu cadastro não possui e-mail. Acesse pelo PEP ou procure o administrador',
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

  // Accounts created through the PEP have no password until the first CPF login.
  async setFirstPassword({ cpf, password }: SetFirstPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        cpf,
      },
    });

    if (!user)
      throw new NotFoundException(
        'Não encontramos nenhum cadastrado vinculado ao seu CPF',
      );

    if (user.password)
      throw new ConflictException('Este usuário já possui senha cadastrada');

    await this.prisma.user.update({
      data: {
        password: await hash(password, 8),
        update_at: new Date(),
      },
      where: {
        id: user.id,
      },
    });
  }
}
