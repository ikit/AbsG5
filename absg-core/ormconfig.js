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
        entities: ["build/entities/**/*.js"],
        migrations: ["build/migration/**/*.js"],
        subscribers: ["build/subscriber/**/*.js"],
        cli: {
        entitiesDir: "build/entities",
        migrationsDir: "build/migration",
        subscribersDir: "build/subscriber"
        },
        pgDump: "C:/Program Files/PostgreSQL/11/bin/pg_dump"
    }
];
  