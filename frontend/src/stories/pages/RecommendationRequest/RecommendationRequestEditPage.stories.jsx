import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import { http, HttpResponse } from "msw";

import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RecommendationRequestEditPage";

export default {
  title: "pages/RecommendationRequest/RecommendationRequestEditPage",
  component: RecommendationRequestEditPage,
};

const Template = () => <RecommendationRequestEditPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    // Logged in user
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    // No special system info
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    // Mock fetch single recommendation request
   http.get("/api/recommendationrequests", () => {
  return HttpResponse.json(recommendationRequestFixtures.oneRequest, { status: 200 });
}),
    // Mock PUT update
    http.put("/api/recommendationrequests", async ({ request }) => {
  const body = await request.json();         
  return HttpResponse.json(
    { ...body, id: body.id ??  recommendationRequestFixtures.oneRequest.id },
    { status: 200 }
  );
}),
  ],
};
