import path from "path";
import dotenv from "dotenv";

dotenv.config({
    path: path.resolve(__dirname, "../../.env.local"),
    override: true
});

interface ENV {
    NODE_ENV: string | undefined;
    PORT: string | undefined;
    CLIENT_PORT: string | undefined;
    DYNAMODB_URI: string | undefined;
    DYNAMODB_PORT: string | undefined;
    AWS_ACCESS_KEY_ID: string | undefined;
    AWS_SECRET_ACCESS_KEY: string | undefined;
    AWS_REGION: string | undefined;
    FIREBASE_PROJECT_ID: string | undefined;
    FIREBASE_PRIVATE_KEY: string | undefined;
    FIREBASE_CLIENT_EMAIL: string | undefined;
}

interface Config {
    NODE_ENV: string | undefined;
    PORT: string | undefined;
    CLIENT_PORT: string | undefined;
    DYNAMODB_URI: string | undefined;
    DYNAMODB_PORT: string | undefined;
    AWS_ACCESS_KEY_ID: string | undefined;
    AWS_SECRET_ACCESS_KEY: string | undefined;
    AWS_REGION: string | undefined;
    FIREBASE_PROJECT_ID: string | undefined;
    FIREBASE_PRIVATE_KEY: string | undefined;
    FIREBASE_CLIENT_EMAIL: string | undefined;
}

const getEnvVars = (): ENV => {
    if (process.env.NODE_ENV === "test") {
        return {
            NODE_ENV: "test"
        } as ENV;
    }

    return {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        CLIENT_PORT: process.env.CLIENT_PORT,
        DYNAMODB_URI: process.env.DYNAMODB_URI,
        DYNAMODB_PORT: process.env.DYNAMODB_PORT,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_REGION,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL
    };
};

const getSanitzedEnvVars = (config: ENV): Config => {
    for (const [key, value] of Object.entries(config)) {
        if (value === undefined) {
            throw new Error(`Missing key ${key} in config.env`);
        }
    }
    return config as Config;
};

const envVars = getEnvVars();

const sanitizedEnvVars = getSanitzedEnvVars(envVars);

export default sanitizedEnvVars;
