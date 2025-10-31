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

    const submitBtnByText = await screen.findByText(/Create/i);
    expect(submitBtnByText).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-submit`)).toBeInTheDocument();

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
    renderForm({ submitAction: vi.fn() });

    const submitBtn = await screen.findByTestId(`${testId}-submit`);
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

  test("submits numbers as numbers (itemId, stars)", async () => {
    const onSubmit = vi.fn();
    renderForm({ submitAction: onSubmit });

    const itemIdInput = await screen.findByTestId(`${testId}-itemId`);
    const emailInput = screen.getByTestId(`${testId}-reviewerEmail`);
    const starsInput = screen.getByTestId(`${testId}-stars`);
    const dateInput = screen.getByTestId(`${testId}-dateReviewed`);
    const commentsInput = screen.getByTestId(`${testId}-comments`);
    const submitBtn = screen.getByTestId(`${testId}-submit`);

    fireEvent.change(itemIdInput, { target: { value: "10" } });
    fireEvent.change(emailInput, { target: { value: "joe@ucsb.edu" } });
    fireEvent.change(starsInput, { target: { value: "3" } });
    fireEvent.change(dateInput, { target: { value: "2025-10-01T12:34" } });
    fireEvent.change(commentsInput, { target: { value: "nice" } });

    fireEvent.click(submitBtn);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());

    const payload = onSubmit.mock.calls[0][0];
    expect(typeof payload.itemId).toBe("number");
    expect(typeof payload.stars).toBe("number");
    expect(payload.itemId).toBe(10);
    expect(payload.stars).toBe(3);
  });

  test("shows correct min error message for itemId < 1", async () => {
    renderForm({ submitAction: vi.fn() });

    const itemIdInput = await screen.findByTestId(`${testId}-itemId`);
    const submitBtn = screen.getByTestId(`${testId}-submit`);

    fireEvent.change(itemIdInput, { target: { value: "0" } });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText("itemId must be ≥ 1.")
    ).toBeInTheDocument();
  });

  test("shows min error for stars below 1", async () => {
    renderForm({ submitAction: vi.fn() });

    const itemIdInput = await screen.findByTestId(`${testId}-itemId`);
    const emailInput = screen.getByTestId(`${testId}-reviewerEmail`);
    const starsInput = screen.getByTestId(`${testId}-stars`);
    const dateInput = screen.getByTestId(`${testId}-dateReviewed`);
    const commentsInput = screen.getByTestId(`${testId}-comments`);
    const submitBtn = screen.getByTestId(`${testId}-submit`);

    fireEvent.change(itemIdInput, { target: { value: "1" } });
    fireEvent.change(emailInput, { target: { value: "u@ucsb.edu" } });
    fireEvent.change(starsInput, { target: { value: "0" } }); // below min
    fireEvent.change(dateInput, { target: { value: "2025-10-01T12:00" } });
    fireEvent.change(commentsInput, { target: { value: "ok" } });

    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/stars must be between 1 and 5/i)
    ).toBeInTheDocument();
  });

  test("shows max length message for comments > 500", async () => {
    renderForm({ submitAction: vi.fn() });

    const itemIdInput = await screen.findByTestId(`${testId}-itemId`);
    const emailInput = screen.getByTestId(`${testId}-reviewerEmail`);
    const starsInput = screen.getByTestId(`${testId}-stars`);
    const dateInput = screen.getByTestId(`${testId}-dateReviewed`);
    const commentsInput = screen.getByTestId(`${testId}-comments`);
    const submitBtn = screen.getByTestId(`${testId}-submit`);

    fireEvent.change(itemIdInput, { target: { value: "1" } });
    fireEvent.change(emailInput, { target: { value: "u@ucsb.edu" } });
    fireEvent.change(starsInput, { target: { value: "5" } });
    fireEvent.change(dateInput, { target: { value: "2025-10-01T12:00" } });
    fireEvent.change(commentsInput, {
      target: { value: "x".repeat(501) },
    });

    fireEvent.click(submitBtn);

    expect(await screen.findByText(/max 500 characters\./i)).toBeInTheDocument();
  });

  test("accepts a valid email and does not show email error", async () => {
    const onSubmit = vi.fn();
    renderForm({ submitAction: onSubmit });

    const itemIdInput = await screen.findByTestId(`${testId}-itemId`);
    const emailInput = screen.getByTestId(`${testId}-reviewerEmail`);
    const starsInput = screen.getByTestId(`${testId}-stars`);
    const dateInput = screen.getByTestId(`${testId}-dateReviewed`);
    const commentsInput = screen.getByTestId(`${testId}-comments`);
    const submitBtn = screen.getByTestId(`${testId}-submit`);

    fireEvent.change(itemIdInput, { target: { value: "2" } });
    fireEvent.change(emailInput, { target: { value: "valid.user@ucsb.edu" } });
    fireEvent.change(starsInput, { target: { value: "4" } });
    fireEvent.change(dateInput, { target: { value: "2025-10-02T08:15" } });
    fireEvent.change(commentsInput, { target: { value: "looks good" } });

    fireEvent.click(submitBtn);

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(screen.queryByText(/invalid email address/i)).toBeNull();
  });

  test("rejects invalid emails that a weaker regex might accept", async () => {
    renderForm({ submitAction: vi.fn() });

    const emailInput = await screen.findByTestId(`${testId}-reviewerEmail`);
    const submitBtn = screen.getByTestId(`${testId}-submit`);

    fireEvent.change(emailInput, { target: { value: "a@b" } }); // missing dot & TLD
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/invalid email address/i)
    ).toBeInTheDocument();
  });

  // 关键：若去掉 ^，下面前缀垃圾会被错误接受，从而本断言失败（击杀变异）
  test("rejects email with leading junk even if it contains a valid email substring", async () => {
    renderForm({ submitAction: vi.fn() });

    const itemIdInput = await screen.findByTestId(`${testId}-itemId`);
    const emailInput = screen.getByTestId(`${testId}-reviewerEmail`);
    const starsInput = screen.getByTestId(`${testId}-stars`);
    const dateInput = screen.getByTestId(`${testId}-dateReviewed`);
    const commentsInput = screen.getByTestId(`${testId}-comments`);
    const submitBtn = screen.getByTestId(`${testId}-submit`);

    fireEvent.change(itemIdInput, { target: { value: "1" } });
    fireEvent.change(emailInput, { target: { value: "xxx valid.user@ucsb.edu" } }); // 前缀空格垃圾
    fireEvent.change(starsInput, { target: { value: "3" } });
    fireEvent.change(dateInput, { target: { value: "2025-10-02T08:15" } });
    fireEvent.change(commentsInput, { target: { value: "x" } });

    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/invalid email address/i)
    ).toBeInTheDocument();
  });

  // 关键：若去掉 $，下面后缀垃圾会被错误接受，从而本断言失败（击杀变异）
  test("rejects email with trailing junk even if it contains a valid email substring", async () => {
    renderForm({ submitAction: vi.fn() });

    const itemIdInput = await screen.findByTestId(`${testId}-itemId`);
    const emailInput = screen.getByTestId(`${testId}-reviewerEmail`);
    const starsInput = screen.getByTestId(`${testId}-stars`);
    const dateInput = screen.getByTestId(`${testId}-dateReviewed`);
    const commentsInput = screen.getByTestId(`${testId}-comments`);
    const submitBtn = screen.getByTestId(`${testId}-submit`);

    fireEvent.change(itemIdInput, { target: { value: "1" } });
    fireEvent.change(emailInput, { target: { value: "valid.user@ucsb.edu xxx" } }); // 后缀空格垃圾
    fireEvent.change(starsInput, { target: { value: "3" } });
    fireEvent.change(dateInput, { target: { value: "2025-10-02T08:15" } });
    fireEvent.change(commentsInput, { target: { value: "x" } });

    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/invalid email address/i)
    ).toBeInTheDocument();
  });
});
