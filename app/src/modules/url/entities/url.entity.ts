import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.urls)
  user: User;

  @Index()
  @Column()
  shortUrl: string;

  @Column()
  longUrl: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => "NOW() + INTERVAL '1 week'",
  })
  expire_at: Date;

  @Column({ default: 0 })
  click_count: number;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;
}
