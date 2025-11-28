import "reflect-metadata"
import { AppDataSource } from "../../src/data-source"
import { useExpressServer } from "routing-controllers"
import express from "express"
import cookieParser from "cookie-parser"

/**
 * Create a test Express app for integration testing
 * This is a simplified version without all middleware
 */
export async function createTestApp() {
  // Initialize database connection
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  // Create Express app
  const expressApp = express()

  // Basic middleware
  expressApp.use(cookieParser())
  expressApp.use(express.json())
  expressApp.use(express.urlencoded({ extended: true }))

  // Add routing-controllers
  const app = useExpressServer(expressApp, {
    routePrefix: "/api",
    controllers: [__dirname + "/../../src/controllers/*.ts"],
    defaultErrorHandler: false
  })

  return app
}

/**
 * Close database connection after tests
 */
export async function closeTestApp() {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy()
  }
}
