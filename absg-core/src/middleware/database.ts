import { AppDataSource } from "../data-source";
import { EntityTarget, Repository } from "typeorm";

/**
 * Helper function to get repository from AppDataSource
 * This replaces the deprecated getRepository() from TypeORM 0.2.x
 */
export function getRepository<Entity>(target: EntityTarget<Entity>): Repository<Entity> {
    return AppDataSource.getRepository(target);
}
