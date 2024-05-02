export interface HttpInheritMetadataArgs {
  target: Function;
  get: () => new () => unknown;
}

declare global {
  namespace Bluish {
    interface MetadataArgsStorage {
      '@http:inherit': HttpInheritMetadataArgs[];
    }
  }
}
