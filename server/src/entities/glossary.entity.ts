import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

export type GlossaryLevel = 'basic' | 'advanced';

@Entity('glossaries')
export class Glossary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  term: string;

  @Column({ type: 'text' })
  definition: string;

  @Column({ type: 'enum', enum: ['basic', 'advanced'], default: 'basic' })
  level: GlossaryLevel;

  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parent_id: number | null;

  @ManyToOne(() => Glossary, (glossary) => glossary.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: Glossary | null;

  @OneToMany(() => Glossary, (glossary) => glossary.parent)
  children: Glossary[];

  @Column({ length: 255, nullable: true })
  image_url: string | null;

  @Column({ length: 255, nullable: true })
  video_url: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
