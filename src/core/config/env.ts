import "server-only";
import { z } from "zod";

const envSchema = z.object({
  COGNODB_URI: z.string().url().startsWith("bolt+s://"),
  COGNODB_USERNAME: z.string().min(1),
  COGNODB_PASSWORD: z.string().min(1),
});

export const env = envSchema.parse({
  COGNODB_URI: process.env.COGNODB_URI,
  COGNODB_USERNAME: process.env.COGNODB_USERNAME,
  COGNODB_PASSWORD: process.env.COGNODB_PASSWORD,
});