import { parse } from "../src/index";

it("parse", () => {
  const j = parse(
    JSON.stringify({
      a: 1,
      b: {
        c: 23,
      },
      jd: [{ xd: 12 }, { swdw: 12, xd: "jd" }],
    })
  );
  console.log(j);
});
