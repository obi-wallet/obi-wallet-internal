import { cn } from "@/lib/utils";

import { Text } from "..";

export interface IColumn<C extends string> {
  label: string;
  value: C;
  style?: string;
}

export type IRow<C extends string> = Record<C, string>;

export function Table<K extends string>({
  columns,
  includeIndex = true,
  rows,
}: {
  columns: IColumn<K>[];
  includeIndex?: boolean;
  rows: IRow<K>[];
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
        {rows.map((row, index: number) => (
          <tr key={`row-${index}`} className="h-16 border-b">
            {includeIndex && (
              <td>
                <Text className="justify-center">{index + 1}</Text>
              </td>
            )}

            {columns.map((column) => {
              const colIndex = column.value;
              return (
                <td key={`row-${index}-${column.value}`}>
                  <Text className={cn("justify-center", column.style)}>
                    {row[colIndex]}
                  </Text>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
