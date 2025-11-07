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

    expect(
      screen.getByText("MenuItemReview Index page not yet implemented"),
    ).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });
});
