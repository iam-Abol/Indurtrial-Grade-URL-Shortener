import { Url } from 'src/modules/url/entities/url.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ClickAnalytics {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Url, (url) => url.ClickAnalytics)
  url: Url;

  @Column({ type: 'varchar', length: 45 })
  ip: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  browser: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  device: string;

  @Column({ type: 'text', nullable: true })
  referer: string;
}
