import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { UserRepository } from './user.repository'
import { User } from './user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.getAllUsers()
  }

  async getUserById(id: number): Promise<User> {
    const foundUser = await this.userRepository.findOne(id)

    if (!foundUser) {
      throw new NotFoundException(`User with ID ${id} not found!`)
    }

    return foundUser
  }
}
