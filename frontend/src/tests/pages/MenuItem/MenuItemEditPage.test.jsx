import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import MenuItemEditPage from "main/pages/MenuItem/MenuItemEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

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
      axiosMock.reset();
      axiosMock.resetHistory();
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
      axiosMock.resetHistory();
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
      expect(screen.queryByTestId("MenuItem-name")).not.toBeInTheDocument();
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
      axiosMock
        .onGet("/api/ucsbdiningcommonsmenuitem", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          diningCommonsCode: "ortega",
          name: "kos",
          station: "pedaret",
        });
      axiosMock.onPut("/api/ucsbdiningcommonsmenuitem").reply(200, {
        id: "17",
        diningCommonsCode: "carillo",
        name: "keer",
        station: "madaret",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
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
      const diningCommonsCodeField = screen.getByTestId(
        "MenuItemForm-diningCommonsCode",
      );
      const nameField = screen.getByTestId("MenuItemForm-name");
      const stationField = screen.getByTestId("MenuItemForm-station");
      const submitButton = screen.getByTestId("MenuItemForm-submit");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");
      expect(diningCommonsCodeField).toBeInTheDocument();
      expect(diningCommonsCodeField).toHaveValue("ortega");
      expect(nameField).toBeInTheDocument();
      expect(nameField).toHaveValue("kos");
      expect(stationField).toBeInTheDocument();
      expect(stationField).toHaveValue("pedaret");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(diningCommonsCodeField, {
        target: { value: "carillo" },
      });
      fireEvent.change(nameField, {
        target: { value: "keer" },
      });
      fireEvent.change(stationField, {
        target: { value: "madaret" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "Menu Item Updated - id: 17 name: keer",
      );

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/ucsbdiningcommonsmenuitem",
      });
      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          diningCommonsCode: "carillo",
          name: "keer",
          station: "madaret",
        }),
      ); // posted object
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

      const idField = screen.getByTestId("MenuItemForm-id");
      const diningCommonsCodeField = screen.getByTestId(
        "MenuItemForm-diningCommonsCode",
      );
      const nameField = screen.getByTestId("MenuItemForm-name");
      const stationField = screen.getByTestId("MenuItemForm-station");
      const submitButton = screen.getByTestId("MenuItemForm-submit");

      expect(idField).toHaveValue("17");
      expect(diningCommonsCodeField).toHaveValue("ortega");
      expect(nameField).toHaveValue("kos");
      expect(stationField).toHaveValue("pedaret");
      expect(submitButton).toBeInTheDocument();

      fireEvent.change(diningCommonsCodeField, {
        target: { value: "carillo" },
      });
      fireEvent.change(nameField, { target: { value: "keer" } });
      fireEvent.change(stationField, { target: { value: "madaret" } });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "Menu Item Updated - id: 17 name: keer",
      );
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/ucsbdiningcommonsmenuitem",
      });
    });
  });
});
