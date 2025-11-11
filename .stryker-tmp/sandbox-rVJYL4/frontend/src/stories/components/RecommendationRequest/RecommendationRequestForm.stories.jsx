// @ts-nocheck
import React from "react";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
//import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures"; 

export default {
  title: "components/RecommendationRequest/RecommendationRequestForm",
  component: RecommendationRequestForm,
};

const Template = (args) => <RecommendationRequestForm {...args} />;

export const Create = Template.bind({});
Create.args = {
  buttonLabel: "Create",
  submitAction: (data) => {
    console.log("Submit was clicked with data: ", data);
    window.alert("Submit was clicked with data: " + JSON.stringify(data, null, 2));
  },
};

export const Update = Template.bind({});
Update.args = {
  initialContents: {
    id: 1,
    requesterEmail: "me@ucsb.edu",
    professorEmail: "prof@ucsb.edu",
    explanation: "Applying for graduate school; need a letter.",
    dateRequested: "2025-10-01T12:34",
    dateNeeded:   "2025-10-15T23:59",
    done: false,
  },
  buttonLabel: "Update",
  submitAction: (data) => {
    console.log("Submit was clicked with data: ", data);
    window.alert("Submit was clicked with data: " + JSON.stringify(data, null, 2));
  },
};
