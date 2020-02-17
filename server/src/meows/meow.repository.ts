import { EntityRepository, Repository } from 'typeorm'

import { Meow } from './meow.entity'
import { CreateMeowDTO } from './dto/create-meow.dto'
import { GetMeowsFilterDTO } from './dto/get-meows-filter.dto'

@EntityRepository(Meow)
export class MeowRepository extends Repository<Meow> {
  async getMeows(filterDTO: GetMeowsFilterDTO): Promise<Meow[]> {
    const { search } = filterDTO

    const query = this.createQueryBuilder('meow')

    if (search) {
      query.andWhere('meow.content LIKE :search', { search: `%${search}%` })
    }

    return await query.getMany()
  }

  async createMeow(createMeowDTO: CreateMeowDTO): Promise<Meow> {
    const { content } = createMeowDTO

    const meow = new Meow()

    meow.content = content
    await meow.save()

    return meow
  }
}
