import { InternalServerErrorException, Logger } from '@nestjs/common'
import { EntityRepository, Repository } from 'typeorm'

import { Meow } from './meow.entity'
import { CreateMeowDTO } from './dto/create-meow.dto'
import { GetMeowsFilterDTO } from './dto/get-meows-filter.dto'
import { User } from '../auth/user.entity'

@EntityRepository(Meow)
export class MeowRepository extends Repository<Meow> {
  private logger = new Logger('MeowRepository')

  async getMeows(filterDTO: GetMeowsFilterDTO, user: User): Promise<Meow[]> {
    const { search } = filterDTO

    const query = this.createQueryBuilder('meow')

    query.where('meow.creator_id = :creatorId', { creatorId: user.id })

    if (search) {
      query.andWhere('meow.content LIKE :search', { search: `%${search}%` })
    }

    try {
      return await query.getMany()
    } catch (error) {
      this.logger.error(
        `Failed to get meows for user '${
          user.login
        }'. Filters: ${JSON.stringify(filterDTO)}`,
        error.stack
      )
      throw new InternalServerErrorException()
    }
  }

  async createMeow(createMeowDTO: CreateMeowDTO, user: User): Promise<Meow> {
    const { content } = createMeowDTO

    const meow = new Meow()

    meow.content = content
    meow.user = user

    try {
      await meow.save()
    } catch (error) {
      this.logger.error(
        `Failed to create meow for user '${user.login}'`,
        error.stack
      )
      throw new InternalServerErrorException()
    }

    delete meow.user

    return meow
  }
}
