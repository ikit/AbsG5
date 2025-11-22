require("dotenv").config();
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { createExpressServer } from "routing-controllers";
import { logger, errorLogHandler, accessLogHandler } from "./middleware/logger";
import { jwtAuthorizationChecker, currentUserChecker } from "./middleware";
import * as express from "express";
import * as fileUpload from "express-fileupload";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import cookieParser from "cookie-parser";
import {
    agpaService,
    citationService,
    immtService,
    agendaService,
    voyagService,
    eventService,
    userService,
    forumService,
    gthequeService
} from "./services";
import { albumService } from "./services/AlbumService";

AppDataSource.initialize()
    .then(() => {
        logger.info("TypeORM DataSource initialized successfully");

        // Une fois la connection créé, on peut initialialiser les services
        agendaService.initService();
        agpaService.initService();
        citationService.initService();
        eventService.initService();
        forumService.initService();
        immtService.initService();
        voyagService.initService();
        userService.initService();
        albumService.initService();
        gthequeService.initService();
        logger.info("AbsG services initialized");

        // create express app
        const app = createExpressServer({
            routePrefix: "/api",
            controllers: [__dirname + "/controllers/*.ts", __dirname + "/controllers/*.js"],
            authorizationChecker: jwtAuthorizationChecker,
            currentUserChecker
        });

        // Security middleware
        app.use(helmet({
            contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
            crossOriginEmbedderPolicy: false
        }));

        // CORS configuration
        app.use(cors({
            origin: process.env.CORS_ORIGIN || "*",
            credentials: true
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // Limit each IP to 100 requests per windowMs
            standardHeaders: true,
            legacyHeaders: false,
        });
        app.use("/api/", limiter);

        // Cookie parser
        app.use(cookieParser());

        if (process.env.NODE_ENV === "development") {
            app.use("/files", express.static(process.env.PATH_FILES));
        }

        // enable files upload
        app.use(
            fileUpload({
                createParentPath: true,
                limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
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
