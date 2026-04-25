import React from "react";
import { apiURL } from "./apiURL.JSX";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.fullName.value;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const dob = form.dateOfBirth.value;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const payload = { username, email, password, dob, user_role: 0 };

    try {
      const response = await fetch(`${apiURL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        const { token, user } = data;

        if (token) localStorage.setItem("token", token);
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("user_id", user.id); 
        }

        toast.success("Registration successful!", { autoClose: 2500 });
        setTimeout(() => (window.location.href = "/user"), 2500);
      }
      else if (
        data.error &&
        (data.error.toLowerCase().includes("duplicate") || data.error.toLowerCase().includes("already exists"))
      ) {
        toast.error("User already exists. Please log in.");
      } else {
        toast.error(data.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Create an Account</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
            <input type="text" name="fullName" placeholder="Enter your full name" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Email Address</label>
            <input type="email" name="email" placeholder="Enter your email" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Date of Birth</label>
            <input type="date" name="dateOfBirth" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
            <input type="password" name="password" placeholder="Enter your password" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Confirm Password</label>
            <input type="password" name="confirmPassword" placeholder="Confirm your password" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-300">Register</button>
          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account? <a href="/login" className="text-blue-600 font-medium hover:underline">Login</a>
          </p>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Register;
