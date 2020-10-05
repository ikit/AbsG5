require("dotenv").config();

const isDev = process.env.NODE_ENV === "development";
const srcPath = isDev ? "src" : "build";
const fileExt = isDev ? "ts" : "js";

module.exports = [
    {
        name: "default",
        type: process.env.DB_TYPE_DEFAULT,
        host: process.env.DB_HOST_DEFAULT,
        port: process.env.DB_PORT_DEFAULT,
        username: process.env.DB_USER_DEFAULT,
        password: process.env.DB_PASSWORD_DEFAULT,
        database: process.env.DB_NAME_DEFAULT,
        synchronize: true,
        logging: true,
        entities: [`${srcPath}/entities/**/*.${fileExt}`],
        migrations: [`${srcPath}/migration/**/*.${fileExt}`],
        subscribers: [`${srcPath}/subscriber/**/*.${fileExt}`],
        cli: {
            entitiesDir: `${srcPath}/entities`,
            migrationsDir: `${srcPath}/migration`,
            subscribersDir: `${srcPath}/subscriber`
        },
        pgDump: "C:/Program Files/PostgreSQL/11/bin/pg_dump"
    }
];
