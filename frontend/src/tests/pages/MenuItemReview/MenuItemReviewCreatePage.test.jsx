import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MenuItemReviewCreatePage from "main/pages/MenuItemReview/MenuItemReviewCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

// ---- mocks: toast & navigate ----
const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, toast: vi.fn((x) => mockToast(x)) };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("MenuItemReviewCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
  });

  const renderPage = (ui = <MenuItemReviewCreatePage />) =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    );

  test("MenuItemReviewCreatePage tests renders without crashing", async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId("MenuItemReviewForm-itemId")).toBeInTheDocument();
    });
  });


  test("MenuItemReviewCreatePage tests on submit, builds correct request and shows toast on success", async () => {
    const captured = { req: null, staleKeys: null };

    const backend = await import("main/utils/useBackend");
    const spy = vi
      .spyOn(backend, "useBackendMutation")
      .mockImplementation((fn, opts, staleKeys) => {
        captured.staleKeys = staleKeys;
        return {
          mutate: (data) => {
            captured.req = fn(data);             
            opts.onSuccess({ id: 42, ...data });     
          },
          isSuccess: false,                         
        };
      });

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId("MenuItemReviewForm-itemId")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("MenuItemReviewForm-itemId"), { target: { value: "12" } });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-reviewerEmail"), { target: { value: "user@ucsb.edu" } });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-stars"), { target: { value: "5" } });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-dateReviewed"), { target: { value: "2025-10-31T15:00" } });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-comments"), { target: { value: "great!" } });

    fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

    await waitFor(() => expect(captured.req).not.toBeNull());
    expect(captured.req).toEqual({
      url: "/api/menuitemreview/post",
      method: "POST",
      params: {
        itemId: 12,
        reviewerEmail: "user@ucsb.edu",
        stars: 5,
        dateReviewed: "2025-10-31T15:00",
        comments: "great!",
      },
    });


    expect(mockToast).toBeCalledWith("New MenuItemReview Created - id: 42");

    spy.mockRestore();
  });
});


describe("MenuItemReviewCreatePage stale key & navigation contract", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
  });

  test("MenuItemReviewCreatePage stale key contract passes ['/api/menuitemreview/all'] to useBackendMutation", async () => {
    const captured = { staleKeys: null };
    const backend = await import("main/utils/useBackend");
    const spy = vi
      .spyOn(backend, "useBackendMutation")
      .mockImplementation((fn, opts, staleKeys) => {
        captured.staleKeys = staleKeys;
        return { mutate: vi.fn(), isSuccess: false }; 
      });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => expect(captured.staleKeys).not.toBeNull());
    expect(captured.staleKeys).toEqual(["/api/menuitemreview/all"]);

    spy.mockRestore();
  });

  test("navigates to /menuitemreview when mutation is success and storybook is default(false)", async () => {
    const backend = await import("main/utils/useBackend");
    const spy = vi
      .spyOn(backend, "useBackendMutation")
      .mockReturnValue({ mutate: vi.fn(), isSuccess: true });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          {}
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(mockNavigate).toBeCalledWith({ to: "/menuitemreview" });
    });

    spy.mockRestore();
  });

  test("does NOT navigate when storybook=true even if success", async () => {
    const backend = await import("main/utils/useBackend");
    const spy = vi
      .spyOn(backend, "useBackendMutation")
      .mockReturnValue({ mutate: vi.fn(), isSuccess: true });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <MenuItemReviewCreatePage storybook={true} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(mockNavigate).not.toBeCalled();
    });

    spy.mockRestore();
  });
});
