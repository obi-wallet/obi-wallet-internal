"use client";

import { useSession } from "@/analytics/session/use-session";
import { Button } from "@/components";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AnalyticsLogin() {
  const { session, isLoading, login } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && session.isLoggedIn) {
      router.replace("/analytics/reports/number-of-onboardings-per-dapp");
    }
  }, [isLoading, session.isLoggedIn, router]);

  if (isLoading) {
    return <p className="text-lg">Loading...</p>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={async function (event) {
          event.preventDefault();
          setError(null);
          const formData = new FormData(event.currentTarget);
          const password = formData.get("password");
          if (typeof password !== "string") {
            return;
          }
          const session = await login(password);
          if (session.isLoggedIn) {
            router.replace("/analytics/reports/number-of-onboardings-per-dapp");
          } else {
            setError("Invalid password");
          }
        }}
        method="POST"
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        <Button type="submit">Log In</Button>
      </form>
    </div>
  );
}
