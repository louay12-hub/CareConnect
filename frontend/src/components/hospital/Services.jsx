import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Services = () => {
  const apiURL = "http://localhost:5000/api";

  const [servicesList, setServicesList] = useState([]);
  const [hospitalId, setHospitalId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState({
    service_id: null,
    title: "",
    description: "",
    image: null,
    imageUrl: "",
  });

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return toast.error("User not found. Please log in again.");

    fetch(`${apiURL}/fetch_hospital_id/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.hospital_id) {
          setHospitalId(data.hospital_id);
          fetchServices(data.hospital_id);
        } else {
          toast.error("No hospital found for this user.");
        }
      })
      .catch(() => toast.error("Failed to fetch hospital ID"));
  }, []);

  const fetchServices = async (hospital_id) => {
    try {
      const res = await fetch(`${apiURL}/services_infor/${hospital_id}`);
      const data = await res.json();
      setServicesList(data);
    } catch {
      toast.error("Failed to load services");
    }
  };

  const handleChange = (e) => {
    setCurrentService({ ...currentService, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCurrentService({
      ...currentService,
      image: file,
      imageUrl: URL.createObjectURL(file),
    });
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentService({
      service_id: null,
      title: "",
      description: "",
      image: null,
      imageUrl: "",
    });
    setShowModal(true);
  };

  const openUpdateModal = (service) => {
    setIsEditing(true);
    setCurrentService({
      service_id: service.service_id,
      title: service.title,
      description: service.description,
      image: null,
      imageUrl: service.image || "",
    });
    setShowModal(true);
  };

  const saveService = async () => {
    if (!currentService.title || !currentService.description) {
      toast.error("Please fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("title", currentService.title);
    formData.append("description", currentService.description);
    formData.append("hospital_id", hospitalId);
    if (currentService.image) formData.append("image", currentService.image);

    const url = isEditing
      ? `${apiURL}/services/${currentService.service_id}`
      : `${apiURL}/services`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save service");
      }

      toast.success(isEditing ? "Service updated successfully" : "Service added successfully");
      setShowModal(false);
      fetchServices(hospitalId);
    } catch (err) {
      console.error("Error saving service:", err);
      toast.error(err.message || "Failed to save service");
    }
  };

  const deleteService = async (service_id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    try {
      const res = await fetch(`${apiURL}/services/${service_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete service");

      toast.success("Service deleted successfully");
      fetchServices(hospitalId);
    } catch (err) {
      console.error("Error deleting service:", err);
      toast.error(err.message || "Failed to delete service");
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-full">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Hospital Services</h2>
        <button
          onClick={openAddModal}
          className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Add Service
        </button>
      </div>

      <div className="overflow-x-auto w-full border border-gray-200 rounded">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Title</th>
              <th className="py-2 px-4 border-b text-left">Description</th>
              <th className="py-2 px-4 border-b text-left">Image</th>
              <th className="py-2 px-4 border-b text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {servicesList.length > 0 ? (
              servicesList.map((item) => (
                <tr key={item.service_id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{item.title}</td>
                  <td className="py-2 px-4 border-b">{item.description}</td>
                  <td className="py-2 px-4 border-b">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded"
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
                      onClick={() => deleteService(item.service_id)}
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
                  No services available
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
              {isEditing ? "Update Service" : "Add Service"}
            </h3>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                name="title"
                value={currentService.title}
                onChange={handleChange}
                placeholder="Title"
                className="border px-3 py-2 rounded w-full"
              />
              <input
                type="text"
                name="description"
                value={currentService.description}
                onChange={handleChange}
                placeholder="Description"
                className="border px-3 py-2 rounded w-full"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="border px-3 py-2 rounded w-full"
              />
              {currentService.imageUrl && (
                <img
                  src={currentService.imageUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded mt-2"
                />
              )}
              <button
                onClick={saveService}
                className="px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 mt-2"
              >
                {isEditing ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
