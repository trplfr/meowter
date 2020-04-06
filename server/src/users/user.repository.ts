import { ConflictException, InternalServerErrorException } from '@nestjs/common'
import { EntityRepository, Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'

import { User } from './user.entity'
import { AuthCredentialsDTO } from '../auth/dto/auth-credentials.dto'

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async signUp(authCredentialsDTO: AuthCredentialsDTO): Promise<void> {
    const { login, password } = authCredentialsDTO

    const user = new User()

    user.login = login
    user.salt = await bcrypt.genSalt()
    user.password = await UserRepository.hashPassword(password, user.salt)

    try {
      await user.save()
    } catch (error) {
      if (error.code === '23505') {
        // duplicate
        throw new ConflictException('Login already exists')
      }

      throw new InternalServerErrorException()
    }
  }

  async validateUserPassword(
    authCredentialsDTO: AuthCredentialsDTO
  ): Promise<string> {
    const { login, password } = authCredentialsDTO

    const user = await this.findOne({ login })

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
}
