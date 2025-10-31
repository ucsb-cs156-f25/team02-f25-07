import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const original = await vi.importActual("react-router");
  return { ...original, useNavigate: () => mockedNavigate };
});

describe("MenuItemReviewForm tests", () => {
  const queryClient = new QueryClient();
  const renderForm = (props = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm {...props} />
        </Router>
      </QueryClientProvider>
    );

  const testId = "MenuItemReviewForm";

  test("renders correctly with no initialContents", async () => {
    renderForm();

    expect(await screen.findByText(/Create/i)).toBeInTheDocument();

    const labelMatchers = [
      /itemId/i,
      /reviewerEmail/i,
      /stars/i,         
      /dateReviewed/i,
      /comments/i,
    ];
    labelMatchers.forEach((re) => {
      expect(screen.getByLabelText(re)).toBeInTheDocument();
    });

    ["itemId", "reviewerEmail", "stars", "dateReviewed", "comments"].forEach(
      (k) => {
        expect(screen.getByTestId(`${testId}-${k}`)).toBeInTheDocument();
      }
    );
  });

  test("renders correctly with initialContents (shows read-only id)", async () => {
    renderForm({
      initialContents: menuItemReviewFixtures.threeReviews[0],
      buttonLabel: "Update",
    });

    expect(await screen.findByText(/Update/i)).toBeInTheDocument();

    const labelMatchers = [
      /itemId/i,
      /reviewerEmail/i,
      /stars/i,
      /dateReviewed/i,
      /comments/i,
    ];
    labelMatchers.forEach((re) => {
      expect(screen.getByLabelText(re)).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText("Id")).toBeInTheDocument();
  });

  test("calls navigate(-1) when Cancel is clicked", async () => {
    renderForm();
    const cancelBtn = await screen.findByTestId(`${testId}-cancel`);
    fireEvent.click(cancelBtn);
    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("performs required validations and range/pattern checks", async () => {
    renderForm();

    const submitBtn = await screen.findByText(/Create/i);
    fireEvent.click(submitBtn);

    await screen.findByText(/itemId is required/i);
    expect(
      screen.getByText(/reviewerEmail is required/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/stars is required/i)).toBeInTheDocument();
    expect(screen.getByText(/dateReviewed is required/i)).toBeInTheDocument();
    expect(screen.getByText(/comments is required/i)).toBeInTheDocument();

    const emailInput = screen.getByTestId(`${testId}-reviewerEmail`);
    const starsInput = screen.getByTestId(`${testId}-stars`);
    const itemIdInput = screen.getByTestId(`${testId}-itemId`);
    const dateInput = screen.getByTestId(`${testId}-dateReviewed`);
    const commentsInput = screen.getByTestId(`${testId}-comments`);

    fireEvent.change(itemIdInput, { target: { value: "10" } });
    fireEvent.change(emailInput, { target: { value: "not-an-email" } });
    fireEvent.change(starsInput, { target: { value: "6" } }); // out of range
    fireEvent.change(dateInput, { target: { value: "2025-10-01T12:00" } });
    fireEvent.change(commentsInput, { target: { value: "ok" } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(
        screen.getByText(/stars must be between 1 and 5/i)
      ).toBeInTheDocument();
    });
  });
});
