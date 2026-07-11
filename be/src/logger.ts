export type LogLevel = "INFO" | "WARN" | "ERROR" | "SUCCESS";

const COLORS = {
  INFO: "\x1b[36m",
  WARN: "\x1b[33m",
  ERROR: "\x1b[31m",
  SUCCESS: "\x1b[32m",
};

const RESET = "\x1b[0m";

export function log(
  level: LogLevel,
  message: string,
  data?: unknown
) {
  const time = new Date().toLocaleTimeString();

  console.log(
    `${COLORS[level]}[${time}] [${level}]${RESET} ${message}`
  );

  if (data !== undefined) {
    console.dir(data, { depth: null });
  }
}

export const logger = {
  info: (msg: string, data?: unknown) =>
    log("INFO", msg, data),

  warn: (msg: string, data?: unknown) =>
    log("WARN", msg, data),

  error: (msg: string, data?: unknown) =>
    log("ERROR", msg, data),

  success: (msg: string, data?: unknown) =>
    log("SUCCESS", msg, data),
};