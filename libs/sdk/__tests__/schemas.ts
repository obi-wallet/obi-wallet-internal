import { token, tokenGivenBalances } from "../src";

describe("token", () => {
  const schema = token("secret-4");

  test("Fail on non-positive input", () => {
    expect(() => {
      schema.parse({ id: "uscrt", amount: "0" });
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
    expect(schema.parse({ id: "uscrt", amount: "1.0" })).toEqual({
      id: "uscrt",
      rawAmount: "1000000",
    });
    expect(schema.parse({ id: "uscrt", amount: "1,0" })).toEqual({
      id: "uscrt",
      rawAmount: "1000000",
    });
  });

  test("Handle whole precision", () => {
    expect(schema.parse({ id: "uscrt", amount: "1.000001" })).toEqual({
      id: "uscrt",
      rawAmount: "1000001",
    });
  });

  test("Fail on precision overflow", () => {
    expect(() => {
      schema.parse({ id: "uscrt", amount: "1.0000001" });
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
      schema.parse({ id: "uscrt", amount: "1.0000001" });
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
    chainId: "secret-4",
    balances: [
      {
        id: "uscrt",
        rawAmount: "1",
      },
    ],
  });

  test("Sufficient balance", () => {
    expect(schema.parse({ id: "uscrt", amount: "0.000001" })).toEqual({
      id: "uscrt",
      rawAmount: "1",
    });
  });

  test("Insufficient balance", () => {
    expect(() => {
      schema.parse({ id: "uscrt", amount: "0.000002" });
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
      schema.parse({ id: "uscrt", amount: "0.000002" });
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
