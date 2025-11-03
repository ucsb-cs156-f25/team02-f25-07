// import { fireEvent, render, waitFor, screen } from "@testing-library/react";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { MemoryRouter } from "react-router";
// import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";

// import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
// import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
// import axios from "axios";
// import AxiosMockAdapter from "axios-mock-adapter";
// import mockConsole from "tests/testutils/mockConsole";

// const mockToast = vi.fn();
// vi.mock("react-toastify", async (importOriginal) => {
//   const originalModule = await importOriginal();
//   return {
//     ...originalModule,
//     toast: vi.fn((x) => mockToast(x)),
//   };
// });

// const mockNavigate = vi.fn();
// vi.mock("react-router", async (importOriginal) => {
//   const originalModule = await importOriginal();
//   return {
//     ...originalModule,
//     useParams: vi.fn(() => ({
//       //d: 17,
//       orgCode: "UCSB",
//     })),
//     Navigate: vi.fn((x) => {
//       mockNavigate(x);
//       return null;
//     }),
//   };
// });

// let axiosMock;
// describe("UCSBOrganizationEditPage tests", () => {
//   describe("when the backend doesn't return data", () => {
//     beforeEach(() => {
//       axiosMock = new AxiosMockAdapter(axios);
//       axiosMock.reset();
//       axiosMock.resetHistory();
//       axiosMock
//         .onGet("/api/currentUser")
//         .reply(200, apiCurrentUserFixtures.userOnly);
//       axiosMock
//         .onGet("/api/systemInfo")
//         .reply(200, systemInfoFixtures.showingNeither);
//       axiosMock.onGet("/api/UCSBOrganization", { params: { orgCode: "UCSB" } }).timeout();
//     });

//     afterEach(() => {
//       mockToast.mockClear();
//       mockNavigate.mockClear();
//       axiosMock.restore();
//       axiosMock.resetHistory();
//     });

//     const queryClient = new QueryClient();


//     test("renders header but table is not present", async () => {
//       const restoreConsole = mockConsole();

//       render(
//         <QueryClientProvider client={queryClient}>
//           <MemoryRouter>
//             <UCSBOrganizationEditPage />
//           </MemoryRouter>
//         </QueryClientProvider>,
//       );
//       await screen.findByText("Edit UCSBOrganization");
//       expect(screen.queryByTestId("UCSBOrganization-orgCode")).not.toBeInTheDocument();
//       restoreConsole();
//     });
//   });

//   describe("tests where backend is working normally", () => {
//     beforeEach(() => {
//       axiosMock = new AxiosMockAdapter(axios);
//       axiosMock.reset();
//       axiosMock.resetHistory();
//       axiosMock
//         .onGet("/api/currentUser")
//         .reply(200, apiCurrentUserFixtures.userOnly);
//       axiosMock
//         .onGet("/api/systemInfo")
//         .reply(200, systemInfoFixtures.showingNeither);
//       // axiosMock.onGet("/api/UCSBOrganization", { params: { id: 17 } }).reply(200, {
//       //   id: 17,
//       //   orgCode: "UCSB",
//       //   orgTranslationShort: "UCSBBAD",
//       //   orgTranslation:"aaa",
//       //   inactive: false,
//       // });
//       axiosMock.onGet("/api/UCSBOrganization", { params: { orgCode: "UCSB" } }).reply(200, {
//         orgCode: "UCSB",
//         orgTranslationShort: "UCSBBAD",
//         orgTranslation: "aaa",
//         inactive: false,
//       });
      
//       axiosMock.onPut("/api/UCSBOrganization").reply(200, {
//         //id: "17",
//         orgCode: "UCSBBB",
//         orgTranslationShort: "UCSBBADMINTON",
//         orgTranslation:"bbb",
//         inactive: true,
//       });
//     });

//     afterEach(() => {
//       mockToast.mockClear();
//       mockNavigate.mockClear();
//       axiosMock.restore();
//       axiosMock.resetHistory();
//     });

//     const queryClient = new QueryClient();

