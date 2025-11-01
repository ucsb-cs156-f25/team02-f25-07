/* eslint-disable react-refresh/only-export-components */
import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";
import { toast } from "react-toastify";


export const buildDeleteParams = (cell) => {
  const id = cell?.row?.values?.id ?? cell?.row?.original?.id;
  return {
    url: "/api/menuitemreview",
    method: "DELETE",
    params: { id },
  };
};

export const onDeleteSuccess = (_message) => {
  void _message;
  toast.success("MenuItemReview deleted successfully");
};

export default function MenuItemReviewTable({
  menuItemReviews,
  currentUser,
  testIdPrefix = "MenuItemReviewTable",
}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/menuitemreview/edit/${cell.row.original.id}`);
  };

  // Stryker disable all : hard to test for query caching
  const deleteMutation = useBackendMutation(
    buildDeleteParams,
    { onSuccess: onDeleteSuccess },
    ["/api/menuitemreview/all"],
  );
  // Stryker restore all

  const deleteCallback = async (cell) => {
    await deleteMutation.mutateAsync(cell);
  };

  const columns = [
    { header: "id", accessorKey: "id" },
    { header: "Item ID", accessorKey: "itemId" },
    { header: "Reviewer Email", accessorKey: "reviewerEmail" },
    { header: "Stars", accessorKey: "stars" },
    { header: "Date Reviewed", accessorKey: "dateReviewed" },
    { header: "Comments", accessorKey: "comments" },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, testIdPrefix));
    columns.push(ButtonColumn("Delete", "danger", deleteCallback, testIdPrefix));
  }

  return (
    <OurTable
      data={menuItemReviews}
      columns={columns}
      testid={testIdPrefix}
    />
  );
}