import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import { apiURL } from "../apiURL.JSX";
import { AiOutlineSearch, AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HospitalInfo = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("doctors");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url = "";
        if (activeTab === "doctors") url = `${apiURL}/api/doctors/${id}`;
        if (activeTab === "nurses") url = `${apiURL}/api/fetch_nurses/${id}`;
        if (activeTab === "equipment") url = `${apiURL}/api/equipment/${id}`;
        if (activeTab === "services") url = `${apiURL}/api/fetch_services/${id}`;

        const res = await fetch(url);
        const result = await res.json();
        const arr = Array.isArray(result) ? result : [];
        setData(arr);
        setFilteredData(arr);
      } catch {
        setData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, id]);

  const normalize = (v) => (v ?? "").toString().toLowerCase();

  const getItemId = (item, tab) => {
    if (tab === "doctors") return item?.doctor_id ?? item?.id;
    if (tab === "nurses") return item?.nurse_id ?? item?.id;
    if (tab === "equipment") return item?.equipment_id ?? item?.id;
    if (tab === "services") return item?.service_id ?? item?.id;
    return item?.id;
  };

  const getTitle = (item, tab) => {
    if (tab === "services") return item?.title ?? item?.name ?? "Untitled";
    return item?.name ?? item?.full_name ?? "Untitled";
  };

  const getSubtitle = (item, tab) => {
    if (tab === "doctors" || tab === "nurses")
      return item?.specialization ?? item?.department ?? "";
    if (tab === "equipment") return item?.description ?? "";
    if (tab === "services") return item?.description ?? "";
    return "";
  };

  const handleSearch = () => {
    const term = normalize(searchTerm);

    const filtered = data.filter((item) => {
      if (!item) return false;

      if (activeTab === "doctors" || activeTab === "nurses") {
        return (
          normalize(item.name).includes(term) ||
          normalize(item.full_name).includes(term) ||
          normalize(item.specialization).includes(term) ||
          normalize(item.department).includes(term) ||
          normalize(item.email).includes(term) ||
          normalize(item.phone).includes(term)
        );
      }

      if (activeTab === "equipment") {
        return (
          normalize(item.name).includes(term) ||
          normalize(item.description).includes(term)
        );
      }

      if (activeTab === "services") {
        return (
          normalize(item.title).includes(term) ||
          normalize(item.name).includes(term) ||
          normalize(item.description).includes(term)
        );
      }

      return false;
    });

    setFilteredData(filtered);
  };

  const toggleSelect = (item) => {
    const selectedId = getItemId(item, activeTab);

    const isSelected = selectedItems.some(
      (i) => i.selected_id === selectedId && i.type === activeTab
    );

    if (isSelected) {
      setSelectedItems(
        selectedItems.filter(
          (i) => !(i.selected_id === selectedId && i.type === activeTab)
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        { ...item, type: activeTab, selected_id: selectedId },
      ]);
    }
  };

  const renderCard = (item, index) => {
    if (!item) return null;

    const key = getItemId(item, activeTab) ?? index;
    const itemId = getItemId(item, activeTab);

    const isSelected = selectedItems.some(
      (i) => i.selected_id === itemId && i.type === activeTab
    );

    const classes = `relative w-[300px] h-[250px] rounded-xl shadow-md p-4 flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer ${
      isSelected ? "bg-green-100 dark:bg-green-700" : "bg-white dark:bg-gray-800"
    }`;

    const placeholder = "https://via.placeholder.com/150";
    const title = getTitle(item, activeTab);
    const subtitle = getSubtitle(item, activeTab);

    if (activeTab === "doctors" || activeTab === "nurses") {
      return (
        <div key={key} className={classes} onClick={() => showCreate && toggleSelect(item)}>
          <img
            src={item.image || placeholder}
            alt={title}
            className="w-16 h-16 rounded-full object-cover mb-4"
          />
          <h2 className="font-semibold text-lg text-center">{title}</h2>
          <p className="text-gray-500 text-center">{subtitle}</p>
          {showCreate && (
            <input
              type="checkbox"
              checked={!!isSelected}
              onChange={() => toggleSelect(item)}
              className="absolute bottom-2 right-2 w-5 h-5"
            />
          )}
        </div>
      );
    }

    if (activeTab === "equipment") {
      return (
        <div key={key} className={classes} onClick={() => showCreate && toggleSelect(item)}>
          <img
            src={item.image || placeholder}
            alt={title}
            className="w-16 h-16 rounded-md object-cover mb-4"
          />
          <h2 className="font-semibold text-lg text-center">{title}</h2>
          <p className="text-gray-500 text-center">{subtitle}</p>
          {showCreate && (
            <input
              type="checkbox"
              checked={!!isSelected}
              onChange={() => toggleSelect(item)}
              className="absolute bottom-2 right-2 w-5 h-5"
            />
          )}
        </div>
      );
    }

    if (activeTab === "services") {
      return (
        <div className="w-[300px] h-[250px] rounded-xl shadow-md p-4 flex flex-col justify-center transition-transform hover:scale-105 bg-white dark:bg-gray-800">
          <img
            src={item.image || placeholder}
            alt={title}
            className="w-20 h-20 rounded-md object-cover mx-auto mb-4"
          />
          <h2 className="font-semibold text-lg text-center">{title}</h2>
          <p className="text-gray-500 text-center mt-3 line-clamp-5">{subtitle}</p>
        </div>
      );
    }

    return null;
  };

  const confirmAppointment = async () => {
    const doctor = selectedItems.find((i) => i.type === "doctors");
    const equipment = selectedItems.find((i) => i.type === "equipment");
    const userId = localStorage.getItem("user_id");

    if (!doctor || !equipment || !appointmentDate || !userId) {
      toast.error("Please select doctor, equipment, and appointment date");
      return;
    }

    const appointmentPayload = {
      user_id: userId,
      hospital_id: id,
      doctor_id: doctor.selected_id,
      equipment_id: equipment.selected_id,
      equipment_name: equipment.name,
      appointment_date: appointmentDate,
    };

    try {
      const res = await fetch(`${apiURL}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentPayload),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || result.message || "Failed to create appointment");
        return;
      }

      toast.success("Appointment submitted successfully!");
      setSelectedItems([]);
      setAppointmentDate("");
      setShowCreate(false);
    } catch {
      toast.error("Something went wrong. Try again.");
    }
  };

  const showModal =
    showCreate &&
    selectedItems.find((i) => i.type === "doctors") &&
    selectedItems.find((i) => i.type === "equipment");

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4 mt-16">
          <ul className="flex flex-wrap justify-start text-sm font-medium text-gray-500 border-b border-gray-200">
            {["doctors", "nurses", "equipment", "services"].map((tab) => (
              <li key={tab} className="mr-2 mb-2 sm:mb-0">
                <button
                  onClick={() => setActiveTab(tab)}
                  className={`inline-block px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200 ${
                    activeTab === tab
                      ? "text-blue-600 bg-gray-100 dark:bg-gray-800 dark:text-blue-500"
                      : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 bg-blue-300 text-white px-4 py-2 rounded hover:bg-blue-400"
          >
            <AiOutlinePlus size={18} />
            Create Appointment
          </button>
        </div>

        <div className="flex justify-center mb-6 gap-2">
          <input
            type="text"
            className="border p-2 rounded w-64"
            placeholder={`Search ${activeTab}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 flex items-center gap-2 rounded hover:bg-blue-700"
          >
            <AiOutlineSearch size={18} />
            Search
          </button>
        </div>

        {loading ? (
          <div className="text-center mt-10">Loading...</div>
        ) : filteredData.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 font-semibold">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} not found
          </div>
        ) : (
          <div className="flex flex-wrap justify-center sm:justify-start gap-6">
            {filteredData.map(renderCard)}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 relative">
              <button
                onClick={() => setShowCreate(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 dark:hover:text-white"
              >
                <AiOutlineClose size={20} />
              </button>

              <h2 className="text-lg font-semibold mb-4">Confirm Appointment</h2>

              <p>
                <strong>Doctor:</strong>{" "}
                {selectedItems.find((i) => i.type === "doctors")?.name ||
                  selectedItems.find((i) => i.type === "doctors")?.full_name}
              </p>

              <p>
                <strong>Equipment:</strong> {selectedItems.find((i) => i.type === "equipment")?.name}
              </p>

              <div className="mt-4">
                <label className="block mb-1 font-medium">Appointment Date:</label>
                <input
                  type="date"
                  className="border p-2 rounded w-full"
                  value={appointmentDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                />
              </div>

              <button
                onClick={confirmAppointment}
                className="mt-4 w-full bg-blue-400 text-white py-2 rounded hover:bg-blue-500"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HospitalInfo;