//     test("Is populated with the data provided", async () => {
//       render(
//         <QueryClientProvider client={queryClient}>
//           <MemoryRouter>
//             <UCSBOrganizationEditPage />
//           </MemoryRouter>
//         </QueryClientProvider>,
//       );

//       await screen.findByTestId("UCSBOrganizationForm-id");
//       //await screen.findByTestId("UCSBOrganizationForm-orgCode");

//       //const idField = screen.getByTestId("UCSBOrganizationForm-id");
//       const orgCodeField = screen.getByTestId("UCSBOrganizationForm-orgCode");
//       const orgTranslationShortField = screen.getByTestId("UCSBOrganizationForm-orgTranslationShort");
//       const orgTranslationField = screen.getByTestId("UCSBOrganizationForm-orgTranslation");

//       const inactiveField = screen.getByTestId("UCSBOrganizationForm-inactive");

//       const submitButton = screen.getByTestId("UCSBOrganizationForm-submit");


//       //expect(idField).toBeInTheDocument();
//       //expect(idField).toHaveValue("17");
//       expect(orgCodeField).toBeInTheDocument();
//       expect(orgCodeField).toHaveValue("UCSB");
//       expect(orgTranslationShortField).toBeInTheDocument();
//       expect(orgTranslationShortField).toHaveValue("UCSBBAD");
//       expect(orgTranslationField).toBeInTheDocument();
//       expect(orgTranslationField).toHaveValue("aaa");
//       expect(inactiveField).toBeInTheDocument();
//       expect(inactiveField).toHaveValue("false");

//       expect(submitButton).toHaveTextContent("Update");

//       fireEvent.change(orgCodeField, {
//         target: { value: "UCSBBBB" },
//       });

//       fireEvent.change(orgTranslationShortField, {
//         target: { value: "UCSBBADMINTON" },
//       });

//       fireEvent.change(orgTranslationField, {
//         target: { value: "bbb" },
//       });

//       fireEvent.change(inactiveField, {
//         target: { value: "true" },
//       });

//       fireEvent.click(submitButton);

//       await waitFor(() => expect(mockToast).toBeCalled());
//       expect(mockToast).toBeCalledWith(
//         "UCSBOrganization Updated - orgCode: UCSBBB",
//       );

//       expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });

//       expect(axiosMock.history.put.length).toBe(1); // times called
//       expect(axiosMock.history.put[0].params).toEqual({ orgCode: "UCSBBBB" });
//       expect(axiosMock.history.put[0].data).toBe(
//         JSON.stringify({
//           //orgCode: "UCSBBBB",
//           orgTranslationShort: "UCSBBADMINTON",
//           orgTranslation: "bbb",
//           inactive: "true",
//         }),
//       ); // posted object
//     });

//     test("Changes when you click Update", async () => {
//       render(
//         <QueryClientProvider client={queryClient}>
//           <MemoryRouter>
//             <UCSBOrganizationEditPage />
//           </MemoryRouter>
//         </QueryClientProvider>,
//       );

//       await screen.findByTestId("UCSBOrganizationForm-id");

//       const idField = screen.getByTestId("UCSBOrganizationForm-id");
//       //const nameField = screen.getByTestId("UCSBOrganizationForm-name");
//       //const descriptionField = screen.getByTestId("UCSBOrganizationForm-description");
//       const orgCodeField = screen.getByTestId("UCSBOrganizationForm-orgCode");
//       const orgTranslationShortField = screen.getByTestId("UCSBOrganizationForm-orgTranslationShort");
//       const orgTranslationField = screen.getByTestId("UCSBOrganizationForm-orgTranslation");
//       const inactiveField = screen.getByTestId("UCSBOrganizationForm-inactive");
//       //const submitButton = screen.getByTestId("UCSBOrganizationForm-submit");

//       const submitButton = screen.getByTestId("UCSBOrganizationForm-submit");


//       fireEvent.change(orgCodeField, {
//         target: { value: "UCSBBBB" },
//       });

//       fireEvent.change(orgTranslationShortField, {
//         target: { value: "UCSBBADMINTON" },
//       });

//       fireEvent.change(orgTranslationField, {
//         target: { value: "bbb" },
//       });

