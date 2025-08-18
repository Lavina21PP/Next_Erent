"use client";
import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, ArrowUpRight, X } from "lucide-react";
import { PropertyModelTest } from "./Type";
import Form from "./Form";

import { useRouter } from "next/navigation";
import Spinner from "@/components/frontend/ui/spinner";
import PopConfirm from "@/components/frontend/ui/PropConfirm/PopConfirm";
import { message } from "antd";
import hiddenBody from "@/components/frontend/managerDom/HiddenBody";

// ข้อมูลทรัพย์สินจำลอง
// Mock data for properties
const mockProperties: PropertyModelTest[] = [
  {
    id: 1,
    landlord_id: 2,
    name: "sdfsf",
    logo: "https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg",
    description: "sdfsdfsdf",
    address: "sdfdsf",
    price: "2300000",
    status: "AVAILABLE",
    subscription_id: null,
    propertyTypeName: "APARTMENT",
    created_at: "sfsfd",
    updated_at: "sfsf",
    latitude: "sfsf",
    longitude: "sfsf",
  },
  {
    id: 2,
    landlord_id: 2,
    name: "sdfsf",
    logo: "https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg",
    description: "sdfsdfsdf",
    address: "sdfdsf",
    price: "2300000",
    status: "AVAILABLE",
    subscription_id: null,
    propertyTypeName: "APARTMENT",
    created_at: "sfsfd",
    updated_at: "sfsf",
    latitude: "sfsf",
    longitude: "sfsf",
  },
  {
    id: 3,
    landlord_id: 2,
    name: "sdfsf5",
    logo: "https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg",
    description: "sdfsdfsdf",
    address: "sdfdsf",
    price: "2300000",
    status: "AVAILABLE",
    subscription_id: null,
    propertyTypeName: "APARTMENT",
    created_at: "sfsfd",
    updated_at: "sfsf",
    latitude: "sfsf",
    longitude: "sfsf",
  },
  {
    id: 4,
    landlord_id: 2,
    name: "sdfsf",
    logo: "https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg",
    description: "sdfsdfsdf",
    address: "sdfdsf",
    price: "2300000",
    status: "AVAILABLE",
    subscription_id: null,
    propertyTypeName: "APARTMENT",
    created_at: "sfsfd",
    updated_at: "sfsf",
    latitude: "sfsf",
    longitude: "sfsf",
  },
];

// คอมโพเนนต์การ์ดสำหรับแสดงทรัพย์สินแต่ละรายการ
// Property card component
const PropertyCard: React.FC<{
  property: PropertyModelTest;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ property, onEdit, onDelete }) => {
  const router = useRouter();

  //go to path...
  const goToAbout = (path: string) => {
    router.push(path);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 relative">
      {/* ส่วนรูปภาพ */}
      <img
        src={property.logo}
        alt={property.name}
        className="w-full h-48 object-cover"
      />

      {/* ไอคอนสำหรับดูรายละเอียดที่มุมขวาบน */}
      <button
        // onClick={() => navigate(`/landlord/property-detail/${property.id}`)}
        className="absolute top-4 right-4 bg-white bg-opacity-80 p-2 rounded-full shadow-md text-gray-800 hover:bg-gray-100 transition-colors"
        aria-label="ดูรายละเอียด"
        title="ดูรายละเอียด"
      >
        <ArrowUpRight size={20} />
      </button>

      {/* ส่วนเนื้อหาของการ์ด */}
      <div className="p-4 space-y-3">
        <h3 className="text-xl font-bold text-gray-800">{property.name}</h3>
        <div className="text-sm text-gray-500">
          <p className="font-semibold text-gray-600">
            ທີ່ຢູ່: {property.address}
          </p>
        </div>
        <div className="text-sm font-semibold">
          ສະຖານະ:
          <span
            className={`ml-2 px-2 py-1 rounded-full text-xs font-bold text-white
              ${property.status === "AVAILABLE" ? "bg-green-500" : ""}
              ${property.status === "RENTED" ? "bg-yellow-500" : ""}
              ${property.status === "INACTIVE" ? "bg-red-500" : ""}
            `}
          >
            {property.status === "AVAILABLE" && "ວ່າງ"}
            {property.status === "RENTED" && "ມີຜູ້ເຊົ່າແລ້ວ"}
            {property.status === "INACTIVE" && "ປິດໃຊ້ງານ"}
          </span>
        </div>
        <div className="text-lg font-bold text-blue-600">
          {new Intl.NumberFormat("th-TH", {
            style: "currency",
            currency: "THB",
            minimumFractionDigits: 0,
          }).format(Number(property.price))}
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
const MyProperties = () => {
  const [properties, setProperties] =
    useState<PropertyModelTest[]>(mockProperties);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyModelTest | null>(null);
  const [statusForm, setStatusForm] = useState<string>("");
  const [openPopConfirm, setOpenPopConfirm] = useState<boolean>(false);

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

  const handleEditProperty = (updatedProperty: PropertyModelTest) => {
    setProperties(
      properties.map((p) => (p.id === updatedProperty.id ? updatedProperty : p))
    );
    setSelectedProperty(null);
  };

  const handleAddProperty = (newProperty: Omit<PropertyModelTest, "id">) => {
    const newId = properties.length + 1;
    setProperties([...properties, { ...newProperty, id: newId }]);
  };

  const handleDeleteProperty = () => {
    if (selectedProperty) {
      setProperties(properties.filter((p) => p.id !== selectedProperty.id));
      setOpenPopConfirm(false);
      success({
        type: "success",
        text: `Delete Property ID: ${selectedProperty.id} Successfully!`,
      });
      setSelectedProperty(null);
    }
  };

  const handleEditClick = ({
    property,
    statusForm,
  }: {
    property: PropertyModelTest;
    statusForm: string;
  }) => {
    setStatusForm(statusForm);
    setSelectedProperty(property);
    setIsFormModalOpen(true);
  };
  const handleOpenFormModel = ({ statusForm }: { statusForm: string }) => {
    setStatusForm(statusForm);
    setSelectedProperty(null);
    setIsFormModalOpen(true);
  };
  const handleCloseFormModel = () => {
    setSelectedProperty(null);
    setIsFormModalOpen(false);
  };

  const handleDeleteClick = (property: PropertyModelTest) => {
    setSelectedProperty(property);
    setOpenPopConfirm(true);
  };

  return (
    <div>
      <div className="bg-gray-50 min-h-screen py-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          isOpen={isFormModalOpen}
          onClose={handleCloseFormModel}
          onAddProperty={handleAddProperty}
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
