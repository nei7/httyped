import render from "../packages/core/src/render";
import parse from "../packages/core/src/Parser";

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
  console.log(output);
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

  console.log(output);
});
