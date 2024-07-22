export class Response {
  public status!: number

  public headers: Record<string, undefined | string | string[]> = {}

  public body!: any
}
