import "reflect-metadata";
import { createConnections } from "typeorm";
import { createExpressServer } from "routing-controllers";
import * as path from 'path';
import * as bodyParser from "body-parser";
import * as morgan from 'morgan';
import rfs from 'rotating-file-stream';
import { Init } from './init';
import { jwtAuthorizationChecker, currentUserChecker } from "./middleware";

const ormconfig = require(`../ormconfig.${process.env.NODE_ENV}.json`);

createConnections(ormconfig).then(() => {

    // create express app
    const app = createExpressServer({
        routePrefix: '/api',
        controllers: [__dirname + '/controllers/*.ts'],
        authorizationChecker: jwtAuthorizationChecker,
        currentUserChecker
    });

    app.use(bodyParser.json());

    // prepare logs
    const accessLogStream = rfs('access.log', {
        interval: '1d', 
        path: path.join(__dirname, 'logs')
    });
    app.use(morgan('combined', { stream: accessLogStream }));
        
    // start express server
    app.listen(5000);
    
    console.info('Server has started on port 5000.');

    // init DB data on dev
    if (process.env.NODE_ENV === 'development') {
        new Init().initData();
    }
    
}).catch(error => console.log(error));
