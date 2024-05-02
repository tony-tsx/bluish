import { Readable } from 'stream';
import fs from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';

import busboy, { FileInfo } from 'busboy';
import { ActionFinallyEvent, ActionInitializeEvent, Middleware } from '@bluish/core';
import { is } from 'type-is';
import qs from 'qs';
import { Request } from '@bluish/http';

import { DiskStorageFile, DiskStorageFileInput } from './DiskStorageFile.js';
import { set } from './set.js';

export interface DiskStorageMiddlewareOptions<TFile extends DiskStorageFile = DiskStorageFile> {
  destination?: string | ((name: string, info: FileInfo) => string | Promise<string>);
  filename?: (name: string, info: FileInfo) => string | Promise<string>;
  toFile?: (input: DiskStorageFileInput) => TFile;
  toUnlink?: boolean | ((file: TFile) => boolean | Promise<boolean>);
}

export class DiskStorageMiddleware<TFile extends DiskStorageFile = DiskStorageFile> extends Middleware {
  public readonly destination: string | ((name: string, info: FileInfo) => string | Promise<string>);

  public readonly filename: (name: string, info: FileInfo) => string | Promise<string>;

  public readonly toFile: (input: DiskStorageFileInput) => DiskStorageFile;

  public readonly toUnlink: (file: TFile) => boolean | Promise<boolean>;

  constructor({
    destination = './uploads',
    filename = (name, info) => `${randomUUID()}-${info.filename}`,
    toFile = input => new DiskStorageFile(input) as TFile,
    toUnlink,
  }: DiskStorageMiddlewareOptions<TFile> = {}) {
    super();

    this.destination = destination;

    this.filename = filename;

    this.toFile = toFile;

    if (typeof toUnlink === 'function') this.toUnlink = toUnlink;
    else if (toUnlink === true) this.toUnlink = () => true;
    else this.toUnlink = () => false;
  }

  public getDestination(name: string, info: FileInfo): string | Promise<string> {
    if (typeof this.destination === 'function') return this.destination(name, info);

    return this.destination;
  }

  public async getFilepath(name: string, info: FileInfo): Promise<string> {
    const destination = await this.getDestination(name, info);

    const filename = await this.filename(name, info);

    return path.join(destination, filename);
  }

  public onInitialize(event: ActionInitializeEvent): void | Promise<void> {
    if (!(event.context instanceof Request)) return;

    const request = event.context;

    const contentType = request.headers.get('content-type');

    if (!contentType) return;

    if (!is(contentType, 'multipart/form-data')) return;

    if (typeof request.body !== 'object') return;

    if (!(request.body instanceof Readable)) return;

    const readable = request.body;

    const body: Record<string, unknown> = {};

    const bb = busboy({ headers: request.headers.get() });

    request.files ??= [];

    bb.on('field', (name, value) => set(body, name, value));

    bb.on('file', async (name, readable, info) => {
      const filepath = await this.getFilepath(name, info);

      const { dir } = path.parse(filepath);

      const exists = await fs.promises.stat(dir).then(
        () => true,
        () => false,
      );

      if (!exists) await fs.promises.mkdir(dir, { recursive: true });

      const writeStream = fs.createWriteStream(filepath);

      readable.pipe(writeStream);

      const input = {
        filename: info.filename,
        mimetype: info.mimeType,
        filepath: filepath,
        getReadable: () => fs.createReadStream(filepath),
      };

      const file = this.toFile(input);

      request.files.push(file);

      set(body, name, file);
    });

    const promise = new Promise<void>((resolve, reject) => {
      bb.on('error', reject);
      bb.on('finish', () => {
        request.body = qs.parse(request.body as Record<string, string>);
        resolve();
      });
    });

    request.body = body;

    readable.pipe(bb);

    return promise;
  }

  private async _clear(request: Request) {
    if (!Array.isArray(request.files)) return;

    const files: TFile[] = request.files;

    await Promise.all(
      files.map(async file => {
        if (!(await this.toUnlink(file))) return;

        await fs.promises.unlink(file.filepath);
      }),
    );
  }

  public async onFinally(event: ActionFinallyEvent, next: () => void): Promise<void> {
    next();

    if (event.context instanceof Request) await this._clear(event.context);
  }
}
