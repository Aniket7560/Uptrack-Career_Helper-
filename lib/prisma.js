// import { PrismaClient } from "@prisma/client";

// export const db = globalThis.prisma || new PrismaClient();

// if(process.env.NODE_ENV !== "production") {
//     globalThis.prisma = db;
// }


// lib/prisma.js
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db


// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.