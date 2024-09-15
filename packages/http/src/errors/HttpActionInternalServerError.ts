import { InternalServerError } from './HttpError.js'

export class NotHttpActionMethodInternalServerError extends InternalServerError {}

export class NotHttpActionPathInternalServerError extends InternalServerError {}

export class NotHttpActionInternalServerError extends InternalServerError {}
