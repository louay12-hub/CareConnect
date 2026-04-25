import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiURL } from "../apiURL";

const Payment = () => {
  const { appointmentId } = useParams(); // get appointment_id from URL
  const [activeTab, setActiveTab] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [amount, setAmount] = useState(200); // you can fetch dynamically
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const userId = localStorage.getItem("user_id");
  const hospitalId = localStorage.getItem("hospital_id"); // optional, you can also fetch from appointment details

  const validateCard = () => {
    const newErrors = {};
    const sanitizedCard = cardNumber.replace(/[\s-]/g, "");

    const cardPatterns = {
      visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      mastercard: /^5[1-5][0-9]{14}$/,
      amex: /^3[47][0-9]{13}$/,
      discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    };

    const matches = Object.values(cardPatterns).some((pattern) =>
      pattern.test(sanitizedCard)
    );
    if (!matches) newErrors.cardNumber = "Invalid card number";

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = "Expiry must be in MM/YY format";
    } else {
      const [month, year] = expiryDate.split("/").map(Number);
      const expiry = new Date(2000 + year, month - 1, 1);
      const now = new Date();
      if (expiry < now) newErrors.expiryDate = "Card has expired";
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = "Invalid CVV";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createPayment = async (payment_method) => {
    if (!userId) {
      toast.error("User not logged in.");
      return;
    }

    try {
      const payload = {
        appointment_id: appointmentId,
        user_id: userId,
        hospital_id: hospitalId,
        amount,
        payment_method,
      };

      const res = await fetch(`${apiURL}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");

      toast.success("Payment successful!");
      localStorage.removeItem("hospital_id"); // remove hospital_id
      setTimeout(() => {
        navigate("/appointments"); // redirect after payment
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Payment failed");
    }
  };

  const handleCardPayment = async (e) => {
    e.preventDefault();
    if (!validateCard()) return;
    await createPayment("card");
  };

  const handleCashPayment = async () => {
    await createPayment("cash");
  };

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-6 text-center">Payment Page</h2>

          {/* Tabs */}
          <div className="flex mb-6">
            <button
              onClick={() => setActiveTab("card")}
              className={`flex-1 py-2 rounded-t-lg ${
                activeTab === "card"
                  ? "bg-blue-400 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Card
            </button>
            <button
              onClick={() => setActiveTab("cash")}
              className={`flex-1 py-2 rounded-t-lg ${
                activeTab === "cash"
                  ? "bg-blue-400 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Cash
            </button>
          </div>

          {activeTab === "card" && (
            <form onSubmit={handleCardPayment}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Amount</label>
                <input
                  type="text"
                  value={amount}
                  readOnly
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.cardNumber && <p className="text-red-500 text-sm">{errors.cardNumber}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Expiry Date (MM/YY)</label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.expiryDate && <p className="text-red-500 text-sm">{errors.expiryDate}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">CVV</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.cvv && <p className="text-red-500 text-sm">{errors.cvv}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Pay Now
              </button>
            </form>
          )}

          {activeTab === "cash" && (
            <div className="text-center">
              <p className="mb-4">Amount to Pay: ${amount}</p>
              <button
                onClick={handleCashPayment}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-300"
              >
                Submit Cash Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Payment;
