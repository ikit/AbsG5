import { JsonController, Post, Body, Res } from "routing-controllers";
import { getRepository, Equal, FindManyOptions, getConnection } from "typeorm";
import { addDays } from "date-fns";
import * as Excel from 'exceljs';

export interface ExcelSheet {
    name: string;
    headers: any[];
    rows: any[];
}

@JsonController('/exports')
export class ExportController {
    /*
    private vehicleRepo = getRepository(Vehicle);
    private missionRepo = getRepository(Mission);
    private humsService = new HumsService();

    @Post('/vehicles')
    async vehicles(@Body() params, @Res() response) {
        // on recupère les vehicules de la flotte
        const options: FindManyOptions = {
            order: { id: 'ASC' },
            where: {},
            relations: ['parts', 'transportOrdersVehicle']
        };
        if (params.fleetId) {
            options.where['fleet'] = Equal(params.fleetId);
        }
        const vehicles: any[] = await this.vehicleRepo.find(options);

        // pour chaque véhicule
        for (let vehicle of vehicles) {
            // on recupère la date de prochaine maintenance
            vehicle.nextMaintenance = null;

            // on recupère la prochaine mission où le vehicule est affecté
            const nextMissionId = await this.missionRepo.query(`
                SELECT "mission"."id"
                FROM "mission"
                LEFT JOIN "transport_order" ON "transport_order"."missionId" = "mission"."id"
                WHERE "departureDate" > NOW()
                AND "vehicleId" = $1
                ORDER BY "departureDate" ASC
                LIMIT 1`, [vehicle.id]);
            vehicle.nextMission = nextMissionId.length ? await this.missionRepo.findOne({ id: nextMissionId[0].id }) : null;

            // on recupère les données HUMS
            vehicle.hums = await this.humsService.getHumsByVehicle(vehicle.vinNumber);
        };

        const headers = [
            { title: 'milfleet_vehicle_id', locked: true },
            { title: 'Nom', locked: false },
            { title: 'Plaque immat.', locked: false },
            { title: 'Type', locked: false },
            { title: 'Status', locked: false },
            { title: 'VIN', locked: false },
            { title: 'Flotte', locked: false },
            { title: 'Escadron', locked: false },
            { title: 'Mise en circulation', locked: false },
            { title: `Nombre d'équipement`, locked: false },
            { title: 'Date prochaine mission', locked: false },
            { title: 'Nom prochaine mission', locked: false },
            { title: 'Date prochaine maintenance', locked: false },
    
            { title: 'Distance totale parcourue', locked: true },
            { title: 'Niveau de batterie', locked: true },
            { title: 'Temp. liquide refroidissement', locked: true },
            { title: 'Total heure utilisation', locked: true },
            { title: `Niveau d'huile`, locked: true },
            { title: 'Vitesse moteur', locked: true },
            { title: 'Température ambiante', locked: true },
            { title: 'Pression barométrique', locked: true },
            { title: 'Niveau de carburant', locked: true },
            { title: 'Carburant total utilisé', locked: true },
            { title: 'Conso. moyenne carburant', locked: true },
            { title: 'Temp. carburant', locked: true },
            { title: 'Vitesse', locked: true },
            { title: 'Vitesse selectionnée', locked: true },
            { title: 'Localisation X,Y,Z', locked: true },
            { title: 'Pitch', locked: true },
            { title: 'Roll', locked: true },
            { title: 'Yaw', locked: true },
            { title: 'Magnitude', locked: true },
            { title: 'Grade', locked: true },
            { title: 'Acceleration X,Y,Z', locked: true },
            { title: 'RMS X', locked: true },
        ];

        const rows = vehicles.map((vehicle) => ([
            vehicle.id,
            vehicle.name,
            vehicle.plate,
            vehicle.type ? vehicle.type.name : null,
            vehicle.status ? vehicle.status.name : null,
            vehicle.vinNumber,
            vehicle.fleet ? vehicle.fleet.name : null,
            vehicle.squad ? vehicle.squad.name : null,
            vehicle.registrationDate,
            vehicle.equipments.length,
            vehicle.nextMission ? vehicle.nextMission.departureDate : null,
            vehicle.nextMission ? vehicle.nextMission.name : null,
            vehicle.nextMaintenance ? vehicle.nextMaintenance.date : null,

            vehicle.hums.distance.total ? vehicle.hums.distance.total.value : null,
            vehicle.hums.engine.battery ? vehicle.hums.engine.battery.value : null,
            vehicle.hums.engine.coolant ? vehicle.hums.engine.coolant.value : null,
            vehicle.hums.engine.hours ? vehicle.hums.engine.hours.value : null,
            vehicle.hums.engine.oil ? vehicle.hums.engine.oil.value : null,
            vehicle.hums.engine.rpm ? vehicle.hums.engine.rpm.value : null,
            vehicle.hums.environment.air ? vehicle.hums.environment.air.value : null,
            vehicle.hums.environment.barometricPressure ? vehicle.hums.environment.barometricPressure.value : null,
            vehicle.hums.fuel.level ? vehicle.hums.fuel.level.value : null,
            vehicle.hums.fuel.total ? vehicle.hums.fuel.total.value : null,
            vehicle.hums.fuel.rate ? vehicle.hums.fuel.rate.value : null,
            vehicle.hums.fuel.temp ? vehicle.hums.fuel.temp.value : null,
            vehicle.hums.gear.speed ? vehicle.hums.gear.speed.value : null,
            vehicle.hums.gear.selectedGear ? vehicle.hums.gear.selectedGear.value : null,
            vehicle.hums.sensors.x ? `${vehicle.hums.sensors.x.value},${vehicle.hums.sensors.y.value},${vehicle.hums.sensors.z.value}` : null,
            vehicle.hums.sensors.pitch ? vehicle.hums.sensors.pitch.value : null,
            vehicle.hums.sensors.roll ? vehicle.hums.sensors.roll.value : null,
            vehicle.hums.sensors.yaw ? vehicle.hums.sensors.yaw.value : null,
            vehicle.hums.sensors.magnitude ? vehicle.hums.sensors.magnitude.value : null,
            vehicle.hums.sensors.grade ? vehicle.hums.sensors.grade.value : null,
            vehicle.hums.acceleration.x ? `${vehicle.hums.acceleration.x.value},${vehicle.hums.acceleration.y.value},${vehicle.hums.acceleration.z.value}` : null,
            vehicle.hums.acceleration.rmsX ? vehicle.hums.acceleration.rmsX.value : null
        ]));

        const sheets: ExcelSheet[] = [
            { name: 'vehicles', headers, rows }
        ];
        
        return await this.exportAsExcel(sheets, 'vehicles', response);
    }

    @Post('/vehicles-hums-history')
    async vehiclesHumsHistory(@Body() params, @Res() response) {
        const { start, end } = params;
        const vehicleName = await this.humsService.getVehicleName(params.vehicleId);

        const humsFields = [
            'location', 'pitch', 'roll', 'yaw', 'pitchAndRollVectorMagnitude', 'grade', 'engineSpeed', 'engineOilTemperature', 
            'engineCoolantTemperature', 'engineTotalHoursOfOperation', 'batteryVoltage', 'fuelLevel', 'engineTotalFuelUsed', 
            'engineFuelRate', 'engineFuelTemperature', 'wheelBasedVehicleSpeed', 'transmissionSelectedGear', 'ambientAirTemperature', 
            'barometricPressure', 'Odometre', 'linearAccelerationX', 'linearAccelerationY', 'linearAccelerationZ', 'rmsLinearAccelerationX'
        ];
        const headers = [
            { title: 'Vehicule', locked: false },
            { title: 'Date et heure', locked: false },
            { title: 'Valeur', locked: false }
        ];
        const sheets: ExcelSheet[] = [];

        for (let field of humsFields) {
            const data = await this.humsService.getHistoryFromField(field, start, end, null, vehicleName);
            const dataValues = data.map(row => Object.values(row));

            sheets.push({
                name: field,
                headers,
                rows: dataValues
            });
        }

        return await this.exportAsExcel(sheets, 'vehicles-hums', response);
    }

    @Post('/maintenance-plans')
    async maintenancePlans(@Body() params, @Res() response) {
        // on recupère les plans de maintenance
        const options: FindManyOptions = {
            order: { id: 'ASC' },
            where: {}
        };

        if (params.vehicleTypeId) {
            options.where['vehicleTypeId'] = Equal(params.vehicleTypeId);
        }

        const headers = [
            { title: 'milfleet_maintenance-plan_id', locked: true },
            { title: 'Type de véhicule', locked: true },
            { title: 'Description', locked: false },
            { title: 'Intervalle (km)', locked: false },
            { title: 'Intervalle (temps)', locked: false },
            { title: 'Unité de temps', locked: false },
            { title: `Seuil d'alerte (km)`, locked: false },
            { title: `Seuil d'alerte (temps)`, locked: false },
            { title: 'Unité de temps', locked: false }
        ];
        const maintenancePlans = await getRepository(MaintenancePlan).find(options);
        const rows = maintenancePlans.map((maintPlan) => ([
            maintPlan.id,
            maintPlan.vehicleType.name,
            maintPlan.serviceTask,
            maintPlan.meterInterval ? maintPlan.meterInterval : null,
            maintPlan.timeInterval ? maintPlan.timeInterval : null,
            maintPlan.timeFrequency ? maintPlan.timeFrequency : null,
            maintPlan.dueSoonMeterThreshold ? maintPlan.dueSoonMeterThreshold : null,
            maintPlan.dueSoonTimeThresholdInterval ? maintPlan.dueSoonTimeThresholdInterval : null,
            maintPlan.dueSoonTimeThresholdFrequency ? maintPlan.dueSoonTimeThresholdFrequency : null
        ]));

        const sheets: ExcelSheet[] = [
            { name: 'maintenance-plans', headers, rows }
        ];
        
        return await this.exportAsExcel(sheets, 'maintenance-plans', response);
    }

    @Post('/maintenance-operations')
    async maintenanceOperations(@Body() params, @Res() response) {
        params.start = params.start || new Date();
        params.end = params.end || addDays(params.start, 60);
        
        // on recupère les opération de maintenance dont l'échéance se trouve dans l'intervalle
        const maintenanceOperations = await getRepository(MaintenanceOperation)
            .createQueryBuilder('mainOpe')
            .innerJoinAndSelect("mainOpe.vehicle", "vehicle")
            .innerJoinAndSelect("mainOpe.maintenancePlan", "maintenancePlan")
            .where('"nextDueAt" <= :end AND "nextDueAt" >= :start', { start: params.start, end: params.end })
            .getMany();
        const rows = maintenanceOperations.map((maintOpe) => ([
            maintOpe.id,
            maintOpe.vehicle.name,
            maintOpe.vehicle.plate,
            maintOpe.maintenancePlan.serviceTask,
            '',
            maintOpe.nextDueMeterValue,
            maintOpe.nextDueAt,
            maintOpe.maintenancePlan.meterInterval,
            `${maintOpe.maintenancePlan.timeInterval} ${maintOpe.maintenancePlan.timeFrequency}`
        ]));

        const sheets: ExcelSheet[] = [{
            name: 'maintenance-operations',
            headers: headers['maintenance-operations'].map(h => ({ title: h })),
            rows
        }];
        
        return await this.exportAsExcel(sheets, 'maintenance-operations', response);
    }

    @Post('/vehicle-equipments')
    async vehicleEquipments(@Body() params, @Res() response) {
        const options: FindManyOptions = {
            order: { id: 'ASC' },
            where: {}
        };

        if (params.vehicleId) {
            options.where['id'] = Equal(params.vehicleId);
        }

        const vehicles = await this.vehicleRepo.find(options);
        const rows = [];
        vehicles.forEach(vehicle => {
            vehicle.equipments.forEach(equipment => {
                rows.push([
                    equipment.id,
                    vehicle.id,
                    vehicle.name,
                    vehicle.plate,
                    equipment.name,
                    equipment.category,
                    equipment.manufacturer,
                    equipment.nno,
                    equipment.partNumber,
                    equipment.serialNumber,
                    equipment.version
                ]);
            });
        });

        const sheets: ExcelSheet[] = [{
            name: 'vehicle-equipments',
            headers: headers['vehicle-equipments'].map(h => ({ title: h })),
            rows
        }];
        
        return await this.exportAsExcel(sheets, 'vehicle-equipments', response);
    }

    @Post('/squads')
    async squads(@Res() response) {
        const squads = await getRepository(Squad).find({ relations: ['regiment'], order: { id: 'ASC' } });
        const rows = squads.map(row => ([
            row.id,
            row.name,
            row.regiment ? row.regiment.id : null
        ]))

        const sheets: ExcelSheet[] = [{
            name: 'squad',
            headers: headers['squad'].map(h => ({ title: h })),
            rows
        }];
        
        return await this.exportAsExcel(sheets, 'squad', response);
    }

    @Post('/equipments')
    equipments(@Res() response) {
        return this.defaultExport('equipment', response);
    }

    @Post('/parts')
    parts(@Res() response) {
        return this.defaultExport('part', response);
    }

    @Post('/regiments')
    regiments(@Res() response) {
        return this.defaultExport('regiment', response);
    }

    @Post('/drivers')
    drivers(@Res() response) {
        return this.defaultExport('driver', response);
    }

    @Post('/fleets')
    fleets(@Res() response) {
        return this.defaultExport('fleet', response);
    }
*/

