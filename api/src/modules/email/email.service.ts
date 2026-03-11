import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'

@Injectable()
export class EmailService {
  private readonly resend: Resend
  private readonly from: string

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.getOrThrow('RESEND_API_KEY'))
    this.from = this.config.get('RESEND_FROM', 'Meowter <noreply@meowter.app>')
  }

  async sendVerificationEmail(to: string, token: string, origin: string) {
    const link = `${origin}/verify?token=${token}`
    const isRu = origin.includes('meowter.ru') || origin.includes('localhost')

    const title = isRu ? 'Мяутер' : 'Meowter'
    const subject = isRu
      ? 'Подтверди почту / Мяутер'
      : 'Verify your email / Meowter'
    const body = isRu
      ? 'Нажми на кнопку, чтобы подтвердить почту и начать мяутить!'
      : 'Click the button to verify your email and start meowing!'
    const button = isRu ? 'Подтвердить почту' : 'Verify email'
    const hint = isRu
      ? 'Ссылка действительна 24 часа'
      : 'This link is valid for 24 hours'

    await this.resend.emails.send({
      from: this.from,
      to,
      subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 420px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <span style="font-size: 48px;">🐱</span>
          </div>
          <h1 style="font-size: 24px; color: #333; text-align: center; margin-bottom: 20px;">
            ${title}
          </h1>
          <p style="color: #333; font-size: 16px; text-align: center; margin-bottom: 30px;">
            ${body}
          </p>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${link}" style="display: inline-block; background: #eb7e44; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
              ${button}
            </a>
          </div>
          <p style="color: #999; font-size: 13px; text-align: center;">
            ${hint}
          </p>
        </div>
      `
    })
  }
}
