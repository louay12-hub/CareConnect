import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiURL = "http://localhost:5000/api";

  const fetchHospitalId = async (userId) => {
    try {
      const res = await fetch(`${apiURL}/fetch_hospital_id/${userId}`);
      const data = await res.json();
      return data?.hospital_id || null;
    } catch {
      return null;
    }
  };

  const fetchHospitalName = async (hospitalId) => {
    if (!hospitalId) return "Unknown Hospital";

    try {
      const res = await fetch(`${apiURL}/hospitals/${hospitalId}`);
      const data = await res.json();
      return data?.name || "Unknown Hospital";
    } catch {
      return "Unknown Hospital";
    }
  };

  const fetchDoctorName = async (doctorId) => {
    if (!doctorId) return "Unknown Doctor";
    try {
      const res = await fetch(`${apiURL}/doctors_data/${doctorId}`);
      const data = await res.json();
      return data?.name || "Unknown Doctor";
    } catch {
      return "Unknown Doctor";
    }
  };

  const fetchEquipmentName = async (equipmentId) => {
    if (!equipmentId) return "Unknown Equipment";
    try {
      const res = await fetch(`${apiURL}/equipment_data/${equipmentId}`);
      const data = await res.json();
      return data?.name || "Unknown Equipment";
    } catch {
      return "Unknown Equipment";
    }
  };

  const fetchUserName = async (userId) => {
    if (!userId) return "Unknown User";
    try {
      const res = await fetch(`${apiURL}/users/${userId}`);
      const data = await res.json();
      return data?.username || "Unknown User";
    } catch {
      return "Unknown User";
    }
  };
  

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("user_id");
      if (!userId) throw new Error("User ID not found in localStorage");

      const hospitalId = await fetchHospitalId(userId);
      if (!hospitalId) throw new Error("Hospital not found for this user");
      console.log(hospitalId);
      

      const res = await fetch(`${apiURL}/appointments/hospital/${hospitalId}`);
      const data = await res.json();
      console.log(data);
      
      const appointmentsArray = Array.isArray(data) ? data : data?.appointments || [];
    console.log(appointmentsArray);
    
      const updatedData = await Promise.all(
        appointmentsArray.map(async (appt) => {
          const [username, hospitalName, doctorName, equipmentName] = await Promise.all([
            fetchUserName(appt.user_id),
            fetchHospitalName(appt.hospital_id),
            fetchDoctorName(appt.doctor_id),
            fetchEquipmentName(appt.equipment_id),
          ]);

          return {
            ...appt,
            username,
            hospital_name: hospitalName,
            doctor_name: doctorName,
            equipment_name: equipmentName,
          };
        })
      );

      setAppointments(updatedData);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(err.message || "Failed to fetch appointments");
      setAppointments([]);
    }
  };

  const sendNotification = async (userId, status) => {
    if (!userId) return;
    const title = "Appointment Status Updated";
    const message =
      status === "Confirmed"
        ? "Your appointment has been confirmed."
        : "Your appointment has been cancelled.";
    try {
      await fetch(`${apiURL}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, title, message }),
      });
    } catch {}
  };

  const updateStatus = async (id, newStatus, userId) => {
    setAppointments((prev) =>
      prev.map((appt) => (appt.appointment_id === id ? { ...appt, status: newStatus } : appt))
    );
    sendNotification(userId, newStatus);
    const endpoint =
      newStatus === "Confirmed"
        ? `${apiURL}/appointments/${id}/confirm`
        : `${apiURL}/appointments/${id}/cancel`;
    try {
      const res = await fetch(endpoint, { method: "PUT" });
      if (!res.ok) throw new Error();
      toast.success(`Appointment ${newStatus.toLowerCase()} successfully`);
    } catch {
      toast.error("Failed to update appointment status on server");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading appointments...</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-full">
      <Toaster position="top-right" />
      <h2 className="text-xl font-semibold mb-4">Appointments</h2>
      <div className="overflow-x-auto w-full border border-gray-200 rounded">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Username</th>
              <th className="py-2 px-4 border-b text-left">Hospital</th>
              <th className="py-2 px-4 border-b text-left">Doctor</th>
              <th className="py-2 px-4 border-b text-left">Equipment</th>
              <th className="py-2 px-4 border-b text-left">Date</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map((appt) => (
                <tr key={appt.appointment_id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{appt.username}</td>
                  <td className="py-2 px-4 border-b">{appt.hospital_name}</td>
                  <td className="py-2 px-4 border-b">{appt.doctor_name}</td>
                  <td className="py-2 px-4 border-b">{appt.equipment_name}</td>
                  <td className="py-2 px-4 border-b">{appt.appointment_date}</td>
                  <td className="py-2 px-4 border-b capitalize">{appt.status || "Pending"}</td>
                  <td className="py-2 px-4 border-b flex gap-2">
                    <button
                      onClick={() => updateStatus(appt.appointment_id, "Cancelled", appt.user_id)}
                      className="px-2 py-1 rounded bg-green-500 text-white hover:bg-red-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => updateStatus(appt.appointment_id, "Confirmed", appt.user_id)}
                      className="px-2 py-1 rounded bg-green-500 text-white hover:bg-red-600"
                    >
                      Confirm
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500 italic">
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Appointments;
