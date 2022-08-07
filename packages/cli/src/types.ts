export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "TRACE";

export interface GenerateOptions {
  url: string;
  file: string;
  method: HttpMethod;
  typeName?: string;
  body?: string;
}
