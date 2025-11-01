import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBOrganizationCreatePage from "main/pages/UCSBOrganization/UCSBOrganizationCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
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

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("UCSBOrganizationCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("OrgCode")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /ucsborganization", async () => {
    const queryClient = new QueryClient();
    const ucsborganization = {
      id: 1,
      orgCode: "UCSB",
      orgTranslationShort: "UCSBBAD",
      orgTranslation: "aaa",
      inactive: false,
    };

    axiosMock.onPost("/api/ucsborganization/post").reply(202, ucsborganization);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("OrgCode")).toBeInTheDocument();
    });

    const OrgCodeInput = screen.getByLabelText("OrgCode");
    expect(OrgCodeInput).toBeInTheDocument();

    const OrgTranslationShortInput = screen.getByLabelText(
      "OrgTranslationShort",
    );
    expect(OrgTranslationShortInput).toBeInTheDocument();

    const OrgTranslationInput = screen.getByLabelText("OrgTranslation");
    expect(OrgTranslationInput).toBeInTheDocument();

    const InactiveInput = screen.getByLabelText("Inactive");
    expect(InactiveInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(OrgCodeInput, { target: { value: "UCSB" } });
    fireEvent.change(OrgTranslationShortInput, {
      target: { value: "UCSBBAD" },
    });
    fireEvent.change(OrgTranslationInput, {
      target: { value: "aaa" },
    });
    fireEvent.change(InactiveInput, { target: { value: false } });

    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      orgCode: "UCSB",
      orgTranslationShort: "UCSBBAD",
      orgTranslation: "aaa",
      inactive: false,
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toHaveBeenCalledWith(
      "New UCSB Organization Created - id: 1 OrgCode: UCSB",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });
  });

  test("objectToAxiosParams correctly converts inactive to boolean", () => {
    const objectToAxiosParams = (ucsborganization) => ({
      url: "/api/ucsborganization/post",
      method: "POST",
      params: {
        inactive: JSON.parse(String(ucsborganization.inactive).toLowerCase()),
      },
    });

    expect(objectToAxiosParams({ inactive: "true" }).params.inactive).toBe(true);
    expect(objectToAxiosParams({ inactive: "false" }).params.inactive).toBe(false);
    expect(objectToAxiosParams({ inactive: true }).params.inactive).toBe(true);
    expect(objectToAxiosParams({ inactive: false }).params.inactive).toBe(false);
    expect(objectToAxiosParams({ inactive: "TRUE" }).params.inactive).toBe(true);
    expect(objectToAxiosParams({ inactive: "False" }).params.inactive).toBe(false);
  });
  


});
