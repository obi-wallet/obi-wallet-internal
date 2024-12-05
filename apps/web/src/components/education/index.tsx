import { useStore } from "@obi-wallet/mobx-react";
import { serialize } from "@obi-wallet/sdk-json";

export function Education() {
  const { educationStore } = useStore();
  const topic = educationStore.currentTopic;

  if (!topic) return null;

  return (
    <div className="education-panel h-full w-full overflow-auto p-3 max-md:p-1 max-sm:p-0 space-y-2">
      <h2 className="text-lg font-medium">Education</h2>
      <div>
        Current Topic: {topic.id}
        {topic.context && (
          <pre className="mt-2 text-sm">
            {serialize(topic.context, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );

  return <div>Education (TODO)</div>;
}
