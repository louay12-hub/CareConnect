import React, { useState, useEffect } from "react";
import {
  Calendar,
  Bell,
  Stethoscope,
  Clipboard,
  CreditCard,
  Mail,
  User,
  Users,
  Menu,
  X,
  LogOut,
  UserCircle2,
} from "lucide-react";
import Profile from "./Profile";
import Equipment from "./Equipment";
import Notification from "./Notification";
import Services from "./Services";
import Payment from "./Payment";
import Contact from "./Contact";
import Doctor from "./Doctor";
import Nurse from "./Nurse";
import Appointments from "./Appoinmtents";
import { apiURL } from "../apiURL";

const HospitalDashboard = () => {
  const [activePage, setActivePage] = useState("appointments");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [hospitalInfo, setHospitalInfo] = useState({ username: "", email: "" });

  const renderContent = () => {
    switch (activePage) {
      case "appointments":
        return <Appointments />;
      case "equipment":
        return <Equipment />;
      case "notifications":
        return <Notification />;
      case "services":
        return <Services />;
      case "payment":
        return <Payment />;
      case "contact":
        return <Contact />;
      case "doctor":
        return <Doctor />;
      case "nurse":
        return <Nurse />;
      case "profile":        
        return <Profile />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchAdminInfo = async () => {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) return;

      try {
        const response = await fetch(`${apiURL}/api/users/${user_id}`);
        if (!response.ok) throw new Error("Failed to fetch hospital info");

        const data = await response.json();
        // Since the API returns an object, not an array
        setHospitalInfo({ username: data.username, email: data.email });
      } catch (error) {
        console.error("Error fetching hospital info:", error);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${apiURL}/api/notifications`);
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();
        setNotificationCount(data.length);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAdminInfo();
    fetchNotifications();
  }, []);

  const sidebarItems = [
    { id: "appointments", label: "Appointments", icon: <Calendar /> },
    { id: "equipment", label: "Equipment", icon: <Stethoscope /> },
    { id: "notifications", label: "Notifications", icon: <Bell />, badge: notificationCount },
    { id: "services", label: "Services", icon: <Clipboard /> },
    { id: "payment", label: "Payment", icon: <CreditCard /> },
    { id: "doctor", label: "Doctors", icon: <User /> },
    { id: "nurse", label: "Nurses", icon: <Users /> },
    { id: "contact", label: "Contact", icon: <Mail /> },
    { id: "profile", label: "Profile", icon: <UserCircle2 /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    window.location.href = "/login";
  };

  const renderSidebarButton = (item) => (
    <button
      key={item.id}
      onClick={() => setActivePage(item.id)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${activePage === item.id ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-200"
        }`}
    >
      <div className="relative inline-block">
        {item.icon}
        {item.badge > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
            {item.badge}
          </span>
        )}
      </div>
      {sidebarOpen && <span>{item.label}</span>}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex flex-col bg-white shadow-lg p-4 transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"
          }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold text-blue-600 ${!sidebarOpen && "hidden"}`}>Hospital</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:text-blue-600">
            {sidebarOpen ? <X /> : <Menu />}
          </button>
        </div>

        <nav className="space-y-2 flex-1">{sidebarItems.map(renderSidebarButton)}</nav>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-black transition"
          >
            <LogOut />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebar && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden" onClick={() => setMobileSidebar(false)}></div>
          <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg p-4 flex flex-col z-50 md:hidden transition-all">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-blue-600">Hospital</h1>
              <button onClick={() => setMobileSidebar(false)} className="text-gray-600 hover:text-blue-600">
                <X />
              </button>
            </div>
            <nav className="space-y-2 flex-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setMobileSidebar(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${activePage === item.id ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  <div className="relative inline-block">
                    {item.icon}
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="mt-auto">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-100 transition"
              >
                <LogOut />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center bg-white shadow px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebar(true)} className="md:hidden text-gray-600 hover:text-blue-600">
              <Menu />
            </button>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Hospital Dashboard</h1>
          </div>

          <div className="relative">
            <button onClick={() => setShowAccount(!showAccount)} className="flex items-center gap-2">
              <UserCircle2 className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
            </button>
            {showAccount && (
              <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg p-3 text-sm">
                <p className="font-semibold text-gray-800">{hospitalInfo.username || "Hospital Admin"}</p>
                <p className="text-gray-500 text-xs mb-3">{hospitalInfo.email || "admin@hospital.com"}</p>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 hover:text-black transition"//for sidebar logout button
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="p-4 md:p-8 overflow-y-auto flex-1 bg-gray-50">{renderContent()}</main>
      </div>
    </div>
  );
};

export default HospitalDashboard;
