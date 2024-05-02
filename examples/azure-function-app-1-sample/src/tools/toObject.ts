/* eslint-disable @typescript-eslint/no-redeclare */
import { type Issue, UnionValidationError, ValidationError } from 'ornate-guard';

export const ERRORS: PropertyKey = '_errors';

export type ToObjectOutput<TTarget, TFormat, TKey extends PropertyKey> =
  TTarget extends Array<infer T>
    ? ToObjectOutput<T, TFormat, TKey>
    : TTarget extends object
      ? { [K in TKey]?: TFormat[] } & {
          [K in keyof TTarget]?: ToObjectOutput<TTarget[K], TFormat, TKey>;
        }
      : TTarget extends unknown
        ? unknown
        : TFormat[];

function _toObject<TTarget extends object, TFormat, Tkey extends PropertyKey>(
  validationError: ValidationError<TTarget>,
  format: (issue: Issue, validationError: ValidationError) => TFormat,
  errorKey: Tkey = ERRORS as Tkey,
): ToObjectOutput<TTarget, TFormat, Tkey> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const object: any = {};

  if (validationError.issues.length) {
    object[errorKey] = [];

    for (const issue of validationError.issues) object[errorKey].push(format(issue, validationError));
  }

  if (validationError instanceof UnionValidationError) return object;

  for (const inner of validationError.inners) {
    const innerKey = inner.path.slice().pop()!;

    object[innerKey] = _toObject(inner, format, errorKey);
  }

  return object;
}

const defaultFormat = (issue: Issue) => issue.message;

export type ToObjectIssueFormat<TFormat> = (issue: Issue) => TFormat;

export function toObject<TTarget extends object, TFormat = string, TKey extends PropertyKey = typeof ERRORS>(
  validationError: ValidationError<TTarget>,
  format?: ToObjectIssueFormat<TFormat> | null | undefined,
  key: TKey = ERRORS as TKey,
) {
  return _toObject(validationError, format ?? (defaultFormat as ToObjectIssueFormat<TFormat>), key);
}
