import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import MenuItemForm from "main/components/MenuItem/MenuItemForm";
import { Navigate } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function MenuItemEditPage({ storybook = false }) {
  let { id } = useParams();

  const {
    data: MenuItem,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/ucsbdiningcommonsmenuitem?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default, so mutating this to "" doesn't introduce a bug
      method: "GET",
      url: `/api/ucsbdiningcommonsmenuitem`,
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (MenuItem) => ({
    url: "/api/ucsbdiningcommonsmenuitem",
    method: "PUT",
    params: {
      id: MenuItem.id,
    },
    data: {
      diningCommonsCode: MenuItem.diningCommonsCode,
      name: MenuItem.name,
      station: MenuItem.station,
    },
  });

  const onSuccess = (MenuItem) => {
    toast(`Menu Item Updated - id: ${MenuItem.id} name: ${MenuItem.name}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/ucsbdiningcommonsmenuitem?id=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/ucsbdiningcommonsmenuitem" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Menu Item</h1>
        {MenuItem && (
          <MenuItemForm
            submitAction={onSubmit}
            buttonLabel={"Update"}
            initialContents={MenuItem}
          />
        )}
      </div>
    </BasicLayout>
  );
}
