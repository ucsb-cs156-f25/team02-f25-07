// @ts-nocheck
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { BrowserRouter as Router } from "react-router";
import { vi } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("RecommendationRequestForm tests", () => {
  test("renders correctly empty", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>
    );
    expect(await screen.findByText(/Your Email/)).toBeInTheDocument();
  });

  test("renders correctly with initialContents", async () => {
    const sample = {
      id: 1,
      requesterEmail: "me@ucsb.edu",
      professorEmail: "prof@ucsb.edu",
      explanation: "Help me!",
      dateRequested: "2025-10-01T12:00",
      dateNeeded: "2025-10-15T12:00",
      done: true,
    };

    render(
      <Router>
        <RecommendationRequestForm initialContents={sample}/>
      </Router>
    );

    expect(screen.getByTestId("RecommendationRequestForm-id")).toHaveValue("1");
  });

  test("shows validation errors on empty submit", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>
    );

    const submitButton = screen.getByTestId("RecommendationRequestForm-submit");
    fireEvent.click(submitButton);

    expect(await screen.findByText(/Requester email is required/)).toBeInTheDocument();
    expect(screen.getByText(/Professor email is required/)).toBeInTheDocument();
  });

  test("submits with valid input", async () => {
    const mockSubmit = vi.fn();

    render(
      <Router>
        <RecommendationRequestForm submitAction={mockSubmit} />
      </Router>
    );

    fireEvent.change(screen.getByTestId("RecommendationRequestForm-requesterEmail"), { target: { value: "me@ucsb.edu" }});
    fireEvent.change(screen.getByTestId("RecommendationRequestForm-professorEmail"), { target: { value: "prof@ucsb.edu" }});
    fireEvent.change(screen.getByTestId("RecommendationRequestForm-explanation"), { target: { value: "Thanks!" }});
    fireEvent.change(screen.getByTestId("RecommendationRequestForm-dateRequested"), { target: { value: "2025-10-01T12:00" }});
    fireEvent.change(screen.getByTestId("RecommendationRequestForm-dateNeeded"), { target: { value: "2025-10-15T12:00" }});

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

    await waitFor(() => expect(mockSubmit).toHaveBeenCalled());
  });

  test("cancel calls navigate(-1)", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>
    );

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-cancel"));
    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
