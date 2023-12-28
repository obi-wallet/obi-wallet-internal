import { cn } from "@/lib/utils";
import { Text } from "..";

export type IColumn = {
  label: string;
  value: string;
  render?: (value: any) => React.ReactNode;
  style?: string;
};

export function Table({
  columns,
  includeIndex = true,
  rows,
}: {
  columns: IColumn[];
  includeIndex?: boolean;
  rows: any;
}) {
  return (
    <table className="w-full bg-transparent">
      <thead className="">
        <tr className="h-16">
          {includeIndex && (
            <td>
              <Text className="justify-center">No</Text>
            </td>
          )}
          {columns.map((column) => (
            <th key={column.value}>
              <Text className="justify-center">{column.label}</Text>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows?.map((row: any, index: number) => (
          <tr key={`row-${index}`} className="h-16 border-b">
            {includeIndex && (
              <td>
                <Text className="justify-center">{index + 1}</Text>
              </td>
            )}

            {columns.map((column) => (
              <td key={`row-${index}-${column.value}`}>
                {column.render ? (
                  column.render(row[column.value])
                ) : (
                  <Text className={cn("justify-center", column.style)}>
                    {row[column.value]}
                  </Text>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
