import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";

interface ModalProps {
  /** id of the heading inside the dialog that names it. */
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A dialog over the page. Focus moves into it on open, stays inside while it
 * is open, and returns to where it was on close. Escape or a click on the
 * backdrop closes it.
 */
export default function Modal({ labelledBy, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const active = document.activeElement;
    // Remember where focus came from, unless it is already inside the dialog.
    if (active instanceof HTMLElement && !dialog?.contains(active)) {
      returnFocusTo.current = active;
    }

    document.body.classList.add("modal-open");
    dialog?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    return () => {
      document.body.classList.remove("modal-open");
      returnFocusTo.current?.focus();
    };
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        ref={dialogRef}
      >
        {children}
      </div>
    </div>
  );
}
