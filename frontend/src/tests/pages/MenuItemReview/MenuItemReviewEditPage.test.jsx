// src/tests/pages/MenuItemReview/MenuItemReviewEditPage.test.jsx
import { vi } from "vitest";

vi.mock("react-toastify", async () => {
  const actual = await vi.importActual<typeof import("react-toastify")>("react-toastify");
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
  };

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
            <Route path="/menuitemreview" element={<div data-testid="went-index">INDEX</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

    // assert
    await screen.findByText("MenuItemReview Edit page not yet implemented");
    expect(
      screen.getByText("MenuItemReview Edit page not yet implemented"),
    ).toBeInTheDocument();
  });
});
