import React from "react";
import { useBackend } from "main/utils/useBackend";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { Button } from "react-bootstrap";
import { useCurrentUser, hasRole } from "main/utils/useCurrentUser";

export default function RecommendationRequestIndexPage() {
  const currentUser = useCurrentUser();

  const createButton = () => {
    if (hasRole(currentUser, "ROLE_ADMIN")) {
      return (
        <Button
          variant="primary"
          href="/recommendationrequests/create"  
          style={{ float: "right" }}
        >
          Create Recommendation Request  {/*  */}
        </Button>
      );
    }
    return null;
  };

  const {
    data: requests,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/recommendationrequests/all"],
    { method: "GET", url: "/api/recommendationrequests/all" },
    []
  );

  return (
    <BasicLayout>
      <div className="pt-2">
<<<<<<< HEAD
        <h1>Index page for Recommendation Request (placeholder)</h1>
        <p>
          <a href="/recommendationrequest/create">Create</a>
        </p>
        <p>
          <a href="/recommendationrequest/edit/1">Edit</a>
        </p>
=======
        {createButton()}
        <h1>Recommendation Requests</h1>
        <RecommendationRequestTable requests={requests} currentUser={currentUser} />
>>>>>>> 369b98156adb6c3c838aba73c73525f8876c19cf
      </div>
    </BasicLayout>
  );
}

