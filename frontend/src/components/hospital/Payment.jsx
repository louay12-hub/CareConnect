import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const Payment = () => {
  const [paymentList, setPaymentList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [currentPayment, setCurrentPayment] = useState({
    appointment_id: "",
    appointment_name: "",
    amount: "",
    method: "cash",
    status: "",
  });
  const [hospitalId, setHospitalId] = useState(null);

  const apiURL = "http://localhost:5000/api";

  useEffect(() => {
    const fetchHospitalAndPayments = async () => {
      try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) return;

        const hospitalRes = await fetch(`${apiURL}/fetch_hospital_id/${user_id}`);
        const hospitalData = await hospitalRes.json();
        const id = hospitalData.hospital_id;
        setHospitalId(id);

        const paymentRes = await fetch(`${apiURL}/payments/hospital/${id}`);
        const paymentsData = await paymentRes.json();

        const updatedPayments = await Promise.all(
          paymentsData.map(async (payment) => {
            const hospitalNameRes = await fetch(`${apiURL}/hospital-name/${payment.hospital_id}`);
            const hospitalNameData = await hospitalNameRes.json();
            const userNameRes = await fetch(`${apiURL}/users/${payment.user_id}`);
            const userNameData = await userNameRes.json();
            return {
              ...payment,
              hospital_name: hospitalNameData.name,
              user_name: userNameData.username,
            };
          })
        );

        setPaymentList(updatedPayments);

        const appointmentRes = await fetch(`${apiURL}/appointments/hospital/${id}`);
        const appointmentData = await appointmentRes.json();
        setAppointments(appointmentData);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      }
    };
    fetchHospitalAndPayments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "appointment_id") {
      const selected = appointments.find((a) => a.appointment_id === parseInt(value));
      setCurrentPayment({
        ...currentPayment,
        appointment_id: selected.appointment_id,
        appointment_name: selected.name,
        amount: selected.amount,
        method: "cash",
      });
    } else {
      setCurrentPayment({ ...currentPayment, [name]: value });
    }
  };

  const openAddModal = () => {
    setCurrentPayment({
      appointment_id: "",
      appointment_name: "",
      amount: "",
      method: "cash",
      status: "",
    });
    setShowModal(true);
  };

  const savePayment = async () => {
    try {
      const user_id = localStorage.getItem("user_id");
      if (!user_id || !hospitalId) return;

      const res = await fetch(`${apiURL}/av_payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...currentPayment, user_id, hospital_id: hospitalId }),
      });

      const data = await res.json();
      if (res.status >= 400) {
        alert(data.error || "Failed to add payment");
        return;
      }

      const paymentRes = await fetch(`${apiURL}/payments/hospital/${hospitalId}`);
      const paymentsData = await paymentRes.json();

      const updatedPayments = await Promise.all(
        paymentsData.map(async (payment) => {
          const hospitalNameRes = await fetch(`${apiURL}/hospital-name/${payment.hospital_id}`);
          const hospitalNameData = await hospitalNameRes.json();
          const userNameRes = await fetch(`${apiURL}/users/${payment.user_id}`);
          const userNameData = await userNameRes.json();
          return {
            ...payment,
            hospital_name: hospitalNameData.name,
            user_name: userNameData.username,
          };
        })
      );

      setPaymentList(updatedPayments);
      setShowModal(false);
    } catch (error) {
      console.error("Failed to save payment:", error);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Payments</h2>
       
      </div>

      <div className="overflow-x-auto w-full border border-gray-200 rounded">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Hospital</th>
              <th className="py-2 px-4 border-b text-left">Amount</th>
              <th className="py-2 px-4 border-b text-left">Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {paymentList.length > 0 ? (
              paymentList.map((item) => (
                <tr key={item.payment_id || item.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{item.user_name}</td>
                  <td className="py-2 px-4 border-b">{item.hospital_name}</td>
                  <td className="py-2 px-4 border-b">${item.amount}</td>
                  <td className="py-2 px-4 border-b">{item.payment_method || item.method}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No payments available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

   
    </div>
  );
};

export default Payment;
