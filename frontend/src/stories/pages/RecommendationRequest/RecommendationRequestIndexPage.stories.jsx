import React from "react";
import { http, HttpResponse } from "msw";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

import RecommendationRequestIndexPage from "main/pages/RecommendationRequest/RecommendationRequestIndexPage";

export default {
  title: "pages/RecommendationRequest/RecommendationRequestIndexPage",
  component: RecommendationRequestIndexPage,
};

const Template = () => <RecommendationRequestIndexPage storybook={true} />;

export const Empty = Template.bind({});
Empty.parameters = {
  msw: [
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.userOnly, { status: 200 })
    ),
    http.get("/api/systemInfo", () =>
      HttpResponse.json(systemInfoFixtures.showingNeither, { status: 200 })
    ),
    http.get("/api/recommendationrequests/all", () =>
      HttpResponse.json([], { status: 200 })
    ),
  ],
};

export const ThreeItemsOrdinaryUser = Template.bind({});
ThreeItemsOrdinaryUser.parameters = {
  msw: [
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.userOnly, { status: 200 })
    ),
    http.get("/api/systemInfo", () =>
      HttpResponse.json(systemInfoFixtures.showingNeither, { status: 200 })
    ),
    http.get("/api/recommendationrequests/all", () =>
      HttpResponse.json(recommendationRequestFixtures.threeRequests, { status: 200 })
    ),
  ],
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.parameters = {
  msw: [
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.adminUser, { status: 200 })
    ),
    http.get("/api/systemInfo", () =>
      HttpResponse.json(systemInfoFixtures.showingNeither, { status: 200 })
    ),
    http.get("/api/recommendationrequests/all", () =>
      HttpResponse.json(recommendationRequestFixtures.threeRequests, { status: 200 })
    ),
    
    http.delete("/api/recommendationrequests", () =>
      HttpResponse.json({}, { status: 200 })
    ),
  ],
};
