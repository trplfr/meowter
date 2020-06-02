import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'

import { Exclude } from 'class-transformer'

import * as bcrypt from 'bcrypt'

import { Meow } from '../meows/meow.entity'

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  username: string

  @Exclude({ toPlainOnly: true })
  @Column({ unique: true, select: false })
  login: string

  @Column({ nullable: true })
  about: string

  @Column({ name: 'first_name', nullable: true })
  firstName: string

  @Column({ name: 'last_name', nullable: true })
  lastName: string

  @Exclude({ toPlainOnly: true })
  @Column({ select: false })
  password: string

  @Exclude({ toPlainOnly: true })
  @Column({ select: false })
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
