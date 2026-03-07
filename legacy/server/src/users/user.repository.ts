import { ConflictException, InternalServerErrorException } from '@nestjs/common'
import { EntityRepository, Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'

import { User } from './user.entity'
import {
  LoginCredentialsDTO,
  RegisterCredentialsDTO
} from '../auth/dto/auth-credentials.dto'

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async signUp(authCredentialsDTO: RegisterCredentialsDTO): Promise<void> {
    const { username, login, password } = authCredentialsDTO

    const user = new User()

    user.username = username
    user.login = login
    user.salt = await bcrypt.genSalt()
    user.password = await UserRepository.hashPassword(password, user.salt)

    try {
      await user.save()
    } catch (error) {
      if (error.detail?.includes('username')) {
        throw new ConflictException('Username already exists')
      }

      if (error.detail?.includes('login')) {
        throw new ConflictException('Login already exists')
      }

      throw new InternalServerErrorException()
    }
  }

  async validateUserPassword(
    authCredentialsDTO: LoginCredentialsDTO
  ): Promise<string> {
    const { login, password } = authCredentialsDTO

    const user = await this.createQueryBuilder('user')
      .where('user.login = :login', { login })
      .select(['user.password', 'user.salt', 'user.login'])
      .getOne()

    if (user && (await user.validatePassword(password))) {
      return user.login
    }

    return null
  }

  private static async hashPassword(
    password: string,
    salt: string
  ): Promise<string> {
    return bcrypt.hash(password, salt)
  }

  async getAllUsers(): Promise<User[]> {
    const query = this.createQueryBuilder('user')

    try {
      return await query.getMany()
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  async getCurrentUser(login: string): Promise<User> {
    const user = await this.createQueryBuilder(
      'user'
    ).where('user.login = :login', { login })

    try {
      return await user.getOne()
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }
}
