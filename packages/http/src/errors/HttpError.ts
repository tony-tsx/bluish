import { STATUS_CODES } from 'http'

export interface HttpErrorOptions extends ErrorOptions {
  publicMessage?: string
  properties?: Record<string, unknown>
  headers?: Record<string, undefined | string | string[]>
}

export class HttpError extends Error {
  public readonly publicMessage?: string
  public readonly properties: Record<string, unknown>
  public readonly headers: Record<string, undefined | string | string[]>

  constructor(
    public readonly status: number,
    message = STATUS_CODES[status],
    {
      publicMessage,
      properties = {},
      headers = {},
      ...options
    }: HttpErrorOptions = {},
  ) {
    super(message, options)

    this.properties = properties
    this.headers = headers
    this.publicMessage = publicMessage
  }

  public toJSON() {
    return {
      status: this.status,
      message: this.publicMessage ?? this.message,
      ...this.properties,
    }
  }
}

function factory(status: number, name: string) {
  class AnonymousHttpError extends HttpError {
    constructor(message?: string, options?: ErrorOptions) {
      super(status, message, options)
      Object.defineProperty(this, 'name', { value: name })
    }
  }

  Object.defineProperty(AnonymousHttpError, 'name', { value: name })

  return AnonymousHttpError
}

export const BadRequest = factory(400, 'BadRequest')
export const Unauthorized = factory(401, 'Unauthorized')
export const PaymentRequired = factory(402, 'PaymentRequired')
export const Forbidden = factory(403, 'Forbidden')
export const NotFound = factory(404, 'NotFound')
export const MethodNotAllowed = factory(405, 'MethodNotAllowed')
export const NotAcceptable = factory(406, 'NotAcceptable')
export const ProxyAuthenticationRequired = factory(
  407,
  'ProxyAuthenticationRequired',
)
export const RequestTimeout = factory(408, 'RequestTimeout')
export const Conflict = factory(409, 'Conflict')
export const Gone = factory(410, 'Gone')
export const LengthRequired = factory(411, 'LengthRequired')
export const PreconditionFailed = factory(412, 'PreconditionFailed')
export const PayloadTooLarge = factory(413, 'PayloadTooLarge')
export const URITooLong = factory(414, 'URITooLong')
export const UnsupportedMediaType = factory(415, 'UnsupportedMediaType')
export const RangeNotSatisfiable = factory(416, 'RangeNotSatisfiable')
export const ExpectationFailed = factory(417, 'ExpectationFailed')
export const ImATeapot = factory(418, 'ImATeapot')
export const MisdirectedRequest = factory(421, 'MisdirectedRequest')
export const UnprocessableContent = factory(422, 'UnprocessableContent')
export const Locked = factory(423, 'Locked')
export const FailedDependency = factory(424, 'FailedDependency')
export const TooEarly = factory(425, 'TooEarly')
export const UpgradeRequired = factory(426, 'UpgradeRequired')
export const PreconditionRequired = factory(428, 'PreconditionRequired')
export const TooManyRequests = factory(429, 'TooManyRequests')
export const RequestHeaderFieldsTooLarge = factory(
  431,
  'RequestHeaderFieldsTooLarge',
)
export const UnavailableForLegalReasons = factory(
  451,
  'UnavailableForLegalReasons',
)

export const InternalServerError = factory(500, 'InternalServerError')
export const NotImplemented = factory(501, 'NotImplemented')
export const BadGateway = factory(502, 'BadGateway')
export const ServiceUnavailable = factory(503, 'ServiceUnavailable')
export const GatewayTimeout = factory(504, 'GatewayTimeout')
export const HTTPVersionNotSupported = factory(505, 'HTTPVersionNotSupported')
export const VariantAlsoNegotiates = factory(506, 'VariantAlsoNegotiates')
export const InsufficientStorage = factory(507, 'InsufficientStorage')
export const LoopDetected = factory(508, 'LoopDetected')
export const NotExtended = factory(510, 'NotExtended')
export const NetworkAuthenticationRequired = factory(
  511,
  'NetworkAuthenticationRequired',
)
