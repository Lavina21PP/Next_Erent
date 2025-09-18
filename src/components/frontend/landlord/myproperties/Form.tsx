import React, { useEffect, useState } from "react";
import { X, Upload, Trash2 } from "lucide-react";
import { GetEnumDB } from "@/services/api";
import { PropertyTypeCreate } from "./Type";
import { useRole } from "../../context/RoleContext";

interface PropertyType {
  id: number;
  name: string;
}

interface FormProps {
  isOpen: boolean;
  isLoading: boolean;
  selectedProperty: PropertyTypeCreate | null;
  statusForm: "create" | "update" | "";
  onClose: () => void;
  onAddProperty: (newProperty: PropertyTypeCreate) => void;
  onEditProperty: (newProperty: PropertyTypeCreate) => void;
}

interface SelectedImage {
  id: string; // unique id
  fileOrName: File | string;
  preview: string;
  isExisting?: boolean;
}

const Form: React.FC<FormProps> = ({
  isOpen,
  isLoading,
  selectedProperty,
  statusForm,
  onClose,
  onAddProperty,
  onEditProperty,
}) => {
  const defaultData: PropertyTypeCreate = {
    id: 0,
    uuid: '',
    user: {
      id: 0
    },
    name: "",
    description: "",
    address: "",
    price: "",
    images: [],
    favorite: [],
    property_image: [],
    property_status_id: 0,
    property_status: { id: 0, name: "" },
    property_type_id: 0,
    property_type: { id: 0, name: "" },
    latitude: "",
    longitude: "",
  };

  const { id } = useRole();
  const [formData, setFormData] = useState<PropertyTypeCreate>(defaultData);
  const [dataPropertyType, setDataPropertyType] = useState<PropertyType[]>([]);
  const [dataPropertyStatus, setDataPropertyStatus] = useState<PropertyType[]>(
    []
  );
  const [coverImage, setCoverImage] = useState<File | null | string>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [imageUploadError, setImageUploadError] = useState<string>("");
  const [isCoverImageExisting, setIsCoverImageExisting] = useState(false); // เพิ่ม state นี้

  useEffect(() => {
    if (statusForm === "create") {
      setFormData(defaultData);

      setCoverImage(null);
      setCoverImagePreview(null);
      setSelectedImages([]);
      setIsCoverImageExisting(false);

      
    } else if (statusForm === "update" && selectedProperty) {
      setFormData(selectedProperty);
      console.log('ddd', selectedProperty)
      // จัดการ Cover Image
      if (selectedProperty.coverImage) {
        setCoverImage(selectedProperty.coverImage);
        setCoverImagePreview(
          `http://localhost:5000/image/${id}/cover_property/${selectedProperty.uuid}/${selectedProperty.coverImage}`
        );
        setIsCoverImageExisting(true);
      } else {
        setCoverImage(null);
        setCoverImagePreview(null);
        setIsCoverImageExisting(false);
      }

      // จัดการรูปภาพเพิ่มเติม
      if (selectedProperty.property_image?.length > 0) {
        console.log('zz', selectedProperty.property_image)
        const images: SelectedImage[] = selectedProperty.property_image
          .filter((img) => img.image)
          .map((img) => ({
            id: img.id.toString(), // ใช้ id ของ DB
            fileOrName: img.image,
            preview: `http://localhost:5000/image/${id}/images_property/${selectedProperty.uuid}/${img.image}`,
            isExisting: true,
          }));

        setSelectedImages(images);
      } else {
        setSelectedImages([]);
      }
    }
  }, [statusForm, selectedProperty]);

  // ล้าง Object URLs เฉพาะรูปใหม่ที่สร้างจาก File objects
  useEffect(() => {
    return () => {
      selectedImages.forEach((img) => {
        if (!img.isExisting && img.fileOrName instanceof File) {
          URL.revokeObjectURL(img.preview);
        }
      });

      if (
        coverImagePreview &&
        !isCoverImageExisting &&
        coverImage instanceof File
      ) {
        URL.revokeObjectURL(coverImagePreview);
      }
    };
  }, [selectedImages, coverImagePreview, isCoverImageExisting, coverImage]);

  const get_type_property = async () => {
    try {
      const type_property = await GetEnumDB.type_property();
      if (type_property) setDataPropertyType(type_property.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const get_status_property = async () => {
    try {
      const status_property = await GetEnumDB.status_property();
      if (status_property) setDataPropertyStatus(status_property.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    get_type_property();
    get_status_property();
  }, []);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (
      file &&
      file.type.startsWith("image/") &&
      file.size <= 5 * 1024 * 1024
    ) {
      // ล้าง Object URL เดิมถ้าเป็นไฟล์ใหม่
      if (coverImagePreview && !isCoverImageExisting) {
        URL.revokeObjectURL(coverImagePreview);
      }

      setCoverImage(file);
      setCoverImagePreview(URL.createObjectURL(file));
      setIsCoverImageExisting(false);
      setImageUploadError("");
    } else {
      setImageUploadError("ເລືອກຮູບພາບທີ່ຂະໜາດໜ້ອຍກວ່າ 5MB");
    }
    e.target.value = "";
  };

  const handleAdditionalImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 6) {
      setImageUploadError("ສາມາດເລືອກໄດ້ສູງສຸດ 6 ຮູບ");
      return;
    }

    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      setImageUploadError("ເລືອກຮູບພາບທີ່ຂະໜາດໜ້ອຍກວ່າ 5MB");
    } else {
      setImageUploadError("");
    }

    const newImages: SelectedImage[] = validFiles.map((file) => ({
      id: crypto.randomUUID(), // หรือใช้ Date.now().toString()
      fileOrName: file,
      preview: URL.createObjectURL(file),
      isExisting: false,
    }));

    setSelectedImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const imageToRemove = selectedImages[index];

    // ล้าง Object URL เฉพาะรูปใหม่
    if (!imageToRemove.isExisting && imageToRemove.fileOrName instanceof File) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeCoverImage = () => {
    // ล้าง Object URL เฉพาะรูปใหม่
    if (coverImagePreview && !isCoverImageExisting) {
      URL.revokeObjectURL(coverImagePreview);
    }

    setCoverImage(null);
    setCoverImagePreview(null);
    setIsCoverImageExisting(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const propertyData = {
      ...formData,
      coverImage: coverImage,
      images: selectedImages.map((img) => img.fileOrName),
    };

    if (statusForm === "create") {
      onAddProperty(propertyData);
    } else if (statusForm === "update") {
      onEditProperty(propertyData);
      console.log(propertyData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/20 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 text-white p-6 relative">
          <h2 className="text-2xl font-medium">
            {statusForm === "create" ? "ເພີ່ມເຮືອນເຊົ່າໃໝ່" : "ແກ້ໄຂຂໍ້ມູນ"}
          </h2>
          <p className="text-gray-300 mt-1 text-sm">
            ກະລຸນາລົງລາຍລະອຽດເຮືອນເຊົ່າ
          </p>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-1"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="border border-gray-100 rounded-lg p-5">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  ຂໍ້ມູນພື້ນຖານ
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-gray-600 text-sm font-medium mb-2"
                      htmlFor="name"
                    >
                      ຊື່ເຮືອນເຊົ່າ *
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all bg-white text-sm"
                      placeholder="ເຊັ່ນ: ບ້ານສວຍ"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-600 text-sm font-medium mb-2"
                      htmlFor="address"
                    >
                      ທີ່ຢູ່ *
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all bg-white text-sm"
                      placeholder="ເຊັ່ນ: ບ້ານໂພນໄຊ, ນະຄອນຫຼວງວຽງຈັນ"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      className="block text-gray-600 text-sm font-medium mb-2"
                      htmlFor="description"
                    >
                      ລາຍລະອຽດ *
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all bg-white resize-none text-sm"
                      placeholder="ອະທິບາຍລາຍລະອຽດກ່ຽວກັບເຮືອນເຊົ່າ..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="border border-gray-100 rounded-lg p-5">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  ລາຍລະອຽດເຮືອນ
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      className="block text-gray-600 text-sm font-medium mb-2"
                      htmlFor="price"
                    >
                      ລາຄາ (ກີບ) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      value={formData.price || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all bg-white text-sm"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-600 text-sm font-medium mb-2"
                      htmlFor="property_status_id"
                    >
                      ສະຖານະ *
                    </label>
                    <select
                      name="property_status_id"
                      id="property_status_id"
                      value={formData.property_status_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all bg-white text-sm"
                      required
                    >
                      <option value="">-- ເລືອກສະຖານະ --</option>
                      {dataPropertyStatus?.map((status: PropertyType) => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-gray-600 text-sm font-medium mb-2"
                      htmlFor="property_type_id"
                    >
                      ປະເພດເຮືອນ *
                    </label>
                    <select
                      name="property_type_id"
                      id="property_type_id"
                      value={formData.property_type_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all bg-white text-sm"
                      required
                    >
                      <option value="">-- ເລືອກປະເພດ --</option>
                      {dataPropertyType?.map((type: PropertyType) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="border border-gray-100 rounded-lg p-5">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  ຕຳແໜ່ງພິກັດ
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-gray-600 text-sm font-medium mb-2"
                      htmlFor="latitude"
                    >
                      Latitude
                    </label>
                    <input
                      type="text"
                      name="latitude"
                      id="latitude"
                      value={formData.latitude || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all bg-white text-sm"
                      placeholder="17.9667"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-600 text-sm font-medium mb-2"
                      htmlFor="longitude"
                    >
                      Longitude
                    </label>
                    <input
                      type="text"
                      name="longitude"
                      id="longitude"
                      value={formData.longitude || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all bg-white text-sm"
                      placeholder="102.6000"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="border border-gray-100 rounded-lg p-5">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  ຮູບພາບເຮືອນເຊົ່າ
                </h3>

                {/* Cover Image Upload */}
                <div className="mb-6">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                    id="cover-image-upload"
                  />
                  <label
                    htmlFor="cover-image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      ຄລິກເພື່ອເລືອກຮູບພາບໜ້າປົກ
                    </span>
                  </label>
                  {coverImagePreview && (
                    <div className="relative mt-4 w-40 h-40 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={coverImagePreview}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeCoverImage}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional Images */}
                <div className="mb-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAdditionalImageChange}
                    className="hidden"
                    id="additional-image-upload"
                    disabled={selectedImages.length >= 6}
                  />
                  <label
                    htmlFor="additional-image-upload"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg transition-colors ${
                      selectedImages.length >= 6
                        ? "bg-gray-200 cursor-not-allowed"
                        : "bg-gray-50 hover:bg-gray-100 cursor-pointer"
                    }`}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      ເລືອກຮູບພາບເພີ່ມເຕີມ ({selectedImages.length}/6)
                    </span>
                  </label>
                  {imageUploadError && (
                    <p className="mt-2 text-sm text-red-500">
                      {imageUploadError}
                    </p>
                  )}
                </div>

                {/* Additional Image Previews */}
                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedImages.map((img, index) => (
                      <div key={img.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={img.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-lg">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {/* แสดงสถานะรูปภาพ */}
                        <div className="absolute top-1 left-1">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              img.isExisting
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {img.isExisting ? "ຮູບເກົ່າ" : "ຮູບໃໝ່"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  ຍົກເລີກ
                </button>
                <button
                  disabled={isLoading}
                  type="submit"
                  className={`px-6 py-2 font-medium rounded-lg transition-all text-sm ${
                    isLoading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gray-800 text-white hover:bg-gray-900"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent mr-2"></div>
                      ກຳລັງບັນທຶກ...
                    </div>
                  ) : (
                    "ບັນທຶກ"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;
