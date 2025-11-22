import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

const isDev = process.env.NODE_ENV === "development";
const srcPath = isDev ? "src" : "build";
const fileExt = isDev ? "ts" : "js";

export const AppDataSource = new DataSource({
    type: (process.env.DB_TYPE_DEFAULT as any) || "postgres",
    host: process.env.DB_HOST_DEFAULT || "localhost",
    port: parseInt(process.env.DB_PORT_DEFAULT || "5432"),
    username: process.env.DB_USER_DEFAULT || "postgres",
    password: process.env.DB_PASSWORD_DEFAULT,
    database: process.env.DB_NAME_DEFAULT || "absg5",
    synchronize: isDev, // Only in development
    logging: isDev ? ["error", "warn"] : false,
    entities: [`${srcPath}/entities/**/*.${fileExt}`],
    migrations: [`${srcPath}/migrations/**/*.${fileExt}`],
    subscribers: [`${srcPath}/subscribers/**/*.${fileExt}`],
    // PostgreSQL specific options
    extra: {
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    }
});
