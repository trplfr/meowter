export enum AuthStep {
  CREDENTIALS = 'CREDENTIALS',
  AVATAR = 'AVATAR',
  DONE = 'DONE'
}

export interface LoginForm {
  login: string
  password: string
}

export interface RegisterForm {
  username: string
  password: string
  email: string
}

export interface RecoveryForm {
  email: string
}
