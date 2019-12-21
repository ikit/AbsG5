require("dotenv").config();

const rootDir = process.env.NODE_ENV === "development" ? "src" : "build";

module.exports = [
    {
        name: "default",
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "postgres",
        password: "postgres",
        database: "absg",
        synchronize: true,
        logging: false,
        entities: [`${rootDir}/entities/**/*.{ts,js}`],
        migrations: [`${rootDir}/migration/**/*.{ts,js}`],
        subscribers: [`${rootDir}/subscriber/**/*.{ts,js}`],
        cli: {
            entitiesDir: `${rootDir}/entities`,
            migrationsDir: `${rootDir}/migration`,
            subscribersDir: `${rootDir}/subscriber`
        }
    }
];
