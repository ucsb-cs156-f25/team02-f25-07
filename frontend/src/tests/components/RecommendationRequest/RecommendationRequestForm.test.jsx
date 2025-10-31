import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("RecommendationRequestForm tests", () => {

  test("renders correctly", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>
    );
    await screen.findByText(/Your Email/);
    await screen.findByText(/Create/);
    expect(screen.getByText(/Your Email/)).toBeInTheDocument();
  });

  test("renders correctly when initialContents is passed", async () => {
    const initialContents = {
      id: 5,
      requesterEmail: "student@ucsb.edu",
      professorEmail: "prof@ucsb.edu",
      explanation: "Need recommendation for grad school",
      dateRequested: "2024-01-01T10:00",
      dateNeeded: "2024-02-01T10:00",
      done: true
    };

    render(
      <Router>
        <RecommendationRequestForm initialContents={initialContents} />
      </Router>
    );

    await screen.findByTestId("RecommendationRequestForm-id");
    expect(screen.getByTestId("RecommendationRequestForm-id")).toHaveValue("5");
  });

  test("shows validation errors on bad input", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>
    );

    const submitButton = screen.getByTestId("RecommendationRequestForm-submit");
    fireEvent.click(submitButton);

    await screen.findByText(/Requester email is required/);
    expect(screen.getByText(/Requester email is required/)).toBeInTheDocument();
    expect(screen.getByText(/Professor email is required/)).toBeInTheDocument();
    expect(screen.getByText(/Please provide an explanation/)).toBeInTheDocument();
  });

  test("calls submitAction on good input", async () => {
    const mockSubmit = vi.fn();

    render(
      <Router>
        <RecommendationRequestForm submitAction={mockSubmit} />
      </Router>
    );

    fireEvent.change(screen.getByTestId("RecommendationRequestForm-requesterEmail"), {
      target: { value: "student@ucsb.edu" }
    });
    fireEvent.change(screen.getByTestId("RecommendationRequestForm-professorEmail"), {
      target: { value: "prof@ucsb.edu" }
    });
    fireEvent.change(screen.getByTestId("RecommendationRequestForm-explanation"), {
      target: { value: "Grad school rec please" }
    });
    fireEvent.change(screen.getByTestId("RecommendationRequestForm-dateRequested"), {
      target: { value: "2024-01-01T10:00" }
    });
    fireEvent.change(screen.getByTestId("RecommendationRequestForm-dateNeeded"), {
      target: { value: "2024-02-01T10:00" }
    });

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

    await waitFor(() => expect(mockSubmit).toHaveBeenCalled());
  });

  test("Cancel calls navigate(-1)", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>
    );

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-cancel"));

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

});
