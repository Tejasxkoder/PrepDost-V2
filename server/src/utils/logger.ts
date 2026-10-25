type LogLevel = "info" | "warn" | "error";

function timestamp(): string {
  return new Date().toISOString();
}

function write(
  level: LogLevel,
  scope: string,
  message: string,
  meta?: Record<string, unknown>
): void {
  const line = `[${timestamp()}] [${level.toUpperCase()}] [${scope}] ${message}`;
  const suffix = meta ? ` ${JSON.stringify(meta)}` : "";

  if (level === "error") {
    console.error(line + suffix);
  } else if (level === "warn") {
    console.warn(line + suffix);
  } else {
    console.log(line + suffix);
  }
}

export const logger = {
  info: (
    scope: string,
    message: string,
    meta?: Record<string, unknown>
  ) => write("info", scope, message, meta),

  warn: (
    scope: string,
    message: string,
    meta?: Record<string, unknown>
  ) => write("warn", scope, message, meta),

  error: (
    scope: string,
    message: string,
    meta?: Record<string, unknown>
  ) => write("error", scope, message, meta),
};