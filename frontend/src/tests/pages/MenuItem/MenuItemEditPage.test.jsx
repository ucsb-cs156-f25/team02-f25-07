import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend } from "main/utils/useBackend";
import { useParams, Navigate } from "react-router-dom";
import MenuItemForm from "main/components/MenuItem/MenuItemForm";
import { toast } from "react-toastify";

export default function MenuItemEditPage() {
  const { id } = useParams();

  const objectToAxiosGetParams = {
    url: "/api/ucsbdiningcommonsmenuitem",
    method: "GET",
    params: { id },
  };

  const {
    data: menuItem,
    error: errorMenuItem,
    status: statusMenuItem,
  } = useBackend(objectToAxiosGetParams);

  const objectToAxiosPutParams = (menuItem) => ({
    url: "/api/ucsbdiningcommonsmenuitem",
    method: "PUT",
    params: { id: menuItem.id }, // ✅ mutation-killing
    data: {
      diningCommonsCode: menuItem.diningCommonsCode,
      name: menuItem.name,
      station: menuItem.station,
    },
  });

  const onSubmit = async (menuItem) => {
    await objectToAxiosPutParams(menuItem);
    toast(`Menu Item Updated - id: ${menuItem.id} name: ${menuItem.name}`);
    return <Navigate to="/ucsbdiningcommonsmenuitem" />;
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Menu Item</h1>
        {menuItem && (
          <MenuItemForm
            submitAction={onSubmit}
            buttonLabel={"Update"} // ✅ mutation-killing
            initialContents={menuItem}
          />
        )}
      </div>
    </BasicLayout>
  );
}
