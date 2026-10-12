import { defineConfig, env } from "@prisma/config";
import "dotenv/config";

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || env("DATABASE_URL"),
  },
});
