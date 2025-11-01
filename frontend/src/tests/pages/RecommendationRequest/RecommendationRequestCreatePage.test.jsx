import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import RecommendationRequestCreatePage from "main/pages/RecommendationRequest/RecommendationRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

// ---- mocks ----
const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

// ---- tests ----
describe("RecommendationRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders form fields", async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("RecommendationRequestForm-requesterEmail")).toBeInTheDocument();
    });

    expect(screen.getByTestId("RecommendationRequestForm-professorEmail")).toBeInTheDocument();
    expect(screen.getByTestId("RecommendationRequestForm-explanation")).toBeInTheDocument();
    expect(screen.getByTestId("RecommendationRequestForm-dateRequested")).toBeInTheDocument();
    expect(screen.getByTestId("RecommendationRequestForm-dateNeeded")).toBeInTheDocument();
    expect(screen.getByTestId("RecommendationRequestForm-done")).toBeInTheDocument();
    expect(screen.getByTestId("RecommendationRequestForm-submit")).toBeInTheDocument();
  });

  test("submits and calls POST /api/recommendationrequests/post with correct params", async () => {
    const queryClient = new QueryClient();

    const created = {
      id: 17,
      requesterEmail: "student@ucsb.edu",
      professorEmail: "prof@ucsb.edu",
      explanation: "Grad school application",
      dateRequested: "2025-10-31T18:00",
      dateNeeded: "2025-11-15T12:00",
      done: true
    };

 
    axiosMock.onPost("/api/recommendationrequests/post").reply(202, created);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Fill the form
    const requesterEmail = await screen.findByTestId("RecommendationRequestForm-requesterEmail");
    const professorEmail = screen.getByTestId("RecommendationRequestForm-professorEmail");
    const explanation   = screen.getByTestId("RecommendationRequestForm-explanation");
    const dateRequested = screen.getByTestId("RecommendationRequestForm-dateRequested");
    const dateNeeded    = screen.getByTestId("RecommendationRequestForm-dateNeeded");
    const done          = screen.getByTestId("RecommendationRequestForm-done");
    const submit        = screen.getByTestId("RecommendationRequestForm-submit");

    fireEvent.change(requesterEmail, { target: { value: "student@ucsb.edu" } });
    fireEvent.change(professorEmail, { target: { value: "prof@ucsb.edu" } });
    fireEvent.change(explanation, { target: { value: "Grad school application" } });
    fireEvent.change(dateRequested, { target: { value: "2025-10-31T18:00" } });
    fireEvent.change(dateNeeded, { target: { value: "2025-11-15T12:00" } });
    
    fireEvent.click(done);

    fireEvent.click(submit);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    // Params sent to backend must match entity field names
    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "student@ucsb.edu",
      professorEmail: "prof@ucsb.edu",
      explanation: "Grad school application",
      dateRequested: "2025-10-31T18:00",
      dateNeeded: "2025-11-15T12:00",
      done: true,
    });

    // Toast + navigate
    expect(mockToast).toBeCalledWith("New recommendation request created - id: 17");
    expect(mockNavigate).toBeCalledWith({ to: "/recommendationrequests" });
  });
});
