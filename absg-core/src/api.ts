require("dotenv").config();
import "reflect-metadata";
import { createConnections } from "typeorm";
import { createExpressServer } from "routing-controllers";
import * as bodyParser from "body-parser";
import { logger, errorLogHandler, accessLogHandler } from "./middleware/logger";
import { jwtAuthorizationChecker, currentUserChecker } from "./middleware";
import * as express from "express";
import * as fileUpload from "express-fileupload";
import {
    agpaService,
    citationService,
    immtService,
    agendaService,
    voyagService,
    eventService,
    userService,
    forumService
} from "./services";
import * as ormconfig from "../ormconfig";

createConnections(ormconfig)
    .then(() => {
        logger.info("ORM connection created");

        // Une fois la connection créé, on peut initialialiser les services
        agendaService.initService();
        agpaService.initService();
        citationService.initService();
        eventService.initService();
        forumService.initService();
        immtService.initService();
        voyagService.initService();
        userService.initService();
        logger.info("AbsG services initialized");

        // create express app
        const app = createExpressServer({
            routePrefix: "/api",
            controllers: [__dirname + "/controllers/*.ts", __dirname + "/controllers/*.js"],
            authorizationChecker: jwtAuthorizationChecker,
            currentUserChecker
        });

        if (process.env.NODE_ENV === "development") {
            app.use("/files", express.static(process.env.PATH_FILES));
        }

        // enable files upload
        app.use(
            fileUpload({
                createParentPath: true
            })
        );

        app.use(express.json({ limit: "50mb" }));
        app.use(express.urlencoded({ extended: true, limit: "50mb" }));
        app.use(accessLogHandler()); // access logs
        app.use(errorLogHandler()); // error logs

        // start express server
        app.listen(process.env.API_PORT);
        logger.info(`Server has started on port ${process.env.API_PORT}.`);
    })
    .catch(error => {
        console.error(error);
        logger.error(error);
    });
