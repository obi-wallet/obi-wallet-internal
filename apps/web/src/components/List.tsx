export type ListProps<T> = {
  items: T[];
  name: string;
  keyProp?: keyof T;
  className?: string;
  renderItem: (item: T) => React.ReactElement;
};

export default function List<T>({
  items,
  name,
  keyProp,
  className,
  renderItem,
}: ListProps<T>) {
  return (
    <ul className={className} role="list">
      {items?.map((item: T, index: number) => (
        <li key={`${name}-list-${keyProp ? item[keyProp] : index}`}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}
