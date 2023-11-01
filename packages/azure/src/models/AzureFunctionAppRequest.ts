import { Request } from '@bluish/http';
import { HttpRequest } from '@azure/functions';

import { AzureFunctionAppResponse } from './AzureFunctionAppResponse.js';

export class AzureFunctionAppRequest extends Request {
  public readonly _res = new AzureFunctionAppResponse();

  public readonly _httpRequest!: HttpRequest;
}
