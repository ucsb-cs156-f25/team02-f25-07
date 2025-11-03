import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { UCSBOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import { http, HttpResponse } from "msw";

import UCSBOrganizationIndexPage from "main/pages/UCSBOrganization/UCSBOrganizationIndexPage";

export default {
  title: "pages/UCSBOrganization/UCSBOrganizationIndexPage",
  component: UCSBOrganizationIndexPage,
};

const Template = () => <UCSBOrganizationIndexPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
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
    http.get("/api/UCSBOrganization", () => {
      return HttpResponse.json(UCSBOrganizationFixtures.threeUCSBOrganizations[0], {
        status: 200,
      });
    }),
    http.put("/api/UCSBOrganization", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
    http.put("/api/UCSBOrganization", (req) => {
      window.alert("PUT: " + req.url + " and body: " + req.body);
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};
