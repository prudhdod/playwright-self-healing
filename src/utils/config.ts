import dotenv from 'dotenv';

dotenv.config();

export const config = {
  baseURL: process.env.BASE_URL || 'https://demo.applitools.com/app',
  enableSelfHealing: (process.env.ENABLE_SELF_HEALING || 'true') === 'true',
  aiTimeout: Number(process.env.AI_TIMEOUT || 10000),
};
