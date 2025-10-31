import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/UCSBOrganizationUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";

export default function UCSBOrganizationTable({
  ucsborganizations,
  currentUser,
  testIdPrefix = "UCSBOrganizationTable",
}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/ucsborganizations/edit/${cell.row.original.id}`);
  };

  // Stryker disable all : hard to test for query caching

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/ucsborganizations/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      header: "id",
      accessorKey: "id", // accessor is the "key" in the data
    },

    {
      header: "OrgCode",
      accessorKey: "orgCode",
    },
    {
      header: "OrgTranslationShort",
      accessorKey: "orgTranslationShort",
    },
    {
      header: "OrgTranslation",
      accessorKey: "orgTranslation",
    },
    {
      header: "Inactive",
      accessorKey: "inactive",
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, testIdPrefix));
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, testIdPrefix),
      
    );
  }

  return (
    <OurTable
      data={ucsborganizations}
      columns={columns}
      testid={testIdPrefix}
    />
  );
}