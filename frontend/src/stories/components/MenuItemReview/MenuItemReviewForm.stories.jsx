import React from "react";
import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";

export default {
  title: "components/MenuItemReview/MenuItemReviewForm",
  component: MenuItemReviewForm,
};

const Template = (args) => <MenuItemReviewForm {...args} />;

export const Create = Template.bind({});
Create.args = {
  buttonLabel: "Create",
  submitAction: (data) => {
    console.log("Submit clicked with data:", data);
    window.alert("Submit clicked with data: " + JSON.stringify(data));
  },
};

export const Update = Template.bind({});
Update.args = {
  initialContents: menuItemReviewFixtures.threeReviews[0],
  buttonLabel: "Update",
  submitAction: (data) => {
    console.log("Submit clicked with data:", data);
    window.alert("Submit clicked with data: " + JSON.stringify(data));
  },
};