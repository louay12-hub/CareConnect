import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { apiURL } from "../apiURL";

const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          setError("User not logged in");
          setLoading(false);
          return;
        }

        const response = await fetch(`${apiURL}/api/appointments/${userId}`);
        if (!response.ok) {
          const errData = await response.json();
          setError(errData.error || errData.message || "Failed to fetch appointments");
          setLoading(false);
          return;
        }

        const appointmentsData = await response.json();

        // Fetch related names for equipment, doctor, and hospital
        const enrichedData = await Promise.all(
          appointmentsData.map(async (appt) => {
            const [equipmentRes, doctorRes, hospitalRes] = await Promise.all([
              fetch(`${apiURL}/api/equipment-name/${appt.equipment_id}`),
              fetch(`${apiURL}/api/doctor-name/${appt.doctor_id}`),
              fetch(`${apiURL}/api/hospital-name/${appt.hospital_id}`),
            ]);

            const [equipment, doctor, hospital] = await Promise.all([
              equipmentRes.ok ? equipmentRes.json() : { name: "N/A" },
              doctorRes.ok ? doctorRes.json() : { name: "N/A" },
              hospitalRes.ok ? hospitalRes.json() : { name: "N/A" },
            ]);

            return {
              ...appt,
              equipment_name: equipment.name,
              doctor_name: doctor.name,
              hospital_name: hospital.name,
            };
          })
        );

        setAppointments(enrichedData);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while fetching appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirmCancel) return;

    try {
      setAppointments((prev) => prev.filter((appt) => appt.appointment_id !== id));
      alert("Appointment canceled successfully!");
    } catch (error) {
      alert("Failed to cancel appointment. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <br />
      <br />
      <br />

      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-center">My Appointments</h1>

        {loading && <p className="text-center text-gray-500">Loading appointments...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && appointments.length === 0 && (
          <p className="text-center text-gray-500">No appointments found.</p>
        )}

        {!loading && !error && appointments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 bg-white rounded-lg shadow-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 border-b text-left">Equipment</th>
                  <th className="py-3 px-4 border-b text-left">Doctor</th>
                  <th className="py-3 px-4 border-b text-left">Hospital</th>
                  <th className="py-3 px-4 border-b text-left">Date</th>
                  <th className="py-3 px-4 border-b text-left">Status</th>
                  <th className="py-3 px-4 border-b text-center">
                    {appointments.some(appt => appt.status.toLowerCase() === "completed")
                      ? "Payment Status"
                      : "Action"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.appointment_id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b">{appt.equipment_name}</td>
                    <td className="py-3 px-4 border-b">{appt.doctor_name}</td>
                    <td className="py-3 px-4 border-b">{appt.hospital_name}</td>
                    <td className="py-3 px-4 border-b">
                      {new Date(appt.appointment_date).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 border-b">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${appt.status.toLowerCase() === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : appt.status.toLowerCase() === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : appt.status.toLowerCase() === "completed"
                                ? "bg-blue-100 text-blue-700"
                                : appt.status.toLowerCase() === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b text-center">
                      {appt.status.toLowerCase() === "confirmed" && (
                        <button
                          onClick={() => {
                            localStorage.setItem("hospital_id", appt.hospital_id);
                            window.location.href = `/payment/${appt.appointment_id}`;
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm"
                        >
                          Pay Now
                        </button>
                      )}

                      {appt.status.toLowerCase() === "completed" && (
                        <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 text-sm font-medium">
                          Paid
                        </span>
                      )}

                      {appt.status.toLowerCase() === "pending" && (
                        <button
                          onClick={() => handleCancel(appt.appointment_id)}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm"
                        >
                          Cancel
                        </button>
                      )}

                      {appt.status.toLowerCase() === "cancelled" && (
                        <span className="px-3 py-1 rounded-full bg-gray-400 text-white text-sm font-medium">
                          Cancelled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        )}
      </div>
    </>
  );
};

export default Appointment;
