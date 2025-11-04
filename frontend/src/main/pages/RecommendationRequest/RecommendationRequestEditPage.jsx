import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams, Navigate } from "react-router";
import { toast } from "react-toastify";

import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { useBackend, useBackendMutation } from "main/utils/useBackend";

export default function RecommendationRequestEditPage({ storybook = false }) {
  const { id } = useParams();

  
  const { data: request } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/recommendationrequests?id=${id}`], 
    {
      // Stryker disable next-line all : GET is the default, so changing this to "" doesn't introduce a bug
      method: "GET",
      url: "/api/recommendationrequests",
      params: { id },
    }
  );

 
  const objectToAxiosPutParams = (req) => ({
    url: "/api/recommendationrequests",
    method: "PUT",
    params: { id: req.id }, 
    data: {
      requesterEmail: req.requesterEmail,
      professorEmail: req.professorEmail,
      explanation: req.explanation,
      dateRequested: req.dateRequested,
      dateNeeded: req.dateNeeded,
      done: req.done,
    },
  });

  const onSuccess = (updated) => {
    toast(`RecommendationRequest Updated - id: ${updated.id}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/recommendationrequests?id=${id}`]
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    
    mutation.mutate({ ...data, id });
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/recommendationrequests" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Recommendation Request</h1>
        {request && (
          <RecommendationRequestForm
            initialContents={request}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
