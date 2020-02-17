import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { MeowRepository } from './meow.repository'
import { CreateMeowDTO } from './dto/create-meow.dto'
import { GetMeowsFilterDTO } from './dto/get-meows-filter.dto'
import { Meow } from './meow.entity'

@Injectable()
export class MeowsService {
  constructor(
    @InjectRepository(MeowRepository)
    private meowRepository: MeowRepository
  ) {}

  async getMeows(filterDTO: GetMeowsFilterDTO): Promise<Meow[]> {
    return this.meowRepository.getMeows(filterDTO)
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

  async getMeowById(id: number): Promise<Meow> {
    const foundMeow = await this.meowRepository.findOne(id)

    if (!foundMeow) {
      throw new NotFoundException(`Meow with ID ${id} not found!`)
    }

    return foundMeow
  }

  async createMeow(createMeowDTO: CreateMeowDTO): Promise<Meow> {
    return this.meowRepository.createMeow(createMeowDTO)
  }

  async deleteMeow(id: number): Promise<void> {
    const result = await this.meowRepository.delete(id)

    if (result.affected === 0) {
      throw new NotFoundException(`Meow with ID ${id} not found!`)
    }
  }
}
