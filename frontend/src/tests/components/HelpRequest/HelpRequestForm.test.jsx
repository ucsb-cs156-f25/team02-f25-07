import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { HelpRequestFixtures } from "fixtures/HelpRequestFixtures";
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

describe("HelpRequestForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );
    await screen.findByText(/Requester Email/);
    await screen.findByText(/Create/);
    expect(screen.getByText(/Requester Email/)).toBeInTheDocument();
    expect(screen.getByText(/Team Id/)).toBeInTheDocument();
    expect(screen.getByText(/Table or Breakout Room/)).toBeInTheDocument();
    expect(screen.getByText(/Request Time/)).toBeInTheDocument();
    expect(screen.getByText(/Explanation/)).toBeInTheDocument();
  });

  test("renders correctly when passing in a HelpRequest", async () => {
    render(
      <Router>
        <HelpRequestForm initialContents={HelpRequestFixtures.oneRequest} />
      </Router>,
    );
    await screen.findByTestId("HelpRequestForm-id");
    //expect(screen.getByText(/Id/)).toBeInTheDocument();
    expect(screen.getByTestId("HelpRequestForm-id")).toBeInTheDocument();
  });

  test("Correct Error messages on bad input", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );
    await screen.findByTestId("HelpRequestForm-requesterEmail");
    const requesterEmailField = screen.getByTestId(
      "HelpRequestForm-requesterEmail",
    );
    const requestTimeField = screen.getByTestId("HelpRequestForm-requestTime");
    const submitButton = screen.getByTestId("HelpRequestForm-submit");

    fireEvent.change(requesterEmailField, { target: { value: "bad-email" } });
    fireEvent.change(requestTimeField, { target: { value: "bad-input" } });
    fireEvent.click(submitButton);

    await screen.findByText(/Requester email must be a valid email address./);
    expect(
      screen.getByText(/Requester email must be a valid email address./),
    ).toBeInTheDocument();
  });

  test("Correct Error messages on missing input", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );
    await screen.findByTestId("HelpRequestForm-submit");
    const submitButton = screen.getByTestId("HelpRequestForm-submit");

    fireEvent.click(submitButton);

    await screen.findByText(/Requester email is required./);
    expect(
      screen.getByText(/Requester email is required./),
    ).toBeInTheDocument();
    expect(screen.getByText(/Team id is required./)).toBeInTheDocument();
    expect(
      screen.getByText(/Table or breakout room is required./),
    ).toBeInTheDocument();
    expect(screen.getByText(/Request time is required./)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required./)).toBeInTheDocument();
  });

  test("No Error messages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <HelpRequestForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("HelpRequestForm-requesterEmail");

    const requesterEmailField = screen.getByTestId(
      "HelpRequestForm-requesterEmail",
    );
    const teamIdField = screen.getByTestId("HelpRequestForm-teamId");
    const tableOrBreakoutRoomField = screen.getByTestId(
      "HelpRequestForm-tableOrBreakoutRoom",
    );
    const requestTimeField = screen.getByTestId("HelpRequestForm-requestTime");
    const explanationField = screen.getByTestId("HelpRequestForm-explanation");
    const submitButton = screen.getByTestId("HelpRequestForm-submit");

    fireEvent.change(requesterEmailField, {
      target: { value: "student@ucsb.edu" },
    });
    fireEvent.change(teamIdField, { target: { value: "f25-07" } });
    fireEvent.change(tableOrBreakoutRoomField, {
      target: { value: "Table 7" },
    });
    fireEvent.change(requestTimeField, {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.change(explanationField, {
      target: { value: "Need help with merge conflicts" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(
      screen.queryByText(/Requester email must be a valid email address./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Request time is required./),
    ).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );
    await screen.findByTestId("HelpRequestForm-cancel");
    const cancelButton = screen.getByTestId("HelpRequestForm-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("solved checkbox works correctly", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );
    await screen.findByTestId("HelpRequestForm-solved");
    const solvedCheckbox = screen.getByTestId("HelpRequestForm-solved");

    expect(solvedCheckbox).not.toBeChecked();
    fireEvent.click(solvedCheckbox);
    expect(solvedCheckbox).toBeChecked();
  });
});
