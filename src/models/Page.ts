import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  content!: string;

  @Column({ default: 'bg' })
  language!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
