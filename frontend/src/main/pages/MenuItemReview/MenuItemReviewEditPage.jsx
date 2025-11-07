import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams, Navigate } from "react-router";
import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function MenuItemReviewEditPage({ storybook = false }) {
  const { id } = useParams();

  const {
    data: menuItemReview,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/menuitemreview?id=${id}`],
    {
      // Stryker disable next-line all : GET is default
      method: "GET",
      url: "/api/menuitemreview",
      params: { id },
    },
  );

  const objectToAxiosPutParams = (mir) => ({
    url: "/api/menuitemreview",
    method: "PUT",
    params: { id: mir.id },
    data: {
      itemId: mir.itemId,
      reviewerEmail: mir.reviewerEmail,
      stars: mir.stars,
      dateReviewed: mir.dateReviewed,
      comments: mir.comments,
    },
  });

  const onSuccess = (mir) => {
    toast(
      `MenuItemReview Updated - id: ${mir.id} itemId: ${mir.itemId} stars: ${mir.stars}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/menuitemreview?id=${id}`],
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
        <h1>Edit Menu Item Review</h1>
        {menuItemReview && (
          <MenuItemReviewForm
            initialContents={menuItemReview}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
