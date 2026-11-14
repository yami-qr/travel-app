import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Modal from "./Modal";

afterEach(cleanup);

function renderModal(onClose = vi.fn()) {
  render(
    <Modal labelledBy="title" onClose={onClose}>
      <h2 id="title">Dialog title</h2>
      <input aria-label="First field" />
      <button type="button">Last button</button>
    </Modal>,
  );
  return onClose;
}

/** A button that opens the modal, to check focus returns to it on close. */
function Opener() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      {open && (
        <Modal labelledBy="title" onClose={() => setOpen(false)}>
          <h2 id="title">Dialog title</h2>
          <button type="button">Inside</button>
        </Modal>
      )}
    </>
  );
}

describe("Modal", () => {
  it("is a dialog named by its heading", () => {
    renderModal();
    expect(screen.getByRole("dialog", { name: "Dialog title" })).toBeTruthy();
  });

  it("moves focus to the first field when it opens", () => {
    renderModal();
    expect(document.activeElement).toBe(screen.getByLabelText("First field"));
  });

  it("closes on Escape", () => {
    const onClose = renderModal();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when the backdrop is clicked, but not when the dialog is", () => {
    const onClose = renderModal();

    fireEvent.mouseDown(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(screen.getByRole("dialog").parentElement!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("keeps Tab inside the dialog", () => {
    renderModal();
    const first = screen.getByLabelText("First field");
    const last = screen.getByRole("button", { name: "Last button" });

    last.focus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("returns focus to the opener when it closes", () => {
    render(<Opener />);
    const opener = screen.getByRole("button", { name: "Open" });

    opener.focus();
    fireEvent.click(opener);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Inside" }));

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(document.activeElement).toBe(opener);
  });

  it("locks page scrolling while open and unlocks it on close", () => {
    const { unmount } = render(
      <Modal labelledBy="title" onClose={() => {}}>
        <h2 id="title">Dialog title</h2>
      </Modal>,
    );
    expect(document.body.classList.contains("modal-open")).toBe(true);

    unmount();
    expect(document.body.classList.contains("modal-open")).toBe(false);
  });
});
