import morgan, { StreamOptions } from "morgan";
import logger from "../utils/logger";

// Stream logs through Winston
const stream: StreamOptions = {
  write: (message: string) => logger.http(message.trim()),
};

// Skip logging for non-meaningful requests
const skip = () => {
  const env = process.env.NODE_ENV || "development";
  return env !== "development";
};

const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip },
);

export default morganMiddleware;
