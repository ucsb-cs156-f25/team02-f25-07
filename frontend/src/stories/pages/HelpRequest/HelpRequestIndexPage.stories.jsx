import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { HelpRequestFixtures } from "fixtures/HelpRequestFixtures";
import { http, HttpResponse } from "msw";

import HelpRequestIndexPage from "main/pages/HelpRequest/HelpRequestIndexPage";

export default {
  title: "pages/HelpRequest/HelpRequestIndexPage",
  component: HelpRequestIndexPage,
};

const Template = () => <HelpRequestIndexPage storybook={true} />;

export const Empty = Template.bind({});
Empty.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/helprequest/all", () => {
      return HttpResponse.json([], { status: 200 });
    }),
  ],
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/helprequest/all", () => {
      return HttpResponse.json(HelpRequestFixtures.threeRequests);
    }),
  ],
};

export const ThreeItemsAdminUser = Template.bind({});

ThreeItemsAdminUser.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/helprequest/all", () => {
      return HttpResponse.json(HelpRequestFixtures.threeRequests);
    }),
    http.delete("/api/helprequest", () => {
      return HttpResponse.json(
        { message: "HelpRequest deleted successfully" },
        { status: 200 },
      );
    }),
  ],
};
