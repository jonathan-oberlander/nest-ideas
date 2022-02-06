import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import { Idea } from 'src/idea/idea.entity';
import { UserRO } from 'src/common/types';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @CreateDateColumn()
  created: Date;

  @Column({
    type: 'text',
    unique: true,
  })
  username: string;

  @Column('text')
  password: string;

  @OneToMany(() => Idea, (idea) => idea.author)
  ideas: Idea[];

  @BeforeInsert()
  private async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  toResponseObject({ showToken } = { showToken: false }): UserRO {
    const { uuid, created, username, token } = this;
    return {
      uuid,
      created,
      username,
      ...(showToken && { token }),
      ...(this.ideas && { ideas: this.ideas }),
    };
  }

  async matchPassword(attempt: string) {
    return await bcrypt.compare(attempt, this.password);
  }

  private get token() {
    const { username, uuid } = this;
    return jwt.sign(
      {
        username,
        uuid,
      },
      process.env.SECRET,
      { expiresIn: '2d' },
    );
  }
}
