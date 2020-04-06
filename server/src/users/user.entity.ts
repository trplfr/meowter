import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique
} from 'typeorm'

import { Exclude } from 'class-transformer'

import * as bcrypt from 'bcrypt'

import { Meow } from '../meows/meow.entity'

@Entity()
@Unique(['login'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  login: string

  @Exclude()
  @Column()
  password: string

  @Exclude()
  @Column()
  salt: string

  @OneToMany(
    type => Meow,
    meow => meow.user,
    { eager: true }
  )
  meows: Meow[]

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt)

    return hash === this.password
  }
}
