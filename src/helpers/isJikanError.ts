import { JikanErrorResponse } from "../types";

export const isJikanError = (data: unknown): data is JikanErrorResponse =>
  !!data && typeof data === "object" && "error" in data;
