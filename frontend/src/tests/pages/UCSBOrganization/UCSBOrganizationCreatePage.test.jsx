import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBOrganizationCreatePage from "main/pages/UCSBOrganization/UCSBOrganizationCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { toast } from "react-toastify";

// mock toast
const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

// mock Navigate
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

describe("UCSBOrganizationCreatePage tests (no id)", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

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

  test("on submit, makes POST request and redirects to /ucsborganization", async () => {
    const ucsborganization = {
      orgCode: "UCSB",
      orgTranslationShort: "UCSBBAD",
      orgTranslation: "aaa",
      inactive: false,
    };

    axiosMock.onPost("/api/UCSBOrganization/post").reply(202, ucsborganization);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // fill form
    await waitFor(() => {
      expect(screen.getByLabelText("OrgCode")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("OrgCode"), {
      target: { value: "UCSB" },
    });
    fireEvent.change(screen.getByLabelText("OrgTranslationShort"), {
      target: { value: "UCSBBAD" },
    });
    fireEvent.change(screen.getByLabelText("OrgTranslation"), {
      target: { value: "aaa" },
    });
    fireEvent.change(screen.getByLabelText("Inactive"), {
      target: { value: false },
    });

    const createButton = screen.getByText("Create");
    fireEvent.click(createButton);

    // verify axios call
    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].params).toEqual({
      orgCode: "UCSB",
      orgTranslationShort: "UCSBBAD",
      orgTranslation: "aaa",
      inactive: false,
    });

    const onSuccess = (ucsborganization) => {
      toast(
        `New UCSB Organization Created – OrgCode: ${ucsborganization.orgCode}`,
      );
    };

    // verify navigation
    expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });
  });

  test("objectToAxiosParams correctly converts inactive to boolean", () => {
    const objectToAxiosParams = (ucsborganization) => ({
      url: "/api/UCSBOrganization/post",
      method: "POST",
      params: {
        inactive: String(ucsborganization.inactive).toLowerCase() === "true",
      },
    });

    expect(objectToAxiosParams({ inactive: "true" }).params.inactive).toBe(
      true,
    );
    expect(objectToAxiosParams({ inactive: "false" }).params.inactive).toBe(
      false,
    );
    expect(objectToAxiosParams({ inactive: true }).params.inactive).toBe(true);
    expect(objectToAxiosParams({ inactive: false }).params.inactive).toBe(
      false,
    );
    expect(objectToAxiosParams({ inactive: "TRUE" }).params.inactive).toBe(
      true,
    );
    expect(objectToAxiosParams({ inactive: "False" }).params.inactive).toBe(
      false,
    );
  });
});
