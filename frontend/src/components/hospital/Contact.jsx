import React from 'react'
import { useState } from "react";
import { apiURL } from "../apiURL.JSX";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const Contact = () => {
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const user_id = localStorage.getItem("user_id"); // get user_id from localStorage
        if (!user_id) {
            toast.error("You must be logged in to send a message!");
            return;
        }

        if (!formData.full_name || !formData.email || !formData.subject || !formData.message) {
            toast.error("Please fill in all fields!");
            return;
        }

        try {
            const payload = { ...formData, user_id }; // include user_id in payload

            const res = await fetch(`${apiURL}/api/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.status === 201) {
                toast.success("Message sent successfully!");
                setFormData({ full_name: "", email: "", subject: "", message: "" });
            } else if (res.status === 409) {
                toast.warn("You have already sent this message!");
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to send message.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-4xl w-full bg-white shadow-lg rounded-2xl p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">
                    Contact <span className="text-brightColor">Us</span>
                </h2>
                <p className="text-center text-gray-500 mb-10">
                    Have any questions or need help? Feel free to reach out to us anytime!
                </p>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brightColor focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brightColor focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Subject</label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Enter subject"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brightColor focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Message</label>
                        <textarea
                            rows="5"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Write your message here..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brightColor focus:outline-none resize-none"
                        ></textarea>
                    </div>

                    <div className="text-center">
                        <button
                            type="submit"
                            className="bg-brightColor text-black font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-hoverColor transition duration-300 ease-in-out"
                        >
                            Send Message
                        </button>
                    </div>
                </form>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />
        </div>

    )
}

export default Contact