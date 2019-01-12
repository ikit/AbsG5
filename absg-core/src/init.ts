import { getConnection, getRepository } from "typeorm";
import { Citation, Immt, User, Parameter, Person, Place, EventG, Forum, Discussion, Message, AgpaAward, AgpaCategory, AgpaCategoryVariation, AgpaPhoto, AgpaVote } from "./entities";
import * as D from './data/data';

export class Init {

    async initData(reset = false, initFakeData=false) {
        if (reset || initFakeData) {
            console.info('Clear all data...');
            await this.clearAll();
        }
        if (initFakeData) {
            console.info('Init fake data...');
            await this.initAbsg();
            await this.initForum();
            await this.initAgpa();
        }
        console.info('Init done.');
    }

    async clearAll() {
        const entities = (await getConnection().entityMetadatas).map(x => ({ name: x.name, tableName: x.tableName }));
        for (const entity of entities) {
            const repository = await getRepository(entity.name);
            await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
            await repository.query(`ALTER SEQUENCE ${entity.tableName}_id_seq RESTART WITH 1;`);
        }
    }
    
    async insert(entity, items: any[]) {
        const data = [];
        for (let item of items) {
            const dataItem = await getRepository(entity).save(item);
            data.push(dataItem);
        }
        return data;
    }


    async initAbsg() {
        await this.insert(Parameter, D.PARAMETERS);
        // TODO: Logs

        // Utilisateurs
        await this.insert(Place, D.PLACES);
        await this.insert(Person, D.PERSONS);
        await this.insert(User, D.USERS);
        
        // Agenda, citations et immt
        await this.insert(EventG, D.EVENTGS);
        await this.insert(Citation, D.CITATIONS);
        await this.insert(Immt, D.IMMTS);
    }
    async initForum() {
        await this.insert(Forum, D.FORUMS);
        await this.insert(Discussion, D.DISCUSSIONS);
        await this.insert(Message, D.MESSAGES);
    }

    async initAgpa() {
        await this.insert(AgpaCategory, D.AGPA_CATS);
        await this.insert(AgpaCategoryVariation, D.AGPA_CATVARS);
        await this.insert(AgpaPhoto, D.AGPA_PHOTOS);
        await this.insert(AgpaVote, D.AGPA_VOTES);
        await this.insert(AgpaAward, D.AGPA_AWARDS);
    }

    randomItem(arr: any[], nullable = true) {
        return (nullable && Math.random() < 0.5)
        ? null 
        : arr[Math.floor(Math.random() * arr.length)];
    }

}