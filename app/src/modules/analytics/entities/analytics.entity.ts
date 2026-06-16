import { Url } from '../../../modules/url/entities/url.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ClickAnalytics {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Url, (url) => url.ClickAnalytics)
  @JoinColumn({ name: 'url_id' })
  url: Url;

  @Column({ length: 64 })
  ip_hash: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  browser: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  device_type: string;

  @Column({ type: 'varchar', length: 255 })
  referer_domain: string;
  @Column({ default: false })
  is_bot: boolean;

  @Column({ type: 'varchar', length: 45 })
  os: string;
}
