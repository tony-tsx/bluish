import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './User.js';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column('text')
  public content!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn()
  public user!: User;

  @CreateDateColumn()
  public createdAt!: Date;

  @UpdateDateColumn()
  public updatedAt!: Date;

  @DeleteDateColumn()
  public deletedAt!: Date;
}
