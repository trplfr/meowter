import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { MeowRepository } from './meow.repository'
import { CreateMeowDTO } from './dto/create-meow.dto'
import { GetMeowsFilterDTO } from './dto/get-meows-filter.dto'
import { Meow } from './meow.entity'
import { User } from '../auth/user.entity'

@Injectable()
export class MeowsService {
  constructor(
    @InjectRepository(MeowRepository)
    private meowRepository: MeowRepository
  ) {}

  async getMeows(filterDTO: GetMeowsFilterDTO, user: User): Promise<Meow[]> {
    return this.meowRepository.getMeows(filterDTO, user)
  }

  // getMeowsWithFilters(filterDTO: GetMeowsFilterDTO): Meow[] {
  //   const { search } = filterDTO
  //
  //   let meows = this.getAllMeows()
  //
  //   if (search) {
  //     meows = meows.filter(meow => meow.content.includes(search))
  //   }
  //
  //   return meows
  // }

  async getMeowById(id: number, user: User): Promise<Meow> {
    const foundMeow = await this.meowRepository.findOne({
      where: { id, creatorId: user.id }
    })

    if (!foundMeow) {
      throw new NotFoundException(`Meow with ID ${id} not found!`)
    }

    return foundMeow
  }

  async createMeow(createMeowDTO: CreateMeowDTO, user: User): Promise<Meow> {
    return this.meowRepository.createMeow(createMeowDTO, user)
  }

  async deleteMeow(id: number, user: User): Promise<void> {
    const result = await this.meowRepository.delete({ id, creatorId: user.id })

    if (result.affected === 0) {
      throw new NotFoundException(`Meow with ID ${id} not found!`)
    }
  }
}
