import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";
import { toast } from "react-toastify";

/**
 * 导出命名函数，便于测试中直接调用，制造缺字段的 cell，杀掉 OptionalChaining 变异体
 */
export const buildDeleteParams = (cell) => {
  const id = cell?.row?.values?.id ?? cell?.row?.original?.id;
  return {
    url: "/api/menuitemreview",
    method: "DELETE",
    params: { id },
  };
};

/**
 * 导出命名函数，测试断言 toast.success 的参数，杀掉 BlockStatement/StringLiteral 变异体
 */
export const onDeleteSuccess = (message) => {
  // 后端 message 可选
  console.log(message);
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

  // 使用 mutateAsync 并 await，避免测试中请求未触发的问题
  // Stryker disable next-line all : TODO try to make a good test for this
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

