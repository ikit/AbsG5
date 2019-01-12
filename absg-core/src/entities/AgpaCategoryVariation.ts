import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class AgpaCategoryVariation {
    @PrimaryColumn({ comment: 'Catégorie de la variante', width: 2 })
    id: number;
    
    @PrimaryColumn({ comment: 'Année de la variante', width: 4 })
    year: number;

    @Column({ comment: 'Titre de la variante' })
    title: string;
    
    @Column({ comment: 'Description de la variante' })
    description: string;
}