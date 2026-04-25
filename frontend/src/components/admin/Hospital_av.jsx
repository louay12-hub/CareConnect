import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Hospital_av = () => {
  const [hospitalList, setHospitalList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentHospital, setCurrentHospital] = useState({
    hospital_id: null,
    name: "",
    address: "",
    phone: "",
    email: "",
    image: null,
  });

  const apiURL = "http://localhost:5000/api";

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await fetch(`${apiURL}/hospitals`);
      const data = await res.json();
      setHospitalList(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch hospitals");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setCurrentHospital({ ...currentHospital, image: files[0] });
    } else {
      setCurrentHospital({ ...currentHospital, [name]: value });
    }
  };

  const openUpdateModal = (hospital) => {
    setCurrentHospital(hospital);
    setShowModal(true);
  };

  const updateHospital = async () => {
    try {
      const formData = new FormData();
      formData.append("name", currentHospital.name);
      formData.append("address", currentHospital.address);
      formData.append("phone", currentHospital.phone);
      formData.append("email", currentHospital.email);
      if (currentHospital.image) formData.append("image", currentHospital.image);

      const res = await fetch(`${apiURL}/hospitals/${currentHospital.hospital_id}`, {
        method: "PUT",
        body: formData,
      });
      await res.json();
      fetchHospitals();
      toast.success("Hospital updated successfully");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update hospital");
    }
  };

  const deleteHospital = async (hospital_id) => {
    try {
      const res = await fetch(`${apiURL}/hospitals/${hospital_id}`, { method: "DELETE" });
      await res.json();
      fetchHospitals();
      toast.success("Hospital deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete hospital");
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-full">
      <Toaster position="top-right" />
      <h2 className="text-xl font-semibold mb-4">Hospitals</h2>

      <div className="overflow-x-auto w-full border border-gray-200 rounded">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Address</th>
              <th className="py-2 px-4 border-b text-left">Phone</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Image</th>
              <th className="py-2 px-4  text-red-600 border-b text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {hospitalList.length > 0 ? (
              hospitalList.map((item) => (
                <tr key={item.hospital_id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{item.name}</td>
                  <td className="py-2 px-4 border-b">{item.address}</td>
                  <td className="py-2 px-4 border-b">{item.phone}</td>
                  <td className="py-2 px-4 border-b">{item.email}</td>
                  <td className="py-2 px-4 border-b">
                    {item.image && <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />}
                  </td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    <button
                      onClick={() => openUpdateModal(item)}
                      className="px-2 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => deleteHospital(item.hospital_id)}
                      className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No hospitals available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Update Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg w-96 p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">Update Hospital</h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                name="name"
                placeholder="Hospital Name"
                value={currentHospital.name}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={currentHospital.address}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={currentHospital.phone}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
              />
              <input
                type="text"
                name="email"
                placeholder="Email"
                value={currentHospital.email}
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
              <button
                onClick={updateHospital}
                className="px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 mt-2"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hospital_av;
