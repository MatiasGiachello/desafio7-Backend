import winston from 'winston'
import { __dirname } from '../utils.js'
import path from 'path'
import config from "../config/config.js";

const customLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        http: 4,
        debug: 5,
    },
    colors: {
        fatal: "red",
        error: "orange",
        warn: "yellow",
        info: "blue",
        http: "green",
        debug: "purple",
    }
}

const logger = winston.createLogger({
    levels: customLevels.levels,
    transports: [
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevels.colors }),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: path.join(__dirname, "/logs/errors.log"),
            level: 'warn',
            format: winston.format.simple()
        })
    ]
})

export const devLogger = winston.createLogger({
    levels: customLevels.levels,
    transports: [
        new winston.transports.Console({ level: 'debug' }),
    ]
})

export const prodLogger = winston.createLogger({
    levels: customLevels.levels,
    transports: [
        new winston.transports.Console({ level: 'info' }),
        new winston.transports.File({ filename: path.join(__dirname, "/logs/errors.log"), level: 'error' })
    ]
})

const currentEnv = config.nodeENV || "development";
export const addLogger = (req, res, next) => {
    if (currentEnv === "development") {
        req.logger = devLogger;
    } else {
        req.logger = prodLogger;
    }
    req.logger.http(`${req.url} - method: ${req.method}`);
    next();
}