    /**
     * Exporter les données d'une table simple (sans relations)
     * @param entityName le nom de l'entité correspondant aux données à exporter
     */
    async defaultExport(entityName: string, response) {
        const metadata = getConnection().getMetadata(entityName);
        const headers = metadata.columns.map(c => ({
            field: c.propertyName,
            title: c.comment,
            locked: c.isPrimary
        }));
        const entities = await getRepository(entityName).find({ order: { id: 'ASC' } });

        const sheets: ExcelSheet[] = [{
            name: entityName,
            headers,
            rows: entities.map(row => headers.map(h => row[h.field]))
        }];
        
        return await this.exportAsExcel(sheets, entityName, response);
    }

    /**
     * Créé le fichier Excel et insère les données dans les feuilles
     * @param sheets 
     * @param name nom du fichier
     */
    async exportAsExcel(sheets: ExcelSheet[], name: string, response) {
        const wb = new Excel.Workbook();
        
        sheets.forEach((sheet) => {
            const ws = wb.addWorksheet(sheet.name);
            
            // headers
            ws.columns = sheet.headers.map(header => ({
                header: header.title || header.field,
                width: 20,
                style: {
                    font: {
                        color: {
                            argb: header.locked ? 'FFD41010' : 'FF000000'
                        }
                    }
                }
            }));

            // rows
            sheet.rows.forEach(row => ws.addRow(row));
        });

        const filename = `export_${name}_${new Date().toISOString()}.xls`;
        const filetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        const data = await wb.xlsx.writeBuffer();
        response.setHeader('Content-Type', filetype);
        response.setHeader("Content-Disposition", "attachment; filename=" + filename);
        return response.send(data);
    }

}