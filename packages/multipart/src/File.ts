import { Readable } from 'stream';

export interface FileInput {
  filename: string;
  mimetype: string;
  getReadable: () => Readable;
}

export class File {
  public readonly filename: string;

  public readonly mimeType: string;

  public getRedable: () => Readable;

  constructor(input: FileInput) {
    this.filename = input.filename;
    this.mimeType = input.mimetype;
    this.getRedable = input.getReadable;
  }
}
