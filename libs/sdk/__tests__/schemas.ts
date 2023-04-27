import { token, tokenGivenBalance } from "../src";

describe("token", () => {
  const schema = token({
    chainId: "phoenix-1",
    id: "uluna",
  });

  test("Fail on non-positive input", () => {
    expect(() => {
      schema.parse("0");
    }).toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          "code": "custom",
          "message": "Amount must be greater than 0",
          "path": []
        }
      ]"
    `);
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

describe("tokenGivenBalance", () => {
  const schema = tokenGivenBalance({
    chainId: "phoenix-1",
    balance: {
      id: "uluna",
      amount: "1",
    },
  });

  test("Sufficient balance", () => {
    expect(schema.parse("0.000001")).toEqual({ id: "uluna", amount: "1" });
  });

  test("Insufficient balance", () => {
    expect(() => {
      schema.parse("0.000002");
    }).toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          "code": "custom",
          "message": "Insufficient balance",
          "path": []
        }
      ]"
    `);
  });
});
