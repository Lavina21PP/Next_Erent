"use client";
import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, ArrowUpRight, X, MapPin } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import Form from "./Form";

import { useRouter } from "next/navigation";
import Spinner from "@/components/frontend/ui/spinner";
import PopConfirm from "@/components/frontend/ui/PropConfirm/PopConfirm";
import { message } from "antd";
import hiddenBody from "../../managerDom/HiddenBody";
import axios from "axios";
import { useMessage } from "../../context/MessageContext";
import { PropertyTypeCreate, PropertyTypeResponse } from "./Type";
import { manager_property } from "@/services/api";
import { useRole } from "../../context/RoleContext";
import { deleteFolder } from "@/lib/api";

const PropertyCard: React.FC<{
  property: PropertyTypeResponse;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ property, onEdit, onDelete }) => {
  const router = useRouter();
  const { id } = useRole();

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 relative">
      {/* ส่วนรูปภาพ */}
      <div className="relative">
        <img
          src={
            property.coverImage
              ? `http://localhost:5000/image/${id}/cover_property/${property.uuid}/${property.coverImage}`
              : undefined
          }
          alt={property.name}
          // ปรับขนาดรูปภาพ responsive: เต็มความกว้างบนมือถือ, คงที่ 48h บนจอใหญ่
          className="w-full h-48 object-cover sm:h-48"
        />
        <div className="absolute top-3 right-3">
          <button
            className={`p-2 rounded-full transition-colors ${"bg-white/80 text-gray-600 hover:bg-white"}`}
            // onClick={() => navigate(`/landlord/property-detail/${property.id}`)}              aria-label="ดูรายละเอียด"
            title="ดูรายละเอียด"
          >
            <ArrowUpRight
              onClick={() =>
                router.push(`/landlord/myproperties/detail/${property.id}`)
              }
              size={20}
            />
          </button>
        </div>
        <div className="absolute top-3 left-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              property.property_status_id === 1
                ? "bg-green-500 text-white"
                : property.property_status_id === 2
                ? "bg-red-500 text-white"
                : property.property_status_id === 3 &&
                  "bg-orange-500 text-white"
            }`}
          >
            {property.property_status.name}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
            {property.property_type.name}
          </span>
        </div>
      </div>

      {/* ไอคอนสำหรับดูรายละเอียดที่มุมขวาบน */}

      {/* ส่วนเนื้อหาของการ์ด */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2">
          {property.name}
        </h3>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm sm:text-base">{property.address}</span>
        </div>
        <p className="text-gray-600 text-sm sm:text-base mb-3 line-clamp-2">
          {property.description}
        </p>

        <div>
          <span className="text-2xl sm:text-3xl font-bold text-blue-600">
            ฿{property.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </span>
          <span className="text-gray-500 text-sm sm:text-base ml-1">
            /month
          </span>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center p-2 rounded-lg bg-yellow-500 text-white font-medium hover:bg-yellow-600 transition-colors"
          >
            <Edit size={16} className="mr-2" /> ແກ້ໄຂ
          </button>
          <button
            onClick={onDelete}
            className="flex-1 flex items-center justify-center p-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            <Trash2 size={16} className="mr-2" /> ລົບ
          </button>
        </div>
      </div>
    </div>
  );
};

// คอมโพเนนต์หน้าหลัก "My Properties"
// The main "My Properties" page component
const MyProperties: React.FC<{ initialProperties: PropertyTypeResponse[] }> = ({
  initialProperties,
}) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyTypeResponse | null>(null);
  const [statusForm, setStatusForm] = useState<"create" | "update" | "">("");
  const { id } = useRole();

  const [openPopConfirm, setOpenPopConfirm] = useState<boolean>(false);

  const { showMessage } = useMessage();
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] =
    useState<PropertyTypeResponse[]>(initialProperties);
  //showMessagePop
  const [messageApi, contextHolder] = message.useMessage();
  const success = ({ type, text }: { type: any; text: string }) => {
    messageApi.open({
      type: type,
      content: text,
    });
  };

  useEffect(() => {
    if (openPopConfirm || isFormModalOpen) {
      hiddenBody(true);
    } else {
      hiddenBody(false);
    }
    return () => {
      hiddenBody(false);
    };
  }, [openPopConfirm, isFormModalOpen]);

  const refreshDataProperties = async () => {
    try {
      setIsLoading(true);
      const res = await manager_property.get_property({
        withCredentials: true,
      });
      setProperties(res.data.data);
    } catch (err) {
      console.error("Failed to refresh", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProperty = async (newProperty: PropertyTypeCreate) => {
    console.log("Submitting property data:", newProperty);
    const uuid = uuidv4();

    setIsLoading(true);
    try {
      let formData = new FormData();
      let formDataPyUpload = new FormData();
      formData.append("uuid", uuid);
      formData.append("name", newProperty.name);
      formData.append("description", newProperty.description);
      formData.append("address", newProperty.address);
      formData.append("price", newProperty.price);
      formData.append("status", String(newProperty.property_status_id));
      formData.append("property_type_id", String(newProperty.property_type_id));
      formData.append("latitude", newProperty.latitude);
      formData.append("longitude", newProperty.longitude);
      formDataPyUpload.append("user_id", String(id));
      if (newProperty.coverImage) {
        formDataPyUpload.append("coverImage", newProperty.coverImage);
      }

      newProperty.images.forEach((file) => formData.append("images", file));
      newProperty.images.forEach((file) =>
        formDataPyUpload.append("images", file)
      );

      formDataPyUpload.append("property_uuid", uuid);
      const res_py = await axios.post(
        "http://127.0.0.1:5000/upload_multiple",
        formDataPyUpload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (res_py.data.success) {
        console.log("upload on py success");
        formDataPyUpload = new FormData();

        formData.append(
          "name_cover_image_property",
          res_py.data.name_cover_image_property
        );
        res_py.data.name_image_property.forEach((img: any) =>
          formData.append("name_image_property", img)
        );

        const add_property = await manager_property.post_property(formData, {
          withCredentials: true,
        });

        if (add_property.data.success) {
          formData = new FormData();
          showMessage("success", add_property.data.message);
          handleCloseFormModel();
          refreshDataProperties();
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data.message) {
          showMessage("error", err.response.data.message);
        }
      } else {
        console.error("Unknown error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const onEditProperty = async (newProperty: PropertyTypeCreate) => {

    if (selectedProperty) {
      console.log("ksdf", newProperty);
      setIsLoading(true);
      try {
        let formData = new FormData();
        let formDataPyUpload = new FormData();
        formData.append("name", newProperty.name);
        formData.append("description", newProperty.description);
        formData.append("address", newProperty.address);
        formData.append("price", newProperty.price);
        formData.append("status", String(newProperty.property_status_id));
        formData.append(
          "property_type_id",
          String(newProperty.property_type_id)
        );
        formData.append("latitude", newProperty.latitude);
        formData.append("longitude", newProperty.longitude);
        formDataPyUpload.append("user_id", String(id));

        if (newProperty.coverImage) {
          if (newProperty.coverImage instanceof File) {
            formDataPyUpload.append("coverImage", newProperty.coverImage); // รูปใหม่
          } else {
            formDataPyUpload.append("coverImageOld", newProperty.coverImage); // ชื่อไฟล์เดิม
          }
        }

        if (newProperty.images.length) {
          newProperty.images.forEach((img) => {
            if (img instanceof File) {
              formDataPyUpload.append("images", img); // รูปใหม่
            } else if (typeof img === "string") {
              formDataPyUpload.append("imagesOld", img); // ชื่อไฟล์เดิม
            }
          });
        }

        formDataPyUpload.append("property_uuid", newProperty.uuid);

        for (let [key, value] of formDataPyUpload.entries()) {
          console.log("sss: ", key, value);
        }

        const res_py = await axios.post(
          "http://127.0.0.1:5000/upload_multiple_delete",
          formDataPyUpload,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (res_py.data.success) {
          console.log("upload on py success");
          formDataPyUpload = new FormData();

          formData.append(
            "name_cover_image_property",
            res_py.data.name_cover_image_property
          );
          res_py.data.name_image_property.forEach((img: any) =>
            formData.append("name_image_property", img)
          );

          const edit_property = await manager_property.put_property(formData, {
            withCredentials: true,
            params: { property_id: selectedProperty.id },
          });

          if (edit_property.data.success) {
            formData = new FormData();
            showMessage("success", edit_property.data.message);
            handleCloseFormModel();
            refreshDataProperties();
          }
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.data.message) {
            showMessage("error", err.response.data.message);
          }
        } else {
          console.error("Unknown error:", err);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteProperty = async () => {
    if (selectedProperty) {
      try {
        const res = await manager_property.delete_property({
          withCredentials: true,
          params: { property_id: selectedProperty.id },
        });

        if (!res)
          return success({
            type: "error",
            text: `ເກີດຂໍ້ຜິດພາດໃນການລົບ`,
          });

        const res_delete_folder_on_fastapi = await deleteFolder(
          String(id),
          selectedProperty.uuid
        );
        setOpenPopConfirm(false);
        success({
          type: "success",
          text: `ລົບເຮືອນເຊົ່າໄອດີ: ${selectedProperty.name} ສຳເລັດແລ້ວ!`,
        });
        setSelectedProperty(null);
        refreshDataProperties();
      } catch (err: any) {
        console.error(err);

        if (err.response) {
          console.log(
            `❌ Error: ${err.response.data.message || "ບໍ່ສາມາດລົບໄດ້"}`
          );
        } else {
          console.log("ເກີດຂໍ້ຜິດພາດໃນ Server");
        }
      } finally {
        // setLoading(false);
      }
    }
  };

  const handleEditClick = ({
    property,
    statusForm,
  }: {
    property: PropertyTypeResponse;
    statusForm: "create" | "update";
  }) => {
    setStatusForm(statusForm);
    setSelectedProperty(property);
    setIsFormModalOpen(true);
  };
  const handleOpenFormModel = ({
    statusForm,
  }: {
    statusForm: "create" | "update";
  }) => {
    setStatusForm(statusForm);
    setSelectedProperty(null);
    setIsFormModalOpen(true);
  };
  const handleCloseFormModel = () => {
    setSelectedProperty(null);
    setIsFormModalOpen(false);
    setStatusForm("");
  };

  const handleDeleteClick = (property: PropertyTypeResponse) => {
    setSelectedProperty(property);
    setOpenPopConfirm(true);
  };

  return (
    <div>
      <div className="bg-gray-50 p-6">
        <div className="">
          {/* ส่วนหัวของหน้า */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900">
              ເຮືອນເຊົ່າຂອງຂ້ອຍ
            </h1>
            <button
              onClick={() => handleOpenFormModel({ statusForm: "create" })}
              className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} className="mr-2" /> ເພີ່ມເຮືອນເຊົ່າ
            </button>
          </div>

          {/* แสดงผลรายการทรัพย์สินในรูปแบบ Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onEdit={() =>
                  handleEditClick({ property: property, statusForm: "update" })
                }
                onDelete={() => handleDeleteClick(property)}
              />
            ))}
          </div>
        </div>

        {/* Modal สำหรับเพิ่มทรัพย์สินใหม่ */}
        <Form
          isLoading={isLoading}
          isOpen={isFormModalOpen}
          onClose={handleCloseFormModel}
          onAddProperty={handleAddProperty}
          onEditProperty={onEditProperty}
          selectedProperty={selectedProperty}
          statusForm={statusForm}
        />

        {/* Modal สำหรับการยืนยันการลบ */}
      </div>
      <PopConfirm
        openPopConfirm={openPopConfirm}
        setOpenPopConfirm={setOpenPopConfirm}
        onConfirm={handleDeleteProperty}
        text={`Delete Property ID: ${selectedProperty && selectedProperty.id}?`}
      />
      {contextHolder}
    </div>
  );
};

export default MyProperties;
