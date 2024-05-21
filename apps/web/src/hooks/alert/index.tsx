interface CustomAlertProps {
  message: string;
  onClose: () => void;
}

export function CustomAlert({ message, onClose }: CustomAlertProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg bg-white p-6 text-center shadow-lg">
        <p className="mb-4">{message}</p>
        <button
          onClick={onClose}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
        >
          Acept
        </button>
      </div>
    </div>
  );
}
