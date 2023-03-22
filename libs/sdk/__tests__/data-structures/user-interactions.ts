import { isAction, isObservableProp } from "mobx";

import { ObservableUserInteractions, UserInteractions } from "../../src";
import { UserInteractions as UserInteractionsInternal } from "../../src/data-structures/user-interactions/implementation";
import {
  createUserInteractionType,
  UserInteraction,
} from "../../src/user-interactions/abstract";

const TestMessage =
  createUserInteractionType<
    UserInteraction<{ foo: "bar" }, { success: true }>
  >();
const AnotherMessage = createUserInteractionType();

function createTest<
  A extends (factory: typeof UserInteractions) => Promise<UserInteractions>
>(name: string, fn: A) {
  return describe(name, () => {
    test.each([
      {
        name: "UserInteractions",
        UserInteractions: UserInteractions,
      },
      {
        name: "ObservableUserInteractions",
        UserInteractions: ObservableUserInteractions,
        postFn: expectIsObservable,
      },
    ])(`$name`, async ({ UserInteractions, postFn }) => {
      const result = await fn(UserInteractions);
      if (typeof postFn === "function") {
        postFn(result);
      }
    });
  });
}

function expectIsObservable(userInteractions: UserInteractions) {
  expect(isObservableProp(userInteractions, "_userInteractions")).toEqual(true);
  expect(
    isAction(
      (userInteractions as UserInteractionsInternal)["addUserInteraction"]
    )
  ).toEqual(true);
  expect(
    isAction(
      (userInteractions as UserInteractionsInternal)[
        "removeUserInteractionWithId"
      ]
    )
  ).toEqual(true);
}

createTest("approve", async (UserInteractions) => {
  const userInteractions = UserInteractions.create();
  expect(
    userInteractions.getPendingUserInteractionsOfType(TestMessage).length
  ).toEqual(0);
  expect(
    userInteractions.hasPendingUserInteractionsOfType(TestMessage)
  ).toEqual(false);

  const pendingMessage = TestMessage.start({ foo: "bar" });

  expect(
    userInteractions.getPendingUserInteractionsOfType(TestMessage).length
  ).toEqual(1);
  expect(
    userInteractions.hasPendingUserInteractionsOfType(TestMessage)
  ).toEqual(true);
  expect(
    userInteractions.hasPendingUserInteractionsOfType(AnotherMessage)
  ).toEqual(false);

  const [message] =
    userInteractions.getPendingUserInteractionsOfType(TestMessage);
  expect(TestMessage.is(message)).toEqual(true);
  expect(AnotherMessage.is(message)).toEqual(false);

  message.resolve({ success: true });
  await expect(pendingMessage).resolves.toEqual({ success: true });

  expect(
    userInteractions.getPendingUserInteractionsOfType(TestMessage).length
  ).toEqual(0);
  expect(
    userInteractions.hasPendingUserInteractionsOfType(TestMessage)
  ).toEqual(false);
  return userInteractions;
});

createTest("reject", async (UserInteractions) => {
  const userInteractions = UserInteractions.create();
  const pendingMessage = TestMessage.start({ foo: "bar" });
  const [message] =
    userInteractions.getPendingUserInteractionsOfType(TestMessage);

  const error = new Error("reject");
  message.reject(error);
  await expect(pendingMessage).rejects.toEqual(error);

  expect(
    userInteractions.getPendingUserInteractionsOfType(TestMessage).length
  ).toEqual(0);
  expect(
    userInteractions.hasPendingUserInteractionsOfType(TestMessage)
  ).toEqual(false);
  return userInteractions;
});
