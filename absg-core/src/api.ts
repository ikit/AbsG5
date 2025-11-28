require("dotenv").config();
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { useExpressServer } from "routing-controllers";
import { logger, errorLogHandler, accessLogHandler } from "./middleware/logger";
import { jwtAuthorizationChecker, currentUserChecker } from "./middleware";
import express from "express";
const fileUpload = require("express-fileupload");
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

        // Create base Express app first
        const expressApp = express();

        // Security middleware (must be first)
        expressApp.use(helmet({
            contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
            crossOriginEmbedderPolicy: false
        }));

        // CORS configuration
        expressApp.use(cors({
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
        expressApp.use("/api/", limiter);

        // Cookie parser
        expressApp.use(cookieParser());

        // File upload (must be before body parsers)
        expressApp.use(
            fileUpload({
                createParentPath: true,
                limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
                useTempFiles: true,
                tempFileDir: '/tmp/',
                parseNested: true,
                abortOnLimit: false,
                debug: false
            })
        );

        // Body parsers
        expressApp.use(express.json({ limit: "50mb" }));
        expressApp.use(express.urlencoded({ extended: true, limit: "50mb" }));

        // Static files in development
        if (process.env.NODE_ENV === "development") {
            expressApp.use("/files", express.static(process.env.PATH_FILES));
        }

        // Logging middleware
        expressApp.use(accessLogHandler());
        expressApp.use(errorLogHandler());

        // Now add routing-controllers to the existing app
        const app = useExpressServer(expressApp, {
            routePrefix: "/api",
            controllers: [__dirname + "/controllers/*.ts", __dirname + "/controllers/*.js"],
            authorizationChecker: jwtAuthorizationChecker,
            currentUserChecker
        });

        // start express server
        app.listen(process.env.API_PORT);
        logger.info(`Server has started on port ${process.env.API_PORT}.`);
    })
    .catch(error => {
        console.error(error);
        logger.error(error);
    });
