import { Entity, PrimaryColumn, Column } from "typeorm";


@Entity()
export class AgpaCategory {
    @PrimaryColumn()
    id: number;

    @Column({ comment: 'Ordre d\'affichage de la catégorie', width: 2 })
    order: number;  

    @Column({ comment: 'Titre de la catégorie' })
    title: string;
    
    @Column({ comment: 'Description de la catégorie' })
    description: string;
    
    @Column({ comment: 'Couleur de la catégorie', length: 7 })
    color: string;
}
