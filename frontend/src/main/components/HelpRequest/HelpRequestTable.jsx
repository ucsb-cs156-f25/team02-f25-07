import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";

export default function HelpRequestTable({
  helpRequests,
  currentUser,
  testIdPrefix = "HelpRequestTable",
}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/helprequest/edit/${cell.row.original.id}`);
  };

  const deleteCallback = async (cell) => {
    // Delete functionality will be implemented later
    console.log("Delete callback for id: ", cell.row.original.id);
  };

  const columns = [
    {
      header: "id",
      accessorKey: "id", // accessor is the "key" in the data
    },
    {
      header: "Requester Email",
      accessorKey: "requesterEmail",
    },
    {
      header: "Team Id",
      accessorKey: "teamId",
    },
    {
      header: "Table/Breakout Room",
      accessorKey: "tableOrBreakoutRoom",
    },
    {
      header: "Request Time",
      accessorKey: "requestTime",
    },
    {
      header: "Explanation",
      accessorKey: "explanation",
    },
    {
      header: "Solved",
      accessorKey: "solved",
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, testIdPrefix));
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, testIdPrefix),
    );
  }

  return (
    <OurTable data={helpRequests} columns={columns} testid={testIdPrefix} />
  );
}
