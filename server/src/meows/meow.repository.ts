import { EntityRepository, Repository } from 'typeorm'

import { Meow } from './meow.entity'
import { CreateMeowDTO } from './dto/create-meow.dto'
import { GetMeowsFilterDTO } from './dto/get-meows-filter.dto'
import { User } from '../auth/user.entity'

@EntityRepository(Meow)
export class MeowRepository extends Repository<Meow> {
  async getMeows(filterDTO: GetMeowsFilterDTO, user: User): Promise<Meow[]> {
    const { search } = filterDTO

    const query = this.createQueryBuilder('meow')

    query.where('meow.creator_id = :creatorId', { creatorId: user.id })

    if (search) {
      query.andWhere('meow.content LIKE :search', { search: `%${search}%` })
    }

    return await query.getMany()
  }

  async createMeow(createMeowDTO: CreateMeowDTO, user: User): Promise<Meow> {
    const { content } = createMeowDTO

    const meow = new Meow()

    meow.content = content
    meow.user = user
    await meow.save()

    delete meow.user

    return meow
  }
}
