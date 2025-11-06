import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

vi.mock("main/utils/axios", () => {
  return { axios };
});

// mock toast
vi.mock("react-toastify", () => {
  return {
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    },
  };
});

// mock navigate
const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const original = await vi.importActual("react-router");
  return {
    ...original,
    useNavigate: () => mockedNavigate,
  };
});

import MenuItemReviewTable, {
  buildDeleteParams,
  onDeleteSuccess,
} from "main/components/MenuItemReview/MenuItemReviewTable";

import { toast } from "react-toastify";

describe("MenuItemReviewTable tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "id",
    "Item ID",
    "Reviewer Email",
    "Stars",
    "Date Reviewed",
    "Comments",
  ];
  const expectedFields = [
    "id",
    "itemId",
    "reviewerEmail",
    "stars",
    "dateReviewed",
    "comments",
  ];
  const testId = "MenuItemReviewTable";

  test("renders empty table correctly", () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewTable menuItemReviews={[]} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expectedHeaders.forEach((h) =>
      expect(screen.getByText(h)).toBeInTheDocument(),
    );
    expectedFields.forEach((f) =>
      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-${f}`),
      ).not.toBeInTheDocument(),
    );
  });

  test("Has expected headers, content and buttons for admin user", () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewTable
            menuItemReviews={menuItemReviewFixtures.threeReviews}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expectedHeaders.forEach((h) =>
      expect(screen.getByText(h)).toBeInTheDocument(),
    );
    expectedFields.forEach((f) =>
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${f}`),
      ).toBeInTheDocument(),
    );

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-itemId`),
    ).toHaveTextContent("10");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-reviewerEmail`),
    ).toHaveTextContent("student@ucsb.edu");

    const editBtn = screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`);
    expect(editBtn).toBeInTheDocument();
    expect(editBtn).toHaveClass("btn-primary");

    const delBtn = screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`);
    expect(delBtn).toBeInTheDocument();
    expect(delBtn).toHaveClass("btn-danger");
  });

  test("Has expected headers and content for ordinary user (no buttons)", () => {
    const currentUser = currentUserFixtures.userOnly;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewTable
            menuItemReviews={menuItemReviewFixtures.threeReviews}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expectedHeaders.forEach((h) =>
      expect(screen.getByText(h)).toBeInTheDocument(),
    );
    expectedFields.forEach((f) =>
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${f}`),
      ).toBeInTheDocument(),
    );

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("Edit button navigates to the edit page", async () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewTable
            menuItemReviews={menuItemReviewFixtures.threeReviews}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-id`),
    ).toHaveTextContent("1");

    const editBtn = screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`);
    fireEvent.click(editBtn);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/menuitemreview/edit/1"),
    );
  });

  test("Delete button calls delete callback", async () => {
    const currentUser = currentUserFixtures.adminUser;

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete(/\/api\/menuitemreview.*/)
      .reply(200, { message: "MenuItemReview deleted" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewTable
            menuItemReviews={menuItemReviewFixtures.threeReviews}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1"),
    );

    const delBtn = screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`);
    fireEvent.click(delBtn);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBeGreaterThan(0);
    });

    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  });
});

describe("MenuItemReviewTable helpers", () => {
  test("buildDeleteParams handles row.original.id", () => {
    const params = buildDeleteParams({ row: { original: { id: 42 } } });
    expect(params).toEqual({
      url: "/api/menuitemreview",
      method: "DELETE",
      params: { id: 42 },
    });
  });

  test("buildDeleteParams handles row.values.id", () => {
    const params = buildDeleteParams({ row: { values: { id: 7 } } });
    expect(params).toEqual({
      url: "/api/menuitemreview",
      method: "DELETE",
      params: { id: 7 },
    });
  });

  test("buildDeleteParams tolerates undefined/empty", () => {
    expect(() => buildDeleteParams(undefined)).not.toThrow();
    expect(buildDeleteParams(undefined)).toEqual({
      url: "/api/menuitemreview",
      method: "DELETE",
      params: { id: undefined },
    });

    expect(() => buildDeleteParams({ row: {} })).not.toThrow();
    expect(buildDeleteParams({ row: {} })).toEqual({
      url: "/api/menuitemreview",
      method: "DELETE",
      params: { id: undefined },
    });

    expect(() => buildDeleteParams({})).not.toThrow();
    expect(buildDeleteParams({})).toEqual({
      url: "/api/menuitemreview",
      method: "DELETE",
      params: { id: undefined },
    });
  });

  test("onDeleteSuccess shows success toast", () => {
    onDeleteSuccess({ message: "ok" });
    expect(toast.success).toHaveBeenCalledWith(
      "MenuItemReview deleted successfully",
    );
  });
});
