import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

/**
 * Mail Module for email functionality
 */
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
