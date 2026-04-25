import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Nurse = () => {
  const [nurseList, setNurseList] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [hospitalId, setHospitalId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentNurse, setCurrentNurse] = useState({
    id: null,
    hospital_id: "",
    equipment_id: "",
    name: "",
    email: "",
    phone: "",
    image: null,
    existingImage: null,
  });

  const apiURL = "http://localhost:5000/api";

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) return;

    fetch(`${apiURL}/fetch_hospital_id/${user_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.hospital_id) {
          const hospital_id = data.hospital_id;
          setHospitalId(hospital_id);
          setCurrentNurse((prev) => ({ ...prev, hospital_id }));

          fetch(`${apiURL}/equipment_data?hospital_id=${hospital_id}`)
            .then((res) => res.json())
            .then((eqData) => setEquipmentList(eqData))
            .catch(() => toast.error("Failed to fetch equipment"));

          fetchNurses(hospital_id);
        } else {
          toast.error("No hospital found for this user.");
        }
      })
      .catch(() => toast.error("Failed to fetch hospital ID"));
  }, []);

  const fetchNurses = (hospital_id) => {
    fetch(`${apiURL}/fetch_nurses/${hospital_id}`)
      .then((res) => res.json())
      .then((data) => setNurseList(data))
      .catch(() => toast.error("Failed to fetch nurses"));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setCurrentNurse((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const openAddModal = () => {
    setCurrentNurse({
      id: null,
      hospital_id: hospitalId || "",
      equipment_id: "",
      name: "",
      email: "",
      phone: "",
      image: null,
      existingImage: null,
    });
    setShowModal(true);
  };

  const openUpdateModal = (nurse) => {
    setCurrentNurse({
      id: nurse.nurse_id,
      hospital_id: nurse.hospital_id,
      equipment_id: nurse.equipment_id || "",
      name: nurse.name || "",
      email: nurse.email || "",
      phone: nurse.phone || "",
      image: null,
      existingImage: nurse.image || null,
    });
    setShowModal(true);
  };

  const saveNurse = async () => {
    const { id, hospital_id, equipment_id, name, email, phone, image } = currentNurse;
    if (!equipment_id || !name || !email || !phone) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("hospital_id", hospital_id);
      formData.append("equipment_id", equipment_id);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      if (image) formData.append("image", image);

      const url = id ? `${apiURL}/update_nurses/${id}` : `${apiURL}/create_nurses`;
      const method = id ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (res.status >= 400) {
        toast.error(data.error || "Failed to save nurse");
        return;
      }

      if (id) {
        setNurseList((prev) =>
          prev.map((n) => (n.nurse_id === id ? { ...n, ...data } : n))
        );
        toast.success("Nurse updated successfully!");
      } else {
        setNurseList((prev) => [...prev, data]);
        toast.success("Nurse added successfully!");
      }

      setShowModal(false);
    } catch {
      toast.error("Failed to save nurse");
    }
  };

  const deleteNurse = async (nurse_id) => {
    if (!window.confirm("Are you sure you want to delete this nurse?")) return;
    try {
      const res = await fetch(`${apiURL}/delete_nurses/${nurse_id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.status >= 400) {
        toast.error(data.error || "Failed to delete nurse");
        return;
      }
      setNurseList((prev) => prev.filter((n) => n.nurse_id !== nurse_id));
      toast.success("Nurse deleted!");
      fetchNurses(hospitalId);
    } catch {
      toast.error("Failed to delete nurse");
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-full">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Nurses</h2>
        <button
          onClick={openAddModal}
          className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Add Nurse
        </button>
      </div>

      <div className="overflow-x-auto w-full border border-gray-200 rounded">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Image</th>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Phone</th>
              <th className="py-2 px-4 border-b text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {nurseList.length > 0 ? (
              nurseList.map((n) => (
                <tr key={n.nurse_id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">
                    <img
                      src={n.image}
                      alt={n.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </td>
                  <td className="py-2 px-4 border-b">{n.name}</td>
                  <td className="py-2 px-4 border-b">{n.email}</td>
                  <td className="py-2 px-4 border-b">{n.phone}</td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    <button
                      onClick={() => openUpdateModal(n)}
                      className="px-2 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => deleteNurse(n.nurse_id)}
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
                  No nurses available
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
              {currentNurse.id ? "Update Nurse" : "Add Nurse"}
            </h3>

            <div className="flex flex-col gap-3">
              <select
                name="equipment_id"
                value={currentNurse.equipment_id}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
              >
                <option value="">Select Equipment</option>
                {equipmentList.map((eq) => (
                  <option key={eq.equipment_id} value={eq.equipment_id}>
                    {eq.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="name"
                placeholder="Name"
                value={currentNurse.name}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={currentNurse.email}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={currentNurse.phone}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
              />

              {currentNurse.existingImage && !currentNurse.image && (
                <img
                  src={currentNurse.existingImage}
                  alt="Current"
                  className="w-24 h-24 object-cover rounded mx-auto"
                />
              )}

              <input
                type="file"
                name="image"
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
              />

              <button
                onClick={saveNurse}
                className="px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 mt-2"
              >
                {currentNurse.id ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nurse;
