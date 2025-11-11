import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import RecommendationRequestIndexPage from "main/pages/RecommendationRequest/RecommendationRequestIndexPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import mockConsole from "tests/testutils/mockConsole";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

describe("RecommendationRequestIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "RecommendationRequestTable";

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  test("Renders with Create Button for admin user", async () => {
 
    const queryClient = new QueryClient();
    setupAdminUser();
    axiosMock.onGet("/api/recommendationrequests/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

<<<<<<< HEAD
    await screen.findByText(
      "Index page for Recommendation Request (placeholder)",
    );

    expect(
      screen.getByText("Index page for Recommendation Request (placeholder)"),
    ).toBeInTheDocument();

    expect(screen.getByText("Create")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
=======
    await waitFor(() => {
      expect(screen.getByText(/Create Recommendation Request/)).toBeInTheDocument();
    });
    const button = screen.getByText(/Create Recommendation Request/);
    expect(button).toHaveAttribute("href", "/recommendationrequests/create");
    expect(button).toHaveAttribute("style", "float: right;");
>>>>>>> 369b98156adb6c3c838aba73c73525f8876c19cf
  });

  test("renders three recommendation requests correctly for regular user", async () => {
    const queryClient = new QueryClient();
    setupUserOnly();
    axiosMock
      .onGet("/api/recommendationrequests/all")
      .reply(200, recommendationRequestFixtures.threeRequests);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent("2");
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent("3");

    const createButton = screen.queryByText("Create Recommendation Request");
    expect(createButton).not.toBeInTheDocument();

    const requesterEmail = screen.getByText("aaa@ucsb.edu");
    expect(requesterEmail).toBeInTheDocument();

    // 普通用户不应该看到 Delete 和 Edit 按钮
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();
  });

  test("renders empty table when backend unavailable, user only", async () => {
    const queryClient = new QueryClient();
    setupUserOnly();

    axiosMock.onGet("/api/recommendationrequests/all").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/recommendationrequests/all",
    );
    restoreConsole();
  });

  test("what happens when you click delete, admin", async () => {
  const queryClient = new QueryClient();
  setupAdminUser();

  axiosMock
    .onGet("/api/recommendationrequests/all")
    .reply(200, recommendationRequestFixtures.threeRequests);
  axiosMock
    .onDelete("/api/recommendationrequests")
    .reply(200, "RecommendationRequest with id 1 was deleted");

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RecommendationRequestIndexPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );

  await waitFor(() => {
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-id`),
    ).toBeInTheDocument();
  });

  expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent("1");

  // 等待 Delete 按钮出现
  const deleteButton = await waitFor(() =>
    screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`),
  );
  expect(deleteButton).toBeInTheDocument();

  // 在点击删除前，为删除后的 refetch 添加新的 mock
  axiosMock
    .onGet("/api/recommendationrequests/all")
    .reply(200, [
      recommendationRequestFixtures.threeRequests[1],
      recommendationRequestFixtures.threeRequests[2],
    ]);

  fireEvent.click(deleteButton);

  await waitFor(() => {
    expect(mockToast).toBeCalledWith("RecommendationRequest with id 1 was deleted");
  });

  await waitFor(() => {
    expect(axiosMock.history.delete.length).toBe(1);
  });
  expect(axiosMock.history.delete[0].url).toBe("/api/recommendationrequests");
  expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
});
});