import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import React from "react";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const original = await vi.importActual("react-router");
  return {
    ...original,
    useNavigate: () => mockedNavigate,
  };
});

describe("RecommendationRequestForm tests", () => {
  const testId = "RecommendationRequestForm";

  const expectedHeaders = [
    "Your Email",
    "Professor Email",
    "Explanation",
    "Date Requested (ISO)",
    "Date Needed (ISO)",
    "Done",
  ];

  test("renders correctly with no initialContents", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>
    );

    // 按钮文本与主要标签
    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((h) => {
      expect(screen.getByText(h)).toBeInTheDocument();
    });

    // 关键控件
    expect(screen.getByTestId(`${testId}-submit`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-requesterEmail`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-professorEmail`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-explanation`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-dateRequested`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-dateNeeded`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-done`)).toBeInTheDocument();

    // 不应显示 Id
    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
    expect(screen.queryByText("Id")).not.toBeInTheDocument();
  });

  test("with initialContents, fields are prefilled from defaultValues", () => {
  const initial = {
    id: 7,
    requesterEmail: "a@ucsb.edu",
    professorEmail: "p@ucsb.edu",
    explanation: "prefilled",
    dateRequested: "2024-05-01T10:00",
    dateNeeded: "2024-06-01T10:00",
    done: true,
  };

  render(
    <Router>
      <RecommendationRequestForm initialContents={initial} />
    </Router>
  );

  expect(screen.getByTestId("RecommendationRequestForm-requesterEmail")).toHaveValue("a@ucsb.edu");
  expect(screen.getByTestId("RecommendationRequestForm-professorEmail")).toHaveValue("p@ucsb.edu");
  expect(screen.getByTestId("RecommendationRequestForm-explanation")).toHaveValue("prefilled");
  expect(screen.getByTestId("RecommendationRequestForm-dateRequested")).toHaveValue("2024-05-01T10:00");
  expect(screen.getByTestId("RecommendationRequestForm-dateNeeded")).toHaveValue("2024-06-01T10:00");
  expect(screen.getByTestId("RecommendationRequestForm-done")).toBeChecked();   // 复选框也要断言
});

test("without initialContents, fields are empty / unchecked", () => {
  render(
    <Router>
      <RecommendationRequestForm />
    </Router>
  );

  expect(screen.getByTestId("RecommendationRequestForm-requesterEmail")).toHaveValue("");
  expect(screen.getByTestId("RecommendationRequestForm-professorEmail")).toHaveValue("");
  expect(screen.getByTestId("RecommendationRequestForm-explanation")).toHaveValue("");
  expect(screen.getByTestId("RecommendationRequestForm-dateRequested")).toHaveValue("");
  expect(screen.getByTestId("RecommendationRequestForm-dateNeeded")).toHaveValue("");
  expect(screen.getByTestId("RecommendationRequestForm-done")).not.toBeChecked();
});

  test("renders correctly when passing in initialContents", async () => {
    const initial = {
      id: 42,
      requesterEmail: "me@ucsb.edu",
      professorEmail: "prof@ucsb.edu",
      explanation: "pls write a letter",
      dateRequested: "2024-05-27T13:45",
      dateNeeded: "2024-06-01T12:00",
      done: false,
    };

    render(
      <Router>
        <RecommendationRequestForm initialContents={initial} />
      </Router>
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    expectedHeaders.forEach((h) => expect(screen.getByText(h)).toBeInTheDocument());

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText("Id")).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>
    );

    const cancel = await screen.findByTestId(`${testId}-cancel`);
    fireEvent.click(cancel);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("user can toggle done checkbox", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>
    );

    const chk = await screen.findByTestId(`${testId}-done`);
    expect(chk).not.toBeChecked();
    fireEvent.click(chk);
    expect(chk).toBeChecked();
    fireEvent.click(chk);
    expect(chk).not.toBeChecked();
  });

  test("shows validation errors when submitting empty form", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>
    );

    const submit = await screen.findByText(/Create/);
    fireEvent.click(submit);

    expect(await screen.findByText("Requester email is required.")).toBeInTheDocument();
    expect(screen.getByText("Professor email is required.")).toBeInTheDocument();
    expect(screen.getByText("Please provide an explanation.")).toBeInTheDocument();
    expect(screen.getByText("Date Requested is required (ISO).")).toBeInTheDocument();
    expect(screen.getByText("Date Needed is required (ISO).")).toBeInTheDocument();
  });

  


  test("that the correct validations are performed (explanation min length)", async () => {
    render(
      <Router>
        <RecommendationRequestForm />
      </Router>
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submit = screen.getByText(/Create/);

    // explanation 太短
    const explanation = screen.getByTestId(`${testId}-explanation`);
    fireEvent.change(explanation, { target: { value: "hi" } });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText("Too short.")).toBeInTheDocument();
    });
  });


test("rejects invalid date format in dateRequested", async () => {
  const submitAction = vi.fn();
  
  render(
    <Router>
      <RecommendationRequestForm submitAction={submitAction} />
    </Router>
  );

  // 填写其他必填字段
  fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
    target: { value: "student@ucsb.edu" },
  });
  fireEvent.change(screen.getByTestId(`${testId}-professorEmail`), {
    target: { value: "prof@ucsb.edu" },
  });
  fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
    target: { value: "Valid explanation" },
  });
  fireEvent.change(screen.getByTestId(`${testId}-dateNeeded`), {
    target: { value: "2024-06-01T12:00" },
  });

  // 输入无效的日期格式
  const dateRequestedInput = screen.getByTestId(`${testId}-dateRequested`);
  fireEvent.change(dateRequestedInput, {
    target: { value: "2024/05/27 13:45" },
  });

  fireEvent.click(screen.getByTestId(`${testId}-submit`));

  await waitFor(() => {
    expect(screen.getByText("Date Requested is required (ISO).")).toBeInTheDocument();
  });
  
  expect(submitAction).not.toHaveBeenCalled();
});

