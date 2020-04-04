import "reflect-metadata";
import { createConnections } from "typeorm";
import { createExpressServer } from "routing-controllers";
import * as bodyParser from "body-parser";
import { logger, errorLogHandler, accessLogHandler } from "./middleware/logger";
import { jwtAuthorizationChecker, currentUserChecker } from "./middleware";
import {
    agpaService,
    citationService,
    immtService,
    agendaService,
    voyagService,
    eventService,
    userService
} from "./services";
import * as ormconfig from "../ormconfig";
import { initWS } from "./wss";

createConnections(ormconfig)
    .then(() => {
        logger.info("ORM connection created");

        // Une fois la connection créé, on peut initialialiser les services
        agpaService.initService();
        citationService.initService();
        immtService.initService();
        agendaService.initService();
        voyagService.initService();
        eventService.initService();
        userService.initService();
        logger.info("AbsG services initialized");

        // create express app
        const app = createExpressServer({
            routePrefix: "/api",
            controllers: [__dirname + "/controllers/*.ts", __dirname + "/controllers/*.js"],
            authorizationChecker: jwtAuthorizationChecker,
            currentUserChecker
        });

        app.use(bodyParser.json()); // parse request as JSON
        app.use(accessLogHandler()); // access logs
        app.use(errorLogHandler()); // error logs

        // start express server
        app.listen(5000);
        logger.info("Server has started on port 5000.");

        // start websocket server
        initWS();
    })
    .catch(error => {
        console.error(error);
        logger.error(error);
    });
