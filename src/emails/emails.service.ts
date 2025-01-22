import { Injectable } from '@nestjs/common';
import { SES } from 'aws-sdk';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailsService {
  async send({ to, subject, html }: SendEmailDto) {
    const transporter = nodemailer.createTransport({
      SES: new SES({
        apiVersion: '2010-12-01',
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }),
    });

    await transporter.sendMail({
      from: 'GDoctor <notificacao@ghap.com.br>',
      to: to.join(', '),
      subject,
      html,
    });
  }
}
