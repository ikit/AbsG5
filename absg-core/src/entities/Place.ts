import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Place {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ comment: "Nom d usage du lieux" })
    name: string;

    @Column({ comment: "Adresse complète du lieux", nullable: true })
    address: string;

    @Column({ comment: "URL vers la visite virtuelle", nullable: true })
    virtualVisitUrl: string;

    @Column({ comment: "Téléphone fixe", nullable: true })
    phone: string;

    @Column({ comment: "Coordonnée GPS", nullable: true })
    gps: string;

    @Column({ comment: "Photo illustrant le lieux", nullable: true })
    photo: string;

    fromJSON(data: any) {
        Object.assign(this, data);
        return this;
    }
}
