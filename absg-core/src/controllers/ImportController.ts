import { JsonController, Post, NotFoundError, UploadedFile } from "routing-controllers";
import { getConnection, QueryRunner, getRepository } from "typeorm";
//import * as Excel from 'exceljs';
//import * as csv from 'csvtojson';

@JsonController("/imports")
export class ImportController {
    /*
    @Post('/')
    async import(@UploadedFile("file") file: any) {
        if (!file) {
            throw new NotFoundError(`Aucun fichier reçu`);
        }

        let result;
        if (file.originalname.endsWith(".csv")) {
            result = await this.importCsvFile(file);
        } else {
            result = await this.importXlsFile(file);
        }

        let entityName = result[0];
        let data = result[1];
        let success = null;
        let messages = [];
        
        // init transaction
        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            switch (entityName) {
                // on importe les données en fonction du type
                case 'driver': await this.defaultImport(data, queryRunner, messages, entityName, () => new Driver()); break;
                case 'regiment': await this.defaultImport(data, queryRunner, messages, entityName, () => new Regiment()); break;
                case 'part': await this.defaultImport(data, queryRunner, messages, entityName, () => new Part()); break;
                case 'equipment': await this.defaultImport(data, queryRunner, messages, entityName, () => new Equipment()); break;
                case 'fleet': await this.defaultImport(data, queryRunner, messages, entityName, () => new Fleet()); break;
                case 'squad': await this.importSquads(data, queryRunner, messages); break;
                case 'vehicle': await this.importVehicles(data, queryRunner, messages); break;
                case 'maintenance-plan': await this.importMaintenancePlans(data, queryRunner, messages); break;
                case 'gas-stations': await this.importGasStations(data, queryRunner, messages); break;

                default: throw new NotFoundError(`Impossible d'importer ce type de fichier.`);
            }
            
            await queryRunner.commitTransaction(); // valide la transaction
            success = true;
            messages.push(this.log(`Toutes les données ont été importées`));
            
        } catch (err) {
            await queryRunner.rollbackTransaction(); // rollback la transaction si une erreur est detectée
            success = false;
            messages.push(this.log(err.toString()));
        } finally {
            await queryRunner.release(); // libère la DB une fois la transaction terminée
        }

        return { success, messages }
    }


    async importXlsFile(file) {
        // extraction de la première feuille du fichier
        let data = [];
        const wb = await (new Excel.Workbook().xlsx as any).load(file.buffer);
        const ws: Excel.Worksheet = wb.getWorksheet(1);
        if (!ws) {
            throw new NotFoundError(`Aucune donnée à lire dans le fichier`);
        }

        // extraction des données de la feuille
        ws.eachRow((row, rowNumber) => {
            data[rowNumber] = [];
            row.eachCell({ includeEmpty: true }, (cell) => {
                data[rowNumber].push(cell.value);
            })
        });
        data = data.filter(Boolean);
        
        // on essaye de déterminer le type d'entité à importer à partir de la première case
        const field = data[0][0].split('_');
        return [field[1], data];
    }

    async importCsvFile(file) {
        const data = await csv().fromString(file.buffer.toString('utf8'));
        const field = file.originalname.split('.');

        return [field[0], data];
    }


    async importVehicles(data: any[] = [], queryRunner: QueryRunner, messages: any[] = []) {
        let i = 0;
        for (let row of data) {
            if (i > 0) {
                const vehicleId = row[0];
                if (vehicleId) {
                    // modification d'un véhicule
                    const vehicle = await queryRunner.manager.findOne(Vehicle, vehicleId);
                    if (!vehicle) {
                        throw new NotFoundError(`Le véhicule id ${vehicleId} n'existe pas`);
                    }
                    vehicle.name = row[1];
                    vehicle.plate = row[2];
                    vehicle.vinNumber = row[5];
                    vehicle.registrationDate = row[8];
                    if (row[3]) {
                        const type = await queryRunner.manager.findOne(VehicleType, { where: { name: row[3] }});
                        if (type) {
                            vehicle.type = type;
                        } else {
                            throw new NotFoundError(`Type de vehicle inexistant (${row[3]}) pour le véhicule id ${vehicleId}`);
                        }
                    } else {
                        vehicle.type = null;
                    }
                    if (row[4]) {
                        const status = await queryRunner.manager.findOne(VehicleStatus, { where: { name: row[4] }});
                        if (status) {
                            vehicle.status = status;
                        } else {
                            throw new NotFoundError(`Status de vehicle inexistant (${row[4]}) pour le véhicule id ${vehicleId}`);
                        }
                    } else {
                        vehicle.status = null;
                    }
                    if (row[6]) {
                        const fleet = await queryRunner.manager.findOne(Fleet, { where: { name: row[6] }});
                        if (fleet) {
                            vehicle.fleet = fleet;
                        } else {
                            throw new NotFoundError(`Flotte de vehicle inexistante (${row[6]}) pour le véhicule id ${vehicleId}`);
                        }
                    } else {
                        vehicle.fleet = null;
                    }
                    if (row[7]) {
                        const squad = await queryRunner.manager.findOne(Squad, { where: { name: row[7] }});
                        if (squad) {
                            vehicle.squad = squad;
                        } else {
                            throw new NotFoundError(`Escadron de vehicle inexistant (${row[7]}) pour le véhicule id ${vehicleId}`);
                        }
                    } else {
                        vehicle.squad = null;
                    }

                    await queryRunner.manager.save(vehicle);
                    messages.push(this.log(`Véhicule ${vehicleId} importé avec succès`));
                } else {
                    // création d'un véhicule
                    const vehicle = new Vehicle();
                    vehicle.name = row[1];
                    vehicle.plate = row[2];
                    vehicle.vinNumber = row[5];
                    vehicle.registrationDate = row[8] ? new Date(row[8]) : null;
                    if (row[3]) {
                        const type = await queryRunner.manager.findOne(VehicleType, { where: { name: row[3] }});
                        if (type) {
                            vehicle.type = type;
                        }
                    }
                    if (row[4]) {
                        const status = await queryRunner.manager.findOne(VehicleStatus, { where: { name: row[4] }});
                        if (status) {
                            vehicle.status = status;
                        }
                    }
                    if (row[6]) {
                        const fleet = await queryRunner.manager.findOne(Fleet, { where: { name: row[6] }});
                        if (fleet) {
                            vehicle.fleet = fleet;
                        }
                    }
                    if (row[7]) {
                        const squad = await queryRunner.manager.findOne(Squad, { where: { name: row[7] }});
                        if (squad) {
                            vehicle.squad = squad;
                        }
                    }

                    await queryRunner.manager.save(vehicle);
                    messages.push(this.log(`Véhicule ${vehicle.name} créé avec succès`));
                }
            }
            i++;
        }
    }

    async importSquads(data: any[] = [], queryRunner: QueryRunner, messages: any[] = []) {
        let i = 0;
        for (let row of data) {
            if (i > 0) {
                const squadId = row[0];
                let squad;
                if (squadId) {
                    // modification
                    squad = await queryRunner.manager.findOne(Squad, squadId);
                    if (!squad) {
                        throw new NotFoundError(`Escadron id ${squadId} n'existe pas`);
                    }
                } else {
                    // création
                    squad = new Squad();
                }

                squad.name = row[1];
                if (row[2]) {
                    const regiment = await queryRunner.manager.findOne(Regiment, { where: { id: +row[2] }});
                    if (regiment) {
                        squad.regiment = regiment;
                    } else {
                        throw new NotFoundError(`Régiment inexistant (${row[2]}) pour l'escadron id ${squadId}`);
                    }
                } else {
                    squad.regiment = null;
                }

                await queryRunner.manager.save(squad);
                if (squadId) {
                    messages.push(this.log(`Escadron ${squadId} importé avec succès`));
                } else {
                    messages.push(this.log(`Escadron ${squad.name} créé avec succès`));
                }
            }
            i++;
        }
    }

    async importMaintenancePlans(data: any[] = [], queryRunner: QueryRunner, messages: any[] = []) {
        let i = 0;
        for (let row of data) {
            if (i > 0) {
                const maintPlanId = row[0];
                let maintPlan: MaintenancePlan;

                if (maintPlanId) {
                    // modification
                    maintPlan = await queryRunner.manager.findOne(MaintenancePlan, maintPlanId);
                    if (!maintPlan) {
                        throw new NotFoundError(`Le plan de maintenance id ${maintPlanId} n'existe pas`);
                    }
                } else {
                    // création
                    maintPlan = new MaintenancePlan();
                }

                if (row[1]) {
                    const vehicleType = await queryRunner.manager.findOne(VehicleType, { where: { name: row[1] }});
                    if (vehicleType) {
                        maintPlan.vehicleType = vehicleType;
                    } else {
                        throw new NotFoundError(`Le type de véhicule (${row[1]}) n'existe pas`);
                    }
                } else {
                    maintPlan.vehicleType = null;
                }

                maintPlan.serviceTask = row[2];
                maintPlan.meterInterval = row[3];
                maintPlan.timeInterval = row[4];
                maintPlan.timeFrequency = row[5];
                maintPlan.dueSoonMeterThreshold = row[6];
                maintPlan.dueSoonTimeThresholdInterval = row[7];
                maintPlan.dueSoonTimeThresholdFrequency = row[8];

                await queryRunner.manager.save(maintPlan);
                if (maintPlanId) {
                    messages.push(this.log(`Plan de maintenance ${maintPlanId} importé avec succès`));
                } else {
                    messages.push(this.log(`Plan de maintenance ${maintPlan.serviceTask} créé avec succès`));
                }
            }
            i++;
        }
    }

    async importGasStations(data: any[] = [], queryRunner: QueryRunner, messages: any[] = []) {
        const repo = getRepository(GasStation);

        // suppression des anciennes données
        await repo.clear();

        // préparation des lignes
        const rows = data.map(row => {
            const latlng = row.latlng.split(',');
            return {
                id: row.id,
                roadType: row.typeroute,
                addresse: row.adresse,
                town: row.commune,
                postalCode: row.codepostal,
                hstart: row.hdebut,
                hend: row.hfin,
                exception: row.saufjour,
                services: row.services,
                fuels: row.carburants,
                active: row.activite,
                localization: {
                    type: "Point", 
                    coordinates: [latlng[1], latlng[0]]
                }
            };
        });

        // import par paquet de 4000
        const packetSize = 4000;
        const nbPackets = Math.round(rows.length / packetSize);

        for (let i = 1; i <= nbPackets; i++) {
            // bulk insert
            const packetRows = rows.slice(i * nbPackets, packetSize);
            await queryRunner.manager
                .createQueryBuilder()
                .insert()
                .into(GasStation)
                .values(packetRows)
                .execute();
        }
    }
*/