test("rejects invalid date format in dateNeeded", async () => {
  const submitAction = vi.fn();
  
  render(
    <Router>
      <RecommendationRequestForm submitAction={submitAction} />
    </Router>
  );

  fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
    target: { value: "student@ucsb.edu" },
  });
  fireEvent.change(screen.getByTestId(`${testId}-professorEmail`), {
    target: { value: "prof@ucsb.edu" },
  });
  fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
    target: { value: "Valid explanation" },
  });
  fireEvent.change(screen.getByTestId(`${testId}-dateRequested`), {
    target: { value: "2024-05-27T13:45" },
  });

  // 无效格式
  const dateNeededInput = screen.getByTestId(`${testId}-dateNeeded`);
  fireEvent.change(dateNeededInput, {
    target: { value: "invalid-date-format" },
  });

  fireEvent.click(screen.getByTestId(`${testId}-submit`));

  await waitFor(() => {
    expect(screen.getByText("Date Needed is required (ISO).")).toBeInTheDocument();
  });
  
  expect(submitAction).not.toHaveBeenCalled();
});




test("rejects date with only year and month", async () => {
  const submitAction = vi.fn();
  
  render(
    <Router>
      <RecommendationRequestForm submitAction={submitAction} />
    </Router>
  );

  fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
    target: { value: "student@ucsb.edu" },
  });
  fireEvent.change(screen.getByTestId(`${testId}-professorEmail`), {
    target: { value: "prof@ucsb.edu" },
  });
  fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
    target: { value: "Valid explanation" },
  });
  fireEvent.change(screen.getByTestId(`${testId}-dateNeeded`), {
    target: { value: "2024-06-01T12:00" },
  });

  // 只有年月，缺少日期和时间
  fireEvent.change(screen.getByTestId(`${testId}-dateRequested`), {
    target: { value: "2024-05" },
  });

  fireEvent.click(screen.getByTestId(`${testId}-submit`));

  await waitFor(() => {
    expect(screen.getByText("Date Requested is required (ISO).")).toBeInTheDocument();
  });
  
  expect(submitAction).not.toHaveBeenCalled();
});



test("rejects time without date", async () => {
  const submitAction = vi.fn();
  
  render(
    <Router>
      <RecommendationRequestForm submitAction={submitAction} />
    </Router>
  );

  fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
    target: { value: "student@ucsb.edu" },
  });
  fireEvent.change(screen.getByTestId(`${testId}-professorEmail`), {
    target: { value: "prof@ucsb.edu" },
  });
  fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
    target: { value: "Valid explanation" },
  });
  fireEvent.change(screen.getByTestId(`${testId}-dateNeeded`), {
    target: { value: "2024-06-01T12:00" },
  });

  // 只有时间，没有日期
  fireEvent.change(screen.getByTestId(`${testId}-dateRequested`), {
    target: { value: "13:45" },
  });

  fireEvent.click(screen.getByTestId(`${testId}-submit`));

  await waitFor(() => {
    expect(screen.getByText("Date Requested is required (ISO).")).toBeInTheDocument();
  });
  
  expect(submitAction).not.toHaveBeenCalled();
});

test("accepts valid date at edge of valid range", async () => {
  const submitAction = vi.fn();
  
  render(
    <Router>
      <RecommendationRequestForm submitAction={submitAction} />
    </Router>
  );

  fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
    target: { value: "student@ucsb.edu" },
  });
  fireEvent.change(screen.getByTestId(`${testId}-professorEmail`), {
    target: { value: "prof@ucsb.edu" },
  });
  fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
    target: { value: "Valid explanation" },
  });
  
  // 边界值测试
  fireEvent.change(screen.getByTestId(`${testId}-dateRequested`), {
    target: { value: "2024-01-01T00:00" },
  });
  fireEvent.change(screen.getByTestId(`${testId}-dateNeeded`), {
    target: { value: "2024-12-31T23:59" },
  });

  fireEvent.click(screen.getByTestId(`${testId}-submit`));

  await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));
});








  test("submits successfully with valid inputs and passes correct payload", async () => {
    const submitAction = vi.fn();

    render(
      <Router>
        <RecommendationRequestForm submitAction={submitAction} />
      </Router>
    );

    fireEvent.change(await screen.findByTestId(`${testId}-requesterEmail`), {
      target: { value: "student@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-professorEmail`), {
      target: { value: "prof@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "This is a valid explanation." },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateRequested`), {
      target: { value: "2024-05-27T13:45" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateNeeded`), {
      target: { value: "2024-06-01T12:00" },
    });
    const done = screen.getByTestId(`${testId}-done`);
    fireEvent.click(done);
    expect(done).toBeChecked();

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));
    const payload = submitAction.mock.calls[0][0];

    expect(payload).toEqual({
      requesterEmail: "student@ucsb.edu",
      professorEmail: "prof@ucsb.edu",
      explanation: "This is a valid explanation.",
      dateRequested: "2024-05-27T13:45",
      dateNeeded: "2024-06-01T12:00",
      done: true,
    });
  });
});
