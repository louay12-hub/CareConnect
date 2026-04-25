import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Doctor = () => {
  const [doctorList, setDoctorList] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [hospitalId, setHospitalId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState({
    doctor_id: null,
    hospital_id: "",
    equipment_id: "",
    name: "",
    specialization: "",
    email: "",
    phone: "",
    image: null,
    imagePreview: null,
  });

  const apiURL = "http://localhost:5000/api";

  const fetchDoctors = async (hospital_id) => {
    try {
      const res = await fetch(`${apiURL}/doctors/${hospital_id}?t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch doctors");
      setDoctorList(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || "Failed to fetch doctors");
    }
  };

  const fetchEquipment = async (hospital_id) => {
    try {
      const res = await fetch(`${apiURL}/equipment_data?hospital_id=${hospital_id}&t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch equipment");
      setEquipmentList(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || "Failed to fetch equipment");
    }
  };

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) return;

    fetch(`${apiURL}/fetch_hospital_id/${user_id}?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.hospital_id) return toast.error("No hospital found for this user.");

        const hospital_id = data.hospital_id;
        setHospitalId(hospital_id);
        setCurrentDoctor((prev) => ({ ...prev, hospital_id }));

        fetchDoctors(hospital_id);
        fetchEquipment(hospital_id);
      })
      .catch(() => toast.error("Failed to fetch hospital ID"));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentDoctor((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setCurrentDoctor((prev) => ({ ...prev, [name]: value }));
    }
  };

  const openAddModal = () => {
    setIsUpdate(false);
    setCurrentDoctor({
      doctor_id: null,
      hospital_id: hospitalId || "",
      equipment_id: "",
      name: "",
      specialization: "",
      email: "",
      phone: "",
      image: null,
      imagePreview: null,
    });
    setShowModal(true);
  };

  const openUpdateModal = (doctor) => {
    setIsUpdate(true);
    setCurrentDoctor({
      doctor_id: doctor.doctor_id,
      hospital_id: hospitalId || "",
      equipment_id: doctor.equipment_id || "",
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      email: doctor.email || "",
      phone: doctor.phone || "",
      image: null,
      imagePreview: doctor.image || null,
    });
    setShowModal(true);
  };

  const saveDoctor = async () => {
    const {
      doctor_id,
      hospital_id,
      equipment_id,
      name,
      specialization,
      email,
      phone,
      image,
    } = currentDoctor;

    if (!equipment_id || !name || !specialization || !email || !phone) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("hospital_id", hospital_id);
      formData.append("equipment_id", equipment_id);
      formData.append("name", name);
      formData.append("specialization", specialization);
      formData.append("email", email);
      formData.append("phone", phone);
      if (image) formData.append("image", image);

      const url = isUpdate
        ? `${apiURL}/update_doctors/${doctor_id}`
        : `${apiURL}/create_doctors`;
      const method = isUpdate ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save doctor");

      toast.success(isUpdate ? "Doctor updated successfully!" : "Doctor added successfully!");

      if (hospitalId) await fetchDoctors(hospitalId);

      setShowModal(false);
    } catch (err) {
      toast.error(err.message || "Failed to save doctor");
    }
  };

  const deleteDoctor = async (doctor_id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;

    try {
      const res = await fetch(`${apiURL}/delete_doctors/${doctor_id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to delete doctor");

      toast.success("Doctor deleted successfully!");

      if (hospitalId) await fetchDoctors(hospitalId);
    } catch (err) {
      toast.error(err.message || "Failed to delete doctor");
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-full">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Doctors</h2>
        <button
          onClick={openAddModal}
          className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Add Doctor
        </button>
      </div>

      <div className="overflow-x-auto w-full border border-gray-200 rounded">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Specialization</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Phone</th>
              <th className="py-2 px-4 border-b text-left">Image</th>
              <th className="py-2 px-4 border-b text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {doctorList.length > 0 ? (
              doctorList.map((item) => (
                <tr key={item.doctor_id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{item.name}</td>
                  <td className="py-2 px-4 border-b">{item.specialization}</td>
                  <td className="py-2 px-4 border-b">{item.email}</td>
                  <td className="py-2 px-4 border-b">{item.phone}</td>
                  <td className="py-2 px-4 border-b">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
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
                      onClick={() => deleteDoctor(item.doctor_id)}
                      className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No doctors available
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
              {isUpdate ? "Update Doctor" : "Add Doctor"}
            </h3>
            <div className="flex flex-col gap-3">
              <select
                name="equipment_id"
                value={currentDoctor.equipment_id}
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
                value={currentDoctor.name}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
              />
              <input
                type="text"
                name="specialization"
                placeholder="Specialization"
                value={currentDoctor.specialization}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={currentDoctor.email}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={currentDoctor.phone}
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
              {currentDoctor.imagePreview && (
                <img
                  src={currentDoctor.imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded mt-2"
                />
              )}
              <button
                onClick={saveDoctor}
                className="px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 mt-2"
              >
                {isUpdate ? "Update Doctor" : "Add Doctor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctor;