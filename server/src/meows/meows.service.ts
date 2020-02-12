import { Injectable } from '@nestjs/common'
import { v1 as uuid } from 'uuid'

import { Meow } from './meow.model'
import { CreateMeowDTO } from './dto/create-meow.dto'

@Injectable()
export class MeowsService {
  private meows: Meow[] = []

  getAllMeows(): Meow[] {
    return this.meows
  }

  getMeowById(id: string): Meow {
    return this.meows.find(meow => meow.id === id)
  }

  createMeow(createMeowDTO: CreateMeowDTO): Meow {
    const { content } = createMeowDTO

    const meow = {
      id: uuid(),
      content
    }

    this.meows.push(meow)
    return meow
  }

  deleteMeow(id: string): void {
    this.meows = this.meows.filter(meow => meow.id !== id)
  }
}
