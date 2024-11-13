"use client";

export function ScrollDownArrows() {
  return (
    <div className="absolute inset-x-0 bottom-[10%] flex justify-center">
      <button
        onClick={() => {
          document
            .getElementById("next-section")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
        aria-label="Scroll down"
        className="focus:outline-none"
      >
        <div className="flex flex-col items-center space-y-1">
          <svg
            className="h-9 w-9 animate-bounce text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <svg
            className="h-9 w-9 animate-bounce text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>
    </div>
  );
}
