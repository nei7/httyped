import jsonSerializer from "../src/jsonSerializer";

describe("test transform", () => {
  it("should return ts interface", () => {
    const result = jsonSerializer({
      gender: "male",
      name: {
        title: "Mr",
        first: "Marius",
        last: "Muller",
      },
      age: 12,
    });

    expect(result).toBeInstanceOf(String);
  });
});
