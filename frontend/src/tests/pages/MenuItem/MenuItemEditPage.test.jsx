import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import MenuItemEditPage from "main/pages/MenuItem/MenuItemEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";
import { expect } from "vitest";

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
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("MenuItemEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/ucsbdiningcommonsmenuitem", { params: { id: 17 } })
        .timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
    });

    const queryClient = new QueryClient();

    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText("Edit Menu Item");
      expect(
        screen.queryByTestId("MenuItemForm-diningCommonsCode"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);

      axiosMock
        .onGet("/api/ucsbdiningcommonsmenuitem", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          diningCommonsCode: "ortega",
          name: "keer",
          station: "hasrat",
        });

      // ✅ Dynamic echo-back so tests always match what user types
      axiosMock.onPut("/api/ucsbdiningcommonsmenuitem").reply((config) => {
        const updated = JSON.parse(config.data);
        return [
          200,
          {
            id: 17,
            diningCommonsCode: "ortega",
            ...updated,
          },
        ];
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemForm-id");

      const idField = screen.getByTestId("MenuItemForm-id");
      const nameField = screen.getByTestId("MenuItemForm-name");
      const stationField = screen.getByTestId("MenuItemForm-station");
      const diningCommonsCodeField = screen.getByTestId(
        "MenuItemForm-diningCommonsCode",
      );
      const submitButton = screen.getByTestId("MenuItemForm-submit");

      expect(idField).toHaveValue("17");
      expect(diningCommonsCodeField).toHaveValue("ortega");
      expect(nameField).toHaveValue("keer");
      expect(stationField).toHaveValue("hasrat");

      fireEvent.change(nameField, { target: { value: "keereh-erfan" } });
      fireEvent.change(stationField, { target: { value: "madreh-erfan" } });

      fireEvent.click(submitButton);

      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith(
          "Menu Item Updated - id: 17 name: keereh-erfan",
        ),
      );

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/ucsbdiningcommonsmenuitem",
      });
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemForm-id");

      const nameField = screen.getByTestId("MenuItemForm-name");
      const stationField = screen.getByTestId("MenuItemForm-station");
      const submitButton = screen.getByTestId("MenuItemForm-submit");

      fireEvent.change(nameField, { target: { value: "kos" } });
      fireEvent.change(stationField, { target: { value: "pedaret" } });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toHaveBeenCalledTimes(1));

      expect(mockToast).toHaveBeenLastCalledWith(
        "Menu Item Updated - id: 17 name: kos",
      );

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/ucsbdiningcommonsmenuitem",
      });
    });
  });
});
