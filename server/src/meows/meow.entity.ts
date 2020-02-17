import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Meow extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  content: string
}
