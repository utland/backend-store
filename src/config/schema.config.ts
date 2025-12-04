import Joi from "joi";

export const appSchema = Joi.object({
    DATABASE_TYPE: Joi.string().required(),
    DATABASE_HOST: Joi.string().default("localhost"),
    DATABASE_PORT: Joi.number().default(5432),
    DATABASE_USER: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_DB: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().required(),
});
