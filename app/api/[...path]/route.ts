import { env } from 'cloudflare:workers';
import { handleAPI } from '@/server/api.mjs';
export const GET = (request: Request) => handleAPI(request, env);
export const POST = GET;
export const PUT = GET;
