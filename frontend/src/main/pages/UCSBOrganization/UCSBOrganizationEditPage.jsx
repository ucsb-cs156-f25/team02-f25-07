import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { Navigate } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UCSBOrganizationEditPage({ storybook = false }) {
  // The key is orgCode, not id
  let { orgCode } = useParams();

  // GET the existing organization by orgCode
  const {
    data: ucsborganization,
    _error,
    _status,
  } = useBackend(
    // React Query key (must be unique per orgCode)
    [`/api/UCSBOrganization?orgCode=${orgCode}`],
    //[`/api/UCSBOrganization`, { params: { orgCode } }],
    {
      method: "GET",
      url: "/api/UCSBOrganization",
      //params: { orgCode: orgCode }, // send as query parameter
      params: { orgCode },
    },
  );

  // PUT request to update an organization
  const objectToAxiosPutParams = (ucsborganization) => ({
    url: "/api/UCSBOrganization",
    method: "PUT",
    params: { orgCode: ucsborganization.orgCode },
    data: {
      orgTranslationShort: ucsborganization.orgTranslationShort,
      orgTranslation: ucsborganization.orgTranslation,
      inactive: ucsborganization.inactive,
    },
  });

  // Toast after successful update
  const onSuccess = (ucsborganization) => {
    toast(`UCSBOrganization Updated - orgCode: ${ucsborganization.orgCode}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    [`/api/UCSBOrganization?orgCode=${orgCode}`],
    //[`/api/UCSBOrganization`, { params: { orgCode } }],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/ucsborganization" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit UCSBOrganization</h1>
        {ucsborganization && (
          <UCSBOrganizationForm
            submitAction={onSubmit}
            buttonLabel={"Update"}
            initialContents={ucsborganization}
          />
        )}
      </div>
    </BasicLayout>
  );
}
