import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import NewTripForm from "./NewTripForm";

afterEach(cleanup);

function fillValidForm() {
  fireEvent.change(screen.getByLabelText("Trip name"), { target: { value: "Rome" } });
  fireEvent.change(screen.getByLabelText("Destination"), { target: { value: "Rome, Italy" } });
  fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "2027-05-01" } });
  fireEvent.change(screen.getByLabelText("End date"), { target: { value: "2027-05-03" } });
  fireEvent.change(screen.getByLabelText("Budget"), { target: { value: "900" } });
}

describe("NewTripForm", () => {
  it("shows an error for each empty required field and does not create a trip", () => {
    const onCreate = vi.fn();
    render(<NewTripForm onCreate={onCreate} onCancel={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Create trip" }));

    expect(screen.getByText("Give your trip a name.")).toBeTruthy();
    expect(screen.getByText("Add a destination.")).toBeTruthy();
    expect(screen.getByText("Enter a budget greater than 0.")).toBeTruthy();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("calls onCreate with a trip built from the form values", () => {
    const onCreate = vi.fn();
    render(<NewTripForm onCreate={onCreate} onCancel={() => {}} />);

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Create trip" }));

    expect(onCreate).toHaveBeenCalledTimes(1);
    const trip = onCreate.mock.calls[0][0];
    expect(trip.name).toBe("Rome");
    expect(trip.destination).toBe("Rome, Italy");
    expect(trip.budget).toBe(900);
    expect(trip.days).toHaveLength(3);
  });

  it("shows a date error when the end date is before the start date", () => {
    const onCreate = vi.fn();
    render(<NewTripForm onCreate={onCreate} onCancel={() => {}} />);

    fillValidForm();
    fireEvent.change(screen.getByLabelText("End date"), { target: { value: "2027-04-20" } });
    fireEvent.click(screen.getByRole("button", { name: "Create trip" }));

    expect(screen.getByText("The end date can't be before the start date.")).toBeTruthy();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("marks invalid fields with aria-invalid", () => {
    render(<NewTripForm onCreate={() => {}} onCancel={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Create trip" }));

    expect(screen.getByLabelText("Trip name").getAttribute("aria-invalid")).toBe("true");
  });

  it("calls onCancel when Cancel is clicked", () => {
    const onCancel = vi.fn();
    render(<NewTripForm onCreate={() => {}} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
