export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", loading = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6">
        <h2 className="text-base font-medium mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="h-9 px-4 text-sm rounded-md border border-gray-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            Go back
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="h-9 px-4 text-sm rounded-md text-white disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            style={{ backgroundColor: "#1B2A56" }}
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}