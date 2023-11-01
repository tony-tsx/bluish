import { File, FileInput } from './File.js';

export interface DiskStorageFileInput extends FileInput {
  filepath: string;
}

export class DiskStorageFile extends File {
  public readonly filepath: string;

  public constructor(input: DiskStorageFileInput) {
    super(input);

    this.filepath = input.filepath;
  }
}
