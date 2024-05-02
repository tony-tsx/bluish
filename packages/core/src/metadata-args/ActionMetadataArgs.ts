export type ActionMetadataArgType = keyof Bluish.ActionMetadataArgMapByType;

export interface BaseActionMetadataArgs {
  target: Function | object;
  propertyKey: string | symbol;
  name?: string;
}

export type ActionMetadataArgs<TType extends ActionMetadataArgType = ActionMetadataArgType> = {
  type: TType;
} & Bluish.ActionMetadataArgs &
  BaseActionMetadataArgs &
  (Bluish.ActionMetadataArgMapByType[TType] extends never ? {} : Bluish.ActionMetadataArgMapByType[TType]);

declare global {
  namespace Bluish {
    interface ActionMetadataArgs {}

    interface ActionMetadataArgMapByType {}
  }
}
