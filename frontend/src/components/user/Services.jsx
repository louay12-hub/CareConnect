import React, { useEffect, useState } from "react";
import Button from "../layouts/Button";
import ServicesCard from "../layouts/ServicesCard";
import { apiURL } from "../apiURL.JSX";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${apiURL}/api/services`);
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center lg:px-32 px-5 pt-24 lg:pt-16">
      <div className="flex flex-col items-center lg:flex-row justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-center lg:text-start">
            Our Services
          </h1>
          <p className="mt-2 text-center lg:text-start">
            Explore the wide range of services we offer.
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <Button title="See Services" />
        </div>
      </div>

      {loading ? (
        <div className="text-center mt-20">Loading services...</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-5 pt-14">
          {services.map((service) => (
            <ServicesCard
              key={service.service_id}
              icon={
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-12 h-12 object-cover"
                />
              }
              title={service.title}
              description={service.description} // if ServicesCard supports description
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
