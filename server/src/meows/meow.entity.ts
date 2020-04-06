import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

import { User } from '../users/user.entity'

@Entity()
export class Meow extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  content: string

  @ManyToOne(
    type => User,
    user => user.meows,
    { eager: false }
  )
  @JoinColumn({ name: 'creator_id' })
  user: User

  @Column({ name: 'creator_id' })
  creatorId: number
}
