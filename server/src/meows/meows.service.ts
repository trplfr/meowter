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

  // getAllMeows(): Meow[] {
  //   return this.meows
  // }
  //
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

  // createMeow(createMeowDTO: CreateMeowDTO): Meow {
  //   const { content } = createMeowDTO
  //
  //   const meow = {
  //     id: uuid(),
  //     content
  //   }
  //
  //   this.meows.push(meow)
  //   return meow
  // }
  //
  // deleteMeow(id: string): void {
  //   const foundMeow = this.getMeowById(id)
  //
  //   this.meows = this.meows.filter(meow => meow.id !== foundMeow.id)
  // }
}
