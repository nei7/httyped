import parse from "./Parser";

describe("parse function", () => {
  test("Nested objects", () => {
    const output = parse({
      nei: 1,
      jd: "d",
      data: {
        calories: 123,
      },

      xd: {
        calories: 123,
      },

      lol: {
        xd: 123,
      },
    });

    expect(output.replaceAll("\n", "")).toBe(
      `interface Data {   calories: number;}interface Lol {   xd: number;}interface Root {   nei: number;  jd: string;  data: Data;  xd: Data;  lol: Lol;}`
    );
  });

  test("Parsing arrays", () => {
    const output = parse({
      data: [
        { calories: 123, xd: 2 },
        { name: "user123", xd: 2 },
        { xd: 2 },
        "xd",
        12,
      ],
    });

    expect(output.replaceAll("\n", "")).toBe(
      `interface Data {   calories?: number;  xd: number;  name?: string;}interface Root {   data: (string | number | Data)[];}`
    );
  });
});
