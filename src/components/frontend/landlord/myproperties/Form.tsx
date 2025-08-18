import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { PropertyModelTest } from "./Type";

const Form: React.FC<{
  isOpen: boolean;
  selectedProperty: PropertyModelTest | null;
  statusForm: string;
  onClose: () => void;
  onAddProperty: (newProperty: Omit<PropertyModelTest, "id">) => void;
}> = ({ isOpen, onClose, selectedProperty, statusForm, onAddProperty }) => {
  const defaultData: PropertyModelTest = {
    id: 0,
    landlord_id: 0,
    name: "",
    logo: "",
    description: "",
    address: "",
    price: "",
    status: "AVAILABLE",
    subscription_id: null,
    propertyTypeName: "APARTMENT",
    created_at: "",
    updated_at: "",
    latitude: "",
    longitude: "",
  };

  const [formData, setFormData] = useState<PropertyModelTest>(defaultData);
  useEffect(() => {
    if (statusForm == "create") {
      setFormData(defaultData);
    } else if (statusForm == "update") {
      if (selectedProperty) {
        setFormData(selectedProperty);
      }
    }

  }, [statusForm || selectedProperty]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.address && formData.price) {
      onAddProperty({
        ...formData,
        price: formData.price,
      });
      setFormData({
        id: 1,
        landlord_id: 2,
        name: "",
        logo: "",
        description: "",
        address: "",
        price: "",
        status: "AVAILABLE",
        subscription_id: null,
        propertyTypeName: "APARTMENT",
        created_at: "",
        updated_at: "",
        latitude: "",
        longitude: "",
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600/50 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
      <div className="relative p-6 bg-white rounded-xl shadow-lg w-11/12 max-w-2xl max-h-full overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          เพิ่มทรัพย์สินใหม่
        </h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="name"
              >
                name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                placeholder="คอนโดมิเนียมใจกลางเมือง"
                required
              />
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="address"
              >
                address
              </label>
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                placeholder="สุขุมวิท 21, กรุงเทพฯ"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="description"
              >
                description
              </label>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับทรัพย์สิน..."
                required
              />
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="price"
              >
                price
              </label>
              <input
                type="number"
                name="price"
                id="price"
                value={formData.price}
                onChange={handleChange}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                placeholder="3500000"
                required
              />
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="status"
              >
                status
              </label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleChange}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                required
              >
                <option value="AVAILABLE">ว่าง</option>
                <option value="RENTED">มีผู้เช่าแล้ว</option>
                <option value="INACTIVE">ไม่ใช้งาน</option>
              </select>
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="propertyTypeId"
              >
                PropertyType
              </label>
              <input
                type="text"
                name="propertyTypeId"
                id="propertyTypeId"
                value={formData.propertyTypeName}
                onChange={handleChange}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                placeholder="Apt, Condo, House"
                required
              />
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="logo"
              >
                logo
              </label>
              <input
                type="text"
                name="logo"
                id="logo"
                value={formData.logo}
                onChange={handleChange}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                placeholder="https://placehold.co/400x300"
                required
              />
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="latitude"
              >
                latitude
              </label>
              <input
                type="text"
                name="latitude"
                id="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                placeholder="13.736717"
                required
              />
            </div>
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="longitude"
              >
                longitud
              </label>
              <input
                type="text"
                name="longitude"
                id="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                placeholder="100.523186"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;
