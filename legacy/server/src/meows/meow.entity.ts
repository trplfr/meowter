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
  @JoinColumn({ name: 'author_id' })
  user: User

  @Column({ name: 'author_id' })
  authorId: number
}
