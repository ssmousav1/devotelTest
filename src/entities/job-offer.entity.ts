import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('job_offers')
@Index(['companyName', 'title'])
@Index(['location'])
@Index(['salaryMin', 'salaryMax'])
export class JobOffer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  externalId: string;

  @Column()
  provider: string;

  @Column()
  title: string;

  @Column()
  companyName: string;

  @Column({ nullable: true })
  companyIndustry: string;

  @Column({ nullable: true })
  companyWebsite: string;

  @Column()
  location: string;

  @Column({ nullable: true })
  state: string;

  @Column({ default: false })
  isRemote: boolean;

  @Column({ nullable: true })
  employmentType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salaryMin: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salaryMax: number;

  @Column({ default: 'USD' })
  salaryCurrency: string;

  @Column({ type: 'simple-array', nullable: true })
  skills: string[];

  @Column({ type: 'integer', nullable: true })
  experienceRequired: number;

  @Column({ type: 'date' })
  postedDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