    /**
     * Permet d'importer les données dans les tables simples (sans relations)
     * @param data les données à importer
     * @param queryRunner le queryRunner utilisé dans la transaction
     * @param messages le tableau contenant les messages (logs)
     * @param entityName le nom de l'entité correspondant aux données
     * @param entityClass le constructeur de l'entité
     */
    async defaultImport(
        data: any[] = [],
        queryRunner: QueryRunner,
        messages: any[] = [],
        entityName: string,
        entityClass: Function
    ) {
        const metadata = getConnection().getMetadata(entityName);
        const headers = metadata.columns.map(c => ({
            field: c.propertyName,
            title: c.comment,
            locked: c.isPrimary
        }));

        let i = 0;
        for (const row of data) {
            if (i > 0) {
                const entityId = row[0];
                let entity;
                if (entityId) {
                    // modification
                    entity = await queryRunner.manager.findOne(entityName, entityId);
                    if (!entity) {
                        throw new NotFoundError(`L'entité ${entityName} id ${entityId} n'existe pas`);
                    }
                } else {
                    // création
                    entity = entityClass();
                }

                headers.forEach((header, i) => {
                    if (!header.locked) {
                        entity[header.field] = row[i];
                    }
                });

                await queryRunner.manager.save(entity);
                if (entityId) {
                    messages.push(this.log(`Entité ${entityName} ${entityId} importée avec succès`));
                } else {
                    messages.push(this.log(`Entité ${entityName} ${entity.name} créée avec succès`));
                }
            }
            i++;
        }
    }

    log(message: string) {
        return {
            datetime: new Date().toISOString(),
            message
        };
    }
}
