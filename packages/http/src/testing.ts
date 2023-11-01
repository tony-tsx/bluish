import { Request } from './models/Request.js';

interface TestingRequestInput {
  url: string;
  method: string;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  body?: any;
}

export class TestingRequest extends Request {
  constructor(input: TestingRequestInput) {
    super();

    this.url = input.url;

    this.headers = input.headers ?? {};

    this.body = input.body;

    if (!this.headers.has('Content-Type')) {
      if (typeof input.body === 'object') this.headers.set('Content-Type', 'application/json');
      else if (typeof input.body === 'string') this.headers.set('Content-Type', 'text/plain');
    }

    this.params = input.params ?? {};
  }
}
