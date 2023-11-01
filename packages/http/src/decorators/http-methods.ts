import { factoryRouteMethodDecorator } from '../tools/factoryRouteMethodDecorator.js';

export const Get = factoryRouteMethodDecorator('get');
export const GET = Get;

export const Post = factoryRouteMethodDecorator('post');
export const POST = Post;

export const Patch = factoryRouteMethodDecorator('patch');
export const PATCH = Patch;

export const Put = factoryRouteMethodDecorator('put');
export const PUT = Put;

export const Delete = factoryRouteMethodDecorator('delete');
export const DELETE = Delete;
