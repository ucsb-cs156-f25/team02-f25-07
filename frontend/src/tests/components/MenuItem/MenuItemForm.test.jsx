import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import MenuItemForm from "main/components/MenuItem/MenuItemForm";
import { MenuItemFixtures } from "fixtures/MenuItemFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = ["DiningCommonsCode", "Name", "Station"];
  const testId = "MenuItemForm";

  const assertTestIdsPresent = () => {
    expect(
      screen.getByTestId(`${testId}-diningCommonsCode`),
    ).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-name`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-station`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-submit`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-cancel`)).toBeInTheDocument();
  };

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    assertTestIdsPresent();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemForm initialContents={MenuItemFixtures.oneMenuItem} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    assertTestIdsPresent();
    expect(screen.getByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemForm />
        </Router>
      </QueryClientProvider>,
    );

    const cancelButton = await screen.findByTestId(`${testId}-cancel`);
    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemForm />
        </Router>
      </QueryClientProvider>,
    );

    assertTestIdsPresent();

    const submitButton = await screen.findByTestId(`${testId}-submit`);
    fireEvent.click(submitButton);

    await screen.findByText(/DiningCommonsCode is required/);
    expect(screen.getByText(/Name is required/)).toBeInTheDocument();
    expect(screen.getByText(/Station is required/)).toBeInTheDocument();

    const diningCommonsCodeInput = screen.getByTestId(
      `${testId}-diningCommonsCode`,
    );
    fireEvent.change(diningCommonsCodeInput, {
      target: { value: "a".repeat(31) },
    });
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(screen.getByText(/Max length 30 characters/)).toBeInTheDocument(),
    );
  });
});
