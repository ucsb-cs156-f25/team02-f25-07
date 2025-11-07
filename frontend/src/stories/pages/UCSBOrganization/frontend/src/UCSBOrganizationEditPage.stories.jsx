import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";
import { UCSBOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

export default {
  title: "pages/UCSBOrganization/UCSBOrganizationEditPage",
  component: UCSBOrganizationEditPage,
};

const Template = () => <UCSBOrganizationEditPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    // Current user info
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser, {
        status: 200,
      });
    }),

    // System info
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),

    // Mock GET request for the specific organization being edited
    http.get("/api/UCSBOrganization/all", () => {
      return HttpResponse.json(UCSBOrganizationFixtures.threeUCSBOrganizations);
    }),

    // Mock PUT request for saving the update
    http.put("/api/UCSBOrganization", (req) => {
      window.alert(
        "PUT to: " +
          req.url +
          "\n\nBody:\n" +
          JSON.stringify(req.body, null, 2),
      );
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};
