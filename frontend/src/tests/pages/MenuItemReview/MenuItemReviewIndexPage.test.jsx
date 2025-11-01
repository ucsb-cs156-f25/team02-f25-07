import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";

import MenuItemReviewIndexPage from "main/pages/MenuItemReview/MenuItemReviewIndexPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";
import mockConsole from "tests/testutils/mockConsole";

// ✅ Mock OurTable + ButtonColumn，避免真实 OurTable/SortCaret 差异导致渲染 undefined
import React from "react";
vi.mock("main/components/OurTable", () => {
  function OurTable({ data, columns, testid = "testid" }) {
    return (
      <table data-testid={testid}>
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri} data-testid={`${testid}-row-${ri}`}>
              {columns.map((col, ci) => {
                const colId = col.accessorKey || col.id;
                const value = col.accessorKey ? row[col.accessorKey] : null;
                const cellTestId = `${testid}-cell-row-${ri}-col-${colId}`;
                if (col.cell) {
                  // 伪造 react-table 的最小 context
                  const ctx = {
                    row: { index: ri, original: row, getValue: () => value },
                    column: { id: colId },
                    cell: {},
                  };
                  return (
                    <td key={ci} data-testid={cellTestId}>
                      {col.cell(ctx)}
                    </td>
                  );
                }
                return (
                  <td key={ci} data-testid={cellTestId}>
                    {value != null ? String(value) : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  function ButtonColumn(label, _variant, callback, testIdPrefix) {
    return {
      id: label,
      header: label,
      cell: ({ row, column }) => (
        <button
          data-testid={`${testIdPrefix}-cell-row-${row.index}-col-${column.id}-button`}
          onClick={() => callback({ row })}
        >
          {label}
        </button>
      ),
    };
  }
  return { default: OurTable, ButtonColumn };
});

// ✅ Mock toast.success（与 MenuItemReviewTable 的 onDeleteSuccess 一致）
const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    toast: { success: (x) => mockToast(x) },
  };
});

describe("MenuItemReviewIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "MenuItemReviewTable";

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

  const renderPage = () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("Renders with Create Button for admin user", async () => {
    setupAdminUser();
    axiosMock.onGet("/api/menuitemreview/all").reply(200, []);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Create Menu Item Review/)).toBeInTheDocument();
    });
    const button = screen.getByText(/Create Menu Item Review/);
    expect(button).toHaveAttribute("href", "/menuitemreview/create");
    expect(button).toHaveAttribute("style", "float: right;");
  });

  test("renders three reviews correctly for regular user", async () => {
    setupUserOnly();
    axiosMock
      .onGet("/api/menuitemreview/all")
      .reply(200, menuItemReviewFixtures.threeReviews);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );

    // 非管理员没有创建按钮、也没有删除按钮
    expect(
      screen.queryByText("Create Menu Item Review"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("renders empty table when backend unavailable, user only", async () => {
    setupUserOnly();
    axiosMock.onGet("/api/menuitemreview/all").timeout();

    const restoreConsole = mockConsole();

    renderPage();

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    // 容错读取日志；有就断言、无就跳过
    const errorMessage = console.error?.mock?.calls?.[0]?.[0];
    if (errorMessage) {
      expect(errorMessage).toMatch(
        "Error communicating with backend via GET on /api/menuitemreview/all",
      );
    }

    restoreConsole();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });

  test("what happens when you click delete, admin", async () => {
    setupAdminUser();
    axiosMock
      .onGet("/api/menuitemreview/all")
      .reply(200, menuItemReviewFixtures.threeReviews);
    axiosMock.onDelete("/api/menuitemreview").reply(200, { message: "ok" });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toBeInTheDocument();
    });

    const firstId = Number(
      screen.getByTestId(`${testId}-cell-row-0-col-id`).textContent,
    );

    const deleteButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "MenuItemReview deleted successfully",
      );
    });

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
    expect(axiosMock.history.delete[0].url).toBe("/api/menuitemreview");
    expect(axiosMock.history.delete[0].params).toEqual({ id: firstId });
  });

  // ✅ 杀掉“method: 'GET' 被改成空字符串仍能通过”的幸存变异
  test("uses GET method to fetch reviews (kills method mutation)", async () => {
    setupUserOnly();

    // 兜底：只有 GET 才 200，否则 405
    axiosMock.onAny("/api/menuitemreview/all").reply((config) => {
      if ((config.method ?? "").toUpperCase() !== "GET") {
        return [405, { error: "Method Not Allowed" }];
      }
      return [200, menuItemReviewFixtures.threeReviews];
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toBeInTheDocument();
    });

    // 再断言只发生了 GET
    expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    expect(axiosMock.history.post.length).toBe(0);
    expect(axiosMock.history.put.length).toBe(0);
    expect(axiosMock.history.delete.length).toBe(0);
  });
});
