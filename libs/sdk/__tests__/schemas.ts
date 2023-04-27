import { token } from "../src";

describe("token", () => {
  const schema = token({
    chainId: "phoenix-1",
    id: "uluna",
  });

  test("Zero", () => {
    expect(schema.parse("0")).toEqual({ id: "uluna", amount: "0" });
  });

  test("Decimal separators", () => {
    expect(schema.parse("1.0")).toEqual({ id: "uluna", amount: "1000000" });
    expect(schema.parse("1,0")).toEqual({ id: "uluna", amount: "1000000" });
  });

  test("Handle whole precision", () => {
    expect(schema.parse("1.000001")).toEqual({
      id: "uluna",
      amount: "1000001",
    });
  });

  test("Fail on precision overflow", () => {
    expect(() => {
      schema.parse("1.0000001");
    }).toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          "code": "custom",
          "message": "Precision overflow",
          "path": []
        }
      ]"
    `);
  });

  test("Invalid input", () => {
    expect(() => {
      schema.parse("1.0000001");
    }).toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          "code": "custom",
          "message": "Precision overflow",
          "path": []
        }
      ]"
    `);
  });
});
