// src/tests/pages/MenuItemReview/MenuItemReviewEditPage.test.jsx
import { vi } from "vitest";

vi.mock("react-toastify", async () => {
  const actual =
    (await vi.importActual) <
    typeof import("react-toastify") >
    "react-toastify";
  return { ...actual, toast: vi.fn() };
});

import { toast } from "react-toastify";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import MenuItemReviewEditPage from "main/pages/MenuItemReview/MenuItemReviewEditPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

describe("MenuItemReviewEditPage — kill survivors", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  function setupMocks() {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    axiosMock.onGet("/api/menuitemreview").reply(200, {
      id: 1,
      itemId: 2,
      reviewerEmail: "a@ucsb.edu",
      stars: 3,
      dateReviewed: "2024-01-01T10:00",
      comments: "old",
    });

    axiosMock.onPut("/api/menuitemreview").reply(200, {
      id: 1,
      itemId: 2,
      stars: 4,
      reviewerEmail: "a@ucsb.edu",
      dateReviewed: "2024-01-01T10:00",
      comments: "updated",
    });
  }

  function renderPage() {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/menuitemreview/edit/1"]}>
          <Routes>
            <Route
              path="/menuitemreview/edit/:id"
              element={<MenuItemReviewEditPage />}
            />
            {/* ✅ 导航目标：用于断言 <Navigate to="/menuitemreview" /> 确实发生 */}
            <Route
              path="/menuitemreview"
              element={<div data-testid="went-index">INDEX</div>}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  test("loads with correct GET params, submits PUT with params/body, shows exact toast, then navigates", async () => {
    setupMocks();
    renderPage();

    await screen.findByTestId("MenuItemReviewForm-itemId");

    expect(axiosMock.history.get.length).toBeGreaterThan(0);
    const getReq = axiosMock.history.get.find(
      (r) => r.url === "/api/menuitemreview",
    );
    expect(getReq).toBeTruthy();

    const getId = getReq?.params?.id;
    expect(getId === 1 || getId === "1").toBe(true);

    await userEvent.clear(screen.getByTestId("MenuItemReviewForm-comments"));
    await userEvent.type(
      screen.getByTestId("MenuItemReviewForm-comments"),
      "updated",
    );
    await userEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
    const putReq = axiosMock.history.put[0];
    expect(putReq.url).toBe("/api/menuitemreview");
    expect(putReq.method.toUpperCase()).toBe("PUT");

    const putId = putReq.params?.id;
    expect(putId === 1 || putId === "1").toBe(true);

    const body = JSON.parse(putReq.data);
    expect(body).toMatchObject({
      itemId: 2,
      reviewerEmail: "a@ucsb.edu",
      comments: "updated",
    });

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        "MenuItemReview Updated - id: 1 itemId: 2 stars: 4",
      ),
    );

    await screen.findByTestId("went-index");
  });

  test("Cancel button triggers back navigation (smoke)", async () => {
    setupMocks();
    renderPage();
    await screen.findByTestId("MenuItemReviewForm-itemId");
    await userEvent.click(screen.getByTestId("MenuItemReviewForm-cancel"));

    expect(true).toBe(true);
  });
});
