import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const Equipment = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [hospitalId, setHospitalId] = useState(null);
  const [currentEquipment, setCurrentEquipment] = useState({
    equipment_id: null,
    hospital_id: "",
    name: "",
    description: "",
    image: null, // store File object
  });

  const apiURL = "http://localhost:5000/api";
  const user_id = localStorage.getItem("user_id");

  // ✅ 1. Fetch hospital_id based on user_id
  const fetchHospitalId = async () => {
    try {
      const res = await fetch(`${apiURL}/fetch_hospital_id/${user_id}`);
      const data = await res.json();

      if (res.ok && data.hospital_id) {
        setHospitalId(data.hospital_id);
      } else {
        console.error(data.error || "Hospital not found for this user");
      }
    } catch (err) {
      console.error("Error fetching hospital_id:", err);
    }
  };

  // ✅ 2. Fetch equipment for the hospital
  const fetchEquipmentByHospital = async (hid) => {
    try {
      const res = await fetch(`${apiURL}/equipment/hospital/${hid}`);
      const data = await res.json();

      if (res.ok) {
        setEquipmentList(data);
      } else {
        console.error(data.error || "Failed to fetch equipment");
        setEquipmentList([]);
      }
    } catch (err) {
      console.error("Error fetching equipment:", err);
      setEquipmentList([]);
    }
  };

  // ✅ Fetch hospital_id on mount
  useEffect(() => {
    if (user_id) {
      fetchHospitalId();
    }
  }, [user_id]);

  // ✅ When hospital_id is available, fetch its equipment
  useEffect(() => {
    if (hospitalId) {
      fetchEquipmentByHospital(hospitalId);
      setCurrentEquipment((prev) => ({
        ...prev,
        hospital_id: hospitalId,
      }));
    }
  }, [hospitalId]);

  // ✅ Handle input field changes
  const handleChange = (e) => {
    setCurrentEquipment({
      ...currentEquipment,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCurrentEquipment({
      ...currentEquipment,
      image: file,
    });
  };

  // ✅ Open Add Modal
  const openAddModal = () => {
    setCurrentEquipment({
      equipment_id: null,
      hospital_id: hospitalId,
      name: "",
      description: "",
      image: null,
    });
    setShowModal(true);
  };

  // ✅ Open Update Modal
  const openUpdateModal = (equipment) => {
    setCurrentEquipment({
      ...equipment,
      image: null, // reset file input
    });
    setShowModal(true);
  };

  // ✅ Add or Update Equipment
  const saveEquipment = async () => {
    if (!currentEquipment.name || !currentEquipment.description) {
      alert("Please fill in all fields.");
      return;
    }

    const method = currentEquipment.equipment_id ? "PUT" : "POST";
    const url = currentEquipment.equipment_id
      ? `${apiURL}/equipment/${currentEquipment.equipment_id}`
      : `${apiURL}/equipment`;

    try {
      const formData = new FormData();
      formData.append("name", currentEquipment.name);
      formData.append("description", currentEquipment.description);
      formData.append("hospital_id", currentEquipment.hospital_id);
      if (currentEquipment.image) {
        formData.append("image", currentEquipment.image);
      }

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save equipment");

      fetchEquipmentByHospital(hospitalId);
      setShowModal(false);
    } catch (err) {
      console.error("Error saving equipment:", err);
    }
  };

  // ✅ Delete Equipment
  const deleteEquipment = async (equipment_id) => {
    if (!window.confirm("Are you sure you want to delete this equipment?")) return;

    try {
      const res = await fetch(`${apiURL}/equipment/${equipment_id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete equipment");

      setEquipmentList((prev) =>
        prev.filter((item) => item.equipment_id !== equipment_id)
      );
    } catch (err) {
      console.error("Error deleting equipment:", err);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Equipment in This Hospital</h2>
        <button
          onClick={openAddModal}
          className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
          disabled={!hospitalId}
        >
          Add Equipment
        </button>
      </div>

      {/* Equipment Table */}
      <div className="overflow-x-auto w-full border border-gray-200 rounded">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Equipment Name</th>
              <th className="py-2 px-4 border-b text-left">Description</th>
              <th className="py-2 px-4 border-b text-left">Image</th>
              <th className="py-2 px-4 border-b text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {equipmentList.length > 0 ? (
              equipmentList.map((item) => (
                <tr key={item.equipment_id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{item.name}</td>
                  <td className="py-2 px-4 border-b">{item.description}</td>
                  <td className="py-2 px-4 border-b">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400 italic">No Image</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    <button
                      onClick={() => openUpdateModal(item)}
                      className="px-2 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => deleteEquipment(item.equipment_id)}
                      className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  {hospitalId
                    ? "No equipment available for this hospital"
                    : "Fetching hospital data..."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Update */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg w-96 p-6 relative shadow-lg">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">
              {currentEquipment.equipment_id ? "Update Equipment" : "Add Equipment"}
            </h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                name="name"
                placeholder="Equipment Name"
                value={currentEquipment.name}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={currentEquipment.description}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="border px-3 py-2 rounded w-full"
              />
              <button
                onClick={saveEquipment}
                className="px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 mt-2"
              >
                {currentEquipment.equipment_id ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipment;
