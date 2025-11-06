import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { Navigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function MenuItemReviewCreatePage({ storybook = false }) {
  const objectToAxiosParams = (review) => ({
    url: "/api/menuitemreview/post",
    method: "POST",
    params: {
      itemId: review.itemId,
      reviewerEmail: review.reviewerEmail,
      stars: review.stars,
      dateReviewed: review.dateReviewed,
      comments: review.comments,
    },
  });

  const onSuccess = (created) => {
    toast(`New MenuItemReview Created - id: ${created.id}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },

    ["/api/menuitemreview/all"],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/menuitemreview" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create New Menu Item Review</h1>
        <MenuItemReviewForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
