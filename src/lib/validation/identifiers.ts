import { z } from "zod";

export const entityIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(150)
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Invalid identifier."
  );

export const projectIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Invalid project identifier."
  );