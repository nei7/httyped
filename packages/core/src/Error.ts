export default class ParserError extends Error {
  constructor(
    message: string,
    name: string,
    public propertyName: string,
    public depth: number
  ) {
    super();

    this.message = message;
    this.name = name;
  }
}
