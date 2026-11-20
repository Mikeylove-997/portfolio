"use client";

export default function ConfirmDeleteButton({
  confirmMessage,
  onConfirmed,
}: {
  confirmMessage: string;
  onConfirmed: () => void;
}) {
  return (
    <button
      type="button"
      className="btn danger"
      onClick={() => {
        if (window.confirm(confirmMessage)) {
          onConfirmed();
        }
      }}
    >
      Delete
    </button>
  );
}
