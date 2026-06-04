import "dotenv/config";
import { defineConfig } from "prisma/config";
import { getCliDatabaseUrl } from "./src/lib/db-url";

let databaseUrl: string;
try {
  databaseUrl = getCliDatabaseUrl();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
