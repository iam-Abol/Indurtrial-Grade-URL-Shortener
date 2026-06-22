import { ClickAnalytics } from '../../../modules/analytics/entities/analytics.entity';
import { User } from '../../../modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Index(['user', 'createdAt'])
@Index(['expireAt', 'deletedAt'])
@Entity()
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.urls)
  user: User;

  @Column({ nullable: true })
  @Index({ unique: true })
  customAlias: string;

  @Index()
  @Column({ unique: true, length: 10, nullable: true })
  shortCode: string;

  @Column()
  longUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @Index()
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  expireAt: Date | null;

  @Column({ default: 0 })
  click_count: number;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @OneToMany(() => ClickAnalytics, (ClickAnalytics) => ClickAnalytics.url)
  ClickAnalytics: ClickAnalytics[];
}