//       fireEvent.change(inactiveField, {
//         target: { value: "true" },
//       });

//       fireEvent.click(submitButton);

//       await waitFor(() => expect(mockToast).toBeCalled());
//       expect(mockToast).toBeCalledWith(
//         "UCSBOrganization Updated - orgCode: UCSBBB",
//       );
//       expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });
//     });
//   });
//  // });
// });

import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

// --- Mock toast notifications ---
const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

// --- Mock navigation and route params ---
const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      orgCode: "UCSB",
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("UCSBOrganizationEditPage tests", () => {
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

      // Simulate backend timeout
      axiosMock
        .onGet("/api/UCSBOrganization", { params: { orgCode: "UCSB" } })
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
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await screen.findByText("Edit UCSBOrganization");
      expect(
        screen.queryByTestId("UCSBOrganizationForm-orgCode")
      ).not.toBeInTheDocument();

      restoreConsole();
    });
  });

  // --- Normal backend behavior ---
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

      // GET existing org by orgCode
      axiosMock
        .onGet("/api/UCSBOrganization", { params: { orgCode: "UCSB" } })
        .reply(200, {
          orgCode: "UCSB",
          orgTranslationShort: "UCSBBAD",
          orgTranslation: "aaa",
          inactive: false,
        });

      // PUT updated org
      axiosMock.onPut("/api/UCSBOrganization").reply(200, {
        orgCode: "UCSBBB",
        orgTranslationShort: "UCSBBADMINTON",
        orgTranslation: "bbb",
        inactive: true,
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
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      // --- Wait for fields to load ---
      await screen.findByTestId("UCSBOrganizationForm-orgCode");

      const orgCodeField = screen.getByTestId(
        "UCSBOrganizationForm-orgCode"
      );
      const orgTranslationShortField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslationShort"
      );
      const orgTranslationField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslation"
      );
      const inactiveField = screen.getByTestId(
        "UCSBOrganizationForm-inactive"
      );
      const submitButton = screen.getByTestId(
        "UCSBOrganizationForm-submit"
      );

      // --- Check initial data ---
      expect(orgCodeField).toHaveValue("UCSB");
      expect(orgTranslationShortField).toHaveValue("UCSBBAD");
      expect(orgTranslationField).toHaveValue("aaa");
      expect(inactiveField).toHaveValue("false");
      expect(submitButton).toHaveTextContent("Update");

      // --- Simulate user edits ---
      fireEvent.change(orgCodeField, { target: { value: "UCSBBBB" } });
      fireEvent.change(orgTranslationShortField, {
        target: { value: "UCSBBADMINTON" },
      });
      fireEvent.change(orgTranslationField, { target: { value: "bbb" } });
      fireEvent.change(inactiveField, { target: { value: "true" } });

      fireEvent.click(submitButton);

      // --- Assertions ---
      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "UCSBOrganization Updated - orgCode: UCSBBB"
      );

      expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });

      // --- Verify PUT call ---
      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].url).toContain("/api/UCSBOrganization");
      expect(axiosMock.history.put[0].params).toEqual({ orgCode: "UCSBBBB" });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          orgTranslationShort: "UCSBBADMINTON",
          orgTranslation: "bbb",
          inactive: "true",
        })
      );
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await screen.findByTestId("UCSBOrganizationForm-orgCode");

      const orgCodeField = screen.getByTestId("UCSBOrganizationForm-orgCode");
      const orgTranslationShortField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslationShort"
      );
      const orgTranslationField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslation"
      );
      const inactiveField = screen.getByTestId("UCSBOrganizationForm-inactive");
      const submitButton = screen.getByTestId("UCSBOrganizationForm-submit");

      fireEvent.change(orgCodeField, { target: { value: "UCSBBBB" } });
      fireEvent.change(orgTranslationShortField, {
        target: { value: "UCSBBADMINTON" },
      });
      fireEvent.change(orgTranslationField, { target: { value: "bbb" } });
      fireEvent.change(inactiveField, { target: { value: "true" } });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "UCSBOrganization Updated - orgCode: UCSBBB"
      );
      expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });
    });
  });
});
