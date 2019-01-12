# ABSG-CORE

> Cette API permet de controller les entités de l'application Absolument G

##Prérequis

Installer PostgreSQL > 9.7 avec l'extension Posgis, et créer une base de donnée en accord avec les paramètres utilisés dans les fichiers `ormconfig.development.json` et `ormconfig.production.json`

## Dependencies

[express](https://github.com/expressjs/express): HTTP server,  
[body-parser](https://www.npmjs.com/package/body-parser): parsing requests to check and return JSON values  
[date-fns](https://date-fns.org): tools for manipulating dates  
[reflect-metadata](https://github.com/rbuckton/reflect-metadata): Shim to use Decorators  
[routing-controllers](https://github.com/typestack/routing-controllers): Allows to create controller classes with methods as actions that handle requests  
[pg](https://github.com/brianc/node-postgres): PostgreSQL client for Node.js  
[typeorm](https://github.com/typeorm/typeorm): ORM for TypeScript  
[morgan + rotating-file-stream](https://github.com/expressjs/morgan): logs requests to file with file rotation

## Run

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `ormconfig.json` file
3. Run `npm run dev` command to reload the API on change
4. Run `npm start` command on production

## Prod

1. Install production dependencies only : `npm install --production`
2. Add API to PM2 : `pm2 start absg-core.js`
3. Show API logs : `pm2 logs absg-core`

## Links

[Generate SSL certs](https://kgaut.net/blog/2016/creer-un-certificat-ssl-autosigne-pour-le-developpement-en-local.html)

## Stations essence

Pour mettre à jour la liste des stations essence :
1. Récupérer le [jeu de données](https://www.data.gouv.fr/fr/datasets/stations-services-en-france/) depuis le site data.gouv
2. Renommer le fichier CSV en `gas-stations.csv`
3. L'importer depuis l'IHM. Les anciennes stations seront supprimées