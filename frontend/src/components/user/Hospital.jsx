import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import { apiURL } from "../apiURL.JSX";

const Hospital = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch hospitals from backend
    const fetchHospitals = async () => {
      try {
        const response = await fetch(`${apiURL}/api/hospitals`);
        const data = await response.json();

        if (response.ok) {
          setHospitals(data);
        } else {
          setError(data.error || "Failed to load hospitals");
        }
      } catch (err) {
        setError("Error connecting to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-lg font-semibold text-gray-700">
        Loading hospitals...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-600 text-lg font-semibold">
        {error}
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <br /><br /><br />
      <div className="min-h-screen bg-gray-50 py-12 px-6 md:px-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
          Our <span className="text-brightColor">Hospitals</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {hospitals.map((hospital) => (
            <Link key={hospital.hospital_id} to={`/hospital/info/${hospital.hospital_id}`}>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                <img
                  src={hospital.image}
                  alt={hospital.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {hospital.name}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Address:</span> {hospital.address}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Phone:</span> {hospital.phone}
                  </p>
                  <p className="text-gray-600 mb-3">
                    <span className="font-medium">Email:</span> {hospital.email}
                  </p>
                  <button className="w-full bg-brightColor text-black font-semibold px-4 py-2 rounded-lg hover:bg-hoverColor transition duration-300">
                    Contact
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Hospital;
