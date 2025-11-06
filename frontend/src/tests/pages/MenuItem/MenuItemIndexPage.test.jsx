import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import MenuItemIndexPage from "main/pages/MenuItem/MenuItemIndexPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import mockConsole from "tests/testutils/mockConsole";
import { MenuItemFixtures } from "fixtures/MenuItemFixtures";

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

describe("MenuItemIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "MenuItemTable";

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

  const queryClient = new QueryClient();

  test("Renders with Create Button for admin user", async () => {
    setupAdminUser();
    axiosMock.onGet("/api/ucsbdiningcommonsmenuitem/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Create Menu Item/)).toBeInTheDocument();
    });
    const button = screen.getByRole("button", { name: "Create Menu Item" });
    expect(button).toHaveAttribute("href", "/ucsbdiningcommonsmenuitem/create");
    expect(button).toHaveAttribute("style", "float: right;");
  });

  test("renders three menu items correctly for regular user", async () => {
    setupUserOnly();
    axiosMock
      .onGet("/api/ucsbdiningcommonsmenuitem/all")
      .reply(200, MenuItemFixtures.threeMenuItems);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );

    const createMenuItemButton = screen.queryByRole("button", {
      name: "Create Menu Item",
    });
    expect(createMenuItemButton).not.toBeInTheDocument();

    expect(screen.getByText("ortega")).toBeInTheDocument();
    expect(screen.getByText("keer")).toBeInTheDocument();
    expect(screen.getByText("dahan")).toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();
  });

  test("renders empty table when backend unavailable, user only", async () => {
    setupUserOnly();

    axiosMock.onGet("/api/ucsbdiningcommonsmenuitem/all").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/ucsbdiningcommonsmenuitem/all",
    );
    restoreConsole();
  });

  test("what happens when you click delete, admin", async () => {
    setupAdminUser();

    axiosMock
      .onGet("/api/ucsbdiningcommonsmenuitem/all")
      .reply(200, MenuItemFixtures.threeMenuItems);
    axiosMock
      .onDelete("/api/ucsbdiningcommonsmenuitem")
      .reply(200, "MenuItem with id 1 was deleted");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toBeInTheDocument();
    });

    const deleteButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toBeCalledWith("MenuItem with id 1 was deleted");
    });

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });

    expect(axiosMock.history.delete[0].url).toBe(
      "/api/ucsbdiningcommonsmenuitem",
    );
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  });
});
