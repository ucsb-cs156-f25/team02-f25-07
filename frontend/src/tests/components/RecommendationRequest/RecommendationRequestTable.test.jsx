import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
//import axios from "axios";
//import AxiosMockAdapter from "axios-mock-adapter";

import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import * as useBackend from "main/utils/useBackend";
import { onDeleteSuccess } from "main/utils/UCSBDateUtils";

// mock useNavigate
const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const original = await vi.importActual("react-router");
  return { ...original, useNavigate: () => mockedNavigate };
});

// Mock the useBackendMutation hook
const mockMutate = vi.fn();
vi.mock("main/utils/useBackend", () => ({
  useBackendMutation: vi.fn(() => ({ mutate: mockMutate })),
}));

describe("RecommendationRequestTable tests", () => {
  const queryClient = new QueryClient();
  const testId = "RecommendationRequestTable";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders headers and rows correctly for ordinary user (no Edit/Delete)", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRequests}
            currentUser={currentUserFixtures.userOnly}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "ID",
      "Requester Email",
      "Professor Email",
      "Explanation",
      "Date Requested",
      "Date Needed",
      "Done",
    ];

    expectedHeaders.forEach((h) => {
      expect(screen.getByText(h)).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("displays actual data correctly in table cells", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRequests}
            currentUser={currentUserFixtures.userOnly}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-requesterEmail`),
    ).toHaveTextContent(
      recommendationRequestFixtures.threeRequests[0].requesterEmail,
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-professorEmail`),
    ).toHaveTextContent(
      recommendationRequestFixtures.threeRequests[0].professorEmail,
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-explanation`),
    ).toHaveTextContent(
      recommendationRequestFixtures.threeRequests[0].explanation,
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-dateRequested`),
    ).toHaveTextContent(
      recommendationRequestFixtures.threeRequests[0].dateRequested,
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-dateNeeded`),
    ).toHaveTextContent(
      recommendationRequestFixtures.threeRequests[0].dateNeeded,
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-done`),
    ).toHaveTextContent(
      String(recommendationRequestFixtures.threeRequests[0].done),
    );
  });

  test("admin sees Edit/Delete buttons", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRequests}
            currentUser={currentUserFixtures.adminUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).toBeInTheDocument();
  });

  test("Edit and Delete buttons have correct styles", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRequests}
            currentUser={currentUserFixtures.adminUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    expect(editButton).toHaveClass("btn-primary");
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Edit button navigates to correct page", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRequests}
            currentUser={currentUserFixtures.adminUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`));

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith(
        "/recommendationrequests/edit/1",
      ),
    );
  });

  test("wires delete mutation with correct transform, options and deps", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRequests}
            currentUser={currentUserFixtures.adminUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(useBackend.useBackendMutation).toHaveBeenCalled();
    const [transform, options, deps] =
      useBackend.useBackendMutation.mock.calls[0];

    expect(options).toEqual({ onSuccess: onDeleteSuccess });

    expect(deps).toEqual(["/api/recommendationrequests/all"]);

    const axiosParams = transform({ row: { original: { id: 1 } } });
    expect(axiosParams).toEqual({
      url: "/api/recommendationrequests",
      method: "DELETE",
      params: { id: 1 },
    });
  });

  test("Delete button calls mutate function", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestTable
            requests={recommendationRequestFixtures.threeRequests}
            currentUser={currentUserFixtures.adminUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    fireEvent.click(deleteButton);

    await waitFor(() => expect(mockMutate).toHaveBeenCalledTimes(1));

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        row: expect.objectContaining({
          original: expect.objectContaining({
            id: 1,
          }),
        }),
      }),
    );
  });
});
