import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import { onDeleteSuccess } from "main/utils/UCSBDateUtils";


import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";

export default function RecommendationRequestTable({ requests, currentUser }) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/recommendationrequests/edit/${cell.row.original.id}`);
  };

 
  
  const deleteMutation = useBackendMutation(
  (cell) => ({
    url: "/api/recommendationrequests",
    method: "DELETE",
    params: { id: cell.row.values.id },
  }),
  { onSuccess: onDeleteSuccess },
  ["/api/recommendationrequests/all"]
);


  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "Requester Email",
      accessorKey: "requesterEmail",
    },
    {
      header: "Professor Email",
      accessorKey: "professorEmail",
    },
    {
      header: "Explanation",
      accessorKey: "explanation",
    },
    {
      header: "Date Requested",
      accessorKey: "dateRequested",
    },
    {
      header: "Date Needed",
      accessorKey: "dateNeeded",
    },
    {
      header: "Done",
      accessorKey: "done",
      cell: (cell) => String(cell.getValue()), // true/false 显示
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(
      ButtonColumn("Edit", "primary", editCallback, "RecommendationRequestTable"),
    );
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, "RecommendationRequestTable"),
    );
  }

  return (
    <OurTable
      data={requests}
      columns={columns}
      testid={"RecommendationRequestTable"}
    />
  );
}
