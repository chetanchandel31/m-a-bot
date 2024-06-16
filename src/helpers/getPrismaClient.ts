import { PrismaClient } from "@prisma/client";

let prismaClient: PrismaClient | null = null;

export default function getPrismaClient() {
  if (!prismaClient) {
    prismaClient = new PrismaClient({
      //  log: ["query", "info", "warn"]
    });
  }

  return prismaClient;
}
