import { EntityRepository, Repository } from 'typeorm'

import { Meow } from './meow.entity'

@EntityRepository(Meow)
export class MeowRepository extends Repository<Meow> {}
