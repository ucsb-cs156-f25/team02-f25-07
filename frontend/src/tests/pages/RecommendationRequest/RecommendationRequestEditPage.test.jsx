import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RecommendationRequestEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import mockConsole from "tests/testutils/mockConsole";
import { beforeEach, afterEach } from "vitest";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
<<<<<<< HEAD

  const queryClient = new QueryClient();
  test("Renders expected content", async () => {
    setupUserOnly();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestEditPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText(
      "Edit page for Recommendation Request (placeholder)",
    );
    expect(
      screen.getByText("Edit page for Recommendation Request (placeholder)"),
    ).toBeInTheDocument();
  });
=======
>>>>>>> 369b98156adb6c3c838aba73c73525f8876c19cf
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: 1,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("RecommendationRequestEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/recommendationrequests", { params: { id: 1 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText(/Welcome/);
      await screen.findByText("Edit Recommendation Request");
      expect(
        screen.queryByTestId("RecommendationRequestForm-requesterEmail"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/recommendationrequests", { params: { id: 1 } }).reply(200, {
        id: 1,
        requesterEmail: "aaa@ucsb.edu",
        professorEmail: "profA@ucsb.edu",
        explanation: "Grad school recommendation",
        dateRequested: "2025-10-01T09:00:00",
        dateNeeded: "2025-10-15T23:59:00",
        done: false,
      });
      axiosMock.onPut("/api/recommendationrequests").reply(200, {
        id: 1,
        requesterEmail: "updated@ucsb.edu",
        professorEmail: "profB@ucsb.edu",
        explanation: "Updated explanation",
        dateRequested: "2025-11-01T10:00:00",
        dateNeeded: "2025-11-20T23:59:00",
        done: true,
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders without crashing", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText(/Welcome/);
      await screen.findByTestId("RecommendationRequestForm-requesterEmail");
      expect(
        screen.getByTestId("RecommendationRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });

    

    test("Is populated with the data provided", async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RecommendationRequestEditPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );

  await screen.findByTestId("RecommendationRequestForm-requesterEmail");

  const idField = screen.getByTestId("RecommendationRequestForm-id");
  const requesterEmailField = screen.getByTestId("RecommendationRequestForm-requesterEmail");
  const professorEmailField = screen.getByTestId("RecommendationRequestForm-professorEmail");
  const explanationField = screen.getByTestId("RecommendationRequestForm-explanation");
  const dateRequestedField = screen.getByTestId("RecommendationRequestForm-dateRequested");
  const dateNeededField = screen.getByTestId("RecommendationRequestForm-dateNeeded");
  const doneField = screen.getByTestId("RecommendationRequestForm-done"); 
  const submitButton = screen.getByTestId("RecommendationRequestForm-submit");

  expect(idField).toHaveValue("1");
  expect(requesterEmailField).toHaveValue("aaa@ucsb.edu");
  expect(professorEmailField).toHaveValue("profA@ucsb.edu");
  expect(explanationField).toHaveValue("Grad school recommendation");
  expect(dateRequestedField).toHaveValue("2025-10-01T09:00"); 
  expect(dateNeededField).toHaveValue("2025-10-15T23:59"); 
  expect(doneField).not.toBeChecked();
  expect(submitButton).toBeInTheDocument();
});

test("Changes when you click Update", async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RecommendationRequestEditPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );

  await screen.findByTestId("RecommendationRequestForm-requesterEmail");

  const idField = screen.getByTestId("RecommendationRequestForm-id");
  const requesterEmailField = screen.getByTestId("RecommendationRequestForm-requesterEmail");
  const professorEmailField = screen.getByTestId("RecommendationRequestForm-professorEmail");
  const explanationField = screen.getByTestId("RecommendationRequestForm-explanation");
  const dateRequestedField = screen.getByTestId("RecommendationRequestForm-dateRequested");
  const dateNeededField = screen.getByTestId("RecommendationRequestForm-dateNeeded");
  const doneField = screen.getByTestId("RecommendationRequestForm-done");
  const submitButton = screen.getByTestId("RecommendationRequestForm-submit");

  expect(idField).toHaveValue("1");
  expect(requesterEmailField).toHaveValue("aaa@ucsb.edu");
  expect(professorEmailField).toHaveValue("profA@ucsb.edu");
  expect(explanationField).toHaveValue("Grad school recommendation");
  expect(dateRequestedField).toHaveValue("2025-10-01T09:00"); 
  expect(dateNeededField).toHaveValue("2025-10-15T23:59"); 
  expect(doneField).not.toBeChecked();

  expect(submitButton).toBeInTheDocument();

  fireEvent.change(requesterEmailField, { target: { value: "updated@ucsb.edu" } });
  fireEvent.change(professorEmailField, { target: { value: "profB@ucsb.edu" } });
  fireEvent.change(explanationField, { target: { value: "Updated explanation" } });
  fireEvent.change(dateRequestedField, { target: { value: "2025-11-01T10:00" } }); 
  fireEvent.change(dateNeededField, { target: { value: "2025-11-20T23:59" } }); 
  fireEvent.click(doneField);

  fireEvent.click(submitButton);

  await waitFor(() => expect(mockToast).toBeCalled());
  expect(mockToast).toBeCalledWith(
    "RecommendationRequest Updated - id: 1",
  );
  expect(mockNavigate).toBeCalledWith({ to: "/recommendationrequests" });

  expect(axiosMock.history.put.length).toBe(1); 
  expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
  expect(axiosMock.history.put[0].data).toBe(
    JSON.stringify({
      requesterEmail: "updated@ucsb.edu",
      professorEmail: "profB@ucsb.edu",
      explanation: "Updated explanation",
      dateRequested: "2025-11-01T10:00", 
      dateNeeded: "2025-11-20T23:59", 
      done: true,
    }),
  ); 
});
  });
});