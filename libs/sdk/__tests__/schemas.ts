import { token, tokenGivenBalances } from "../src";

describe("token", () => {
  const schema = token("phoenix-1");

  test("Fail on non-positive input", () => {
    expect(() => {
      schema.parse({ id: "uluna", amount: "0" });
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
    expect(schema.parse({ id: "uluna", amount: "1.0" })).toEqual({
      id: "uluna",
      rawAmount: "1000000",
    });
    expect(schema.parse({ id: "uluna", amount: "1,0" })).toEqual({
      id: "uluna",
      rawAmount: "1000000",
    });
  });

  test("Handle whole precision", () => {
    expect(schema.parse({ id: "uluna", amount: "1.000001" })).toEqual({
      id: "uluna",
      rawAmount: "1000001",
    });
  });

  test("Fail on precision overflow", () => {
    expect(() => {
      schema.parse({ id: "uluna", amount: "1.0000001" });
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
      schema.parse({ id: "uluna", amount: "1.0000001" });
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

describe("tokenGivenBalances", () => {
  const schema = tokenGivenBalances({
    chainId: "phoenix-1",
    balances: [
      {
        id: "uluna",
        rawAmount: "1",
      },
    ],
  });

  test("Sufficient balance", () => {
    expect(schema.parse({ id: "uluna", amount: "0.000001" })).toEqual({
      id: "uluna",
      rawAmount: "1",
    });
  });

  test("Insufficient balance", () => {
    expect(() => {
      schema.parse({ id: "uluna", amount: "0.000002" });
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

  test("Insufficient balance", () => {
    expect(() => {
      schema.parse({ id: "ujuno", amount: "0.000002" });
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

  test("No token selected", () => {
    expect(() => {
      schema.parse({ id: "", amount: "0.00002" });
    }).toThrowErrorMatchingInlineSnapshot(`
      "[
        {
          "code": "custom",
          "message": "No token selected",
          "path": []
        }
      ]"
    `);
  });
});
