export function set(body: Record<string, unknown>, name: string, value: unknown) {
  if (name in body)
    if (Array.isArray(body[name])) (body[name] as unknown[]).push(value);
    else body[name] = [body[name], value];
  else body[name] = value;
}
