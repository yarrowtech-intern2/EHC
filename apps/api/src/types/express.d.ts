declare module "express" {
  export function json(options?: Record<string, unknown>): unknown;
  export function urlencoded(options?: Record<string, unknown>): unknown;
}
