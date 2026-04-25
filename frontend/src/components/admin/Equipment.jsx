import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Equipment = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [hospitalList, setHospitalList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState({
    equipment_id: null,
    hospital_id: "",
    name: "",
    description: "",
    image: null,
  });

  const apiURL = "http://localhost:5000/api";

  // Fetch hospitals
  const fetchHospitals = async () => {
    try {
      const res = await fetch(`${apiURL}/hospitals`);
      const data = await res.json();
      setHospitalList(data);
    } catch (err) {
      toast.error("Failed to fetch hospitals");
    }
  };

  // Fetch equipment and map hospital names
  const fetchEquipment = async () => {
    try {
      const res = await fetch(`${apiURL}/equipment`);
      const data = await res.json();
      const updatedData = data.map(item => {
        const hospital = hospitalList.find(h => h.hospital_id === item.hospital_id);
        return { ...item, hospital_name: hospital ? hospital.name : "Unknown Hospital" };
      });
      setEquipmentList(updatedData);
    } catch (err) {
      toast.error("Failed to fetch equipment");
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (hospitalList.length > 0) fetchEquipment();
  }, [hospitalList]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setCurrentEquipment(prev => ({ ...prev, image: files[0] }));
    } else {
      setCurrentEquipment(prev => ({ ...prev, [name]: value }));
    }
  };

  const openAddModal = () => {
    setCurrentEquipment({
      equipment_id: null,
      hospital_id: "",
      name: "",
      description: "",
      image: null,
    });
    setShowModal(true);
  };

  const openUpdateModal = (equipment) => {
    setCurrentEquipment({ ...equipment, image: null });
    setShowModal(true);
  };

  const saveEquipment = async () => {
    const { equipment_id, hospital_id, name, description, image } = currentEquipment;
    if (!hospital_id || !name || !description) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("hospital_id", hospital_id);
      formData.append("name", name);
      formData.append("description", description);
      if (image) formData.append("image", image);

      let res = null;
      if (equipment_id) {
        res = await fetch(`${apiURL}/equipment/${equipment_id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        res = await fetch(`${apiURL}/equipment`, {
          method: "POST",
          body: formData,
        });
      }

      const data = await res.json();
      if (res.status >= 400) {
        toast.error(data.error || "Failed to save equipment");
        return;
      }

      // Map hospital name
      const hospital = hospitalList.find(h => h.hospital_id === data.hospital_id);
      data.hospital_name = hospital ? hospital.name : "Unknown Hospital";

      if (equipment_id) {
        setEquipmentList(prev =>
          prev.map(item => (item.equipment_id === data.equipment_id ? data : item))
        );
        toast.success("Equipment updated successfully!");
      } else {
        setEquipmentList(prev => [...prev, data]);
        toast.success("Equipment added successfully!");
      }

      setShowModal(false);
    } catch (err) {
      toast.error("Failed to save equipment");
    }
  };

  const deleteEquipment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this equipment?")) return;
    try {
      const res = await fetch(`${apiURL}/equipment/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.status >= 400) {
        toast.error(data.error || "Failed to delete equipment");
        return;
      }
      setEquipmentList(prev => prev.filter(item => item.equipment_id !== id));
      toast.success("Equipment deleted!");
    } catch (err) {
      toast.error("Failed to delete equipment");
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-full">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Available Equipment</h2>
        <button
          onClick={openAddModal}
          className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Add Equipment
        </button>
      </div>

      <div className="overflow-x-auto w-full border border-gray-200 rounded">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Hospital</th>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Description</th>
              <th className="py-2 px-4 border-b text-left">Image</th>
              <th className="py-2 px-4 border-b text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {equipmentList.length > 0 ? (
              equipmentList.map(item => (
                <tr key={item.equipment_id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{item.hospital_name}</td>
                  <td className="py-2 px-4 border-b">{item.name}</td>
                  <td className="py-2 px-4 border-b">{item.description}</td>
                  <td className="py-2 px-4 border-b">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded"
                      />
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
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No equipment available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg w-96 p-6 relative">
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
              <select
                name="hospital_id"
                value={currentEquipment.hospital_id}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
              >
                <option value="">Select Hospital</option>
                {hospitalList.map(h => (
                  <option key={h.hospital_id} value={h.hospital_id}>
                    {h.name}
                  </option>
                ))}
              </select>
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
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
              />
              {currentEquipment.image &&
                typeof currentEquipment.image !== "string" && (
                  <img
                    src={URL.createObjectURL(currentEquipment.image)}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded mt-1"
                  />
                )}
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
