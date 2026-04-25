import React from "react";
import Button from "../layouts/Button";

const Home = () => {
  return (
    <div className=" min-h-screen flex flex-col justify-center lg:px-32 px-5 text-white bg-[url('assets/care_bg.jpg')] bg-no-repeat bg-cover opacity-90">
      <div className=" w-full lg:w-4/5 space-y-5 mt-10">
        <h1 className="text-5xl font-bold leading-tight">
          Empowering Health Choices for a Vibrant Life Your Trusted..
        </h1>
        <p>
          CareConnect is dedicated to providing seamless access to top-tier medical professionals and facilities. We simplify your healthcare journey by bringing doctors, hospitals, and appointment scheduling into one secure and easy-to-use platform."
        </p>

        <Button title="See Services" />
      </div>
    </div>
  );
};

export default Home;
