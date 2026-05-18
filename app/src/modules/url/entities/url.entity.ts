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

@Entity()
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.urls)
  user: User;

  @Column({ nullable: true, unique: true })
  customAlias: string;

  @Index()
  @Column({ unique: true, length: 10, nullable: true })
  shortCode: string;

  @Column()
  longUrl: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  expire_at: Date;

  @Column({ default: 0 })
  click_count: number;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  @OneToMany(() => ClickAnalytics, (ClickAnalytics) => ClickAnalytics.url)
  ClickAnalytics: ClickAnalytics[];
}
