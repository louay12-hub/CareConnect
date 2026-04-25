import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { apiURL } from "../apiURL.JSX";

const Navbar = () => {
  const [menu, setMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountDropdown, setAccountDropdown] = useState(false);
  const [userInfo, setUserInfo] = useState({ username: "", email: "" });
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const handleChange = () => setMenu(!menu);
  const closeMenu = () => setMenu(false);

  // const UserInfo = async () => {
  //   try {
  //     const res = fetch(`${apiURL}/api/user-info/${userId}`);
  //     const data = (await res).json();
  //     console.log(data)
  //   } catch (error) {

  //   }
  // }

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      const userId = localStorage.getItem("user_id");
      fetch(`http://localhost:5000/api/user-info/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json()

        )
        .then((data) => setUserInfo(data))
        .catch((err) => console.error(err));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAccountDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isHomePage = location.pathname === "/" || location.pathname === "/user";
  const navbarBg = isHomePage
    ? "bg-backgroundColor"
    : "bg-[url('assets/img/home.png')] bg-no-repeat bg-cover opacity-90";

  return (
    <div className={`fixed w-full z-10 text-white ${navbarBg}`}>
      <div className="flex flex-row justify-between p-5 md:px-32 px-5 bg-backgroundColor/90 shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
        <div
          className="flex flex-row items-center cursor-pointer"
          onClick={() => navigate("/user")}
        >
          <h1 className="text-2xl font-semibold">CareConnect</h1>
        </div>

        <nav className="hidden lg:flex flex-row items-center text-lg font-medium gap-8">
          <button onClick={() => navigate("/user")} className="ml-4 hover:text-black  transition-all">Home</button>
          <button onClick={() => navigate("/services")} className="hover:text-black transition-all">Services</button>
          <button onClick={() => navigate("/doctor")} className="hover:text-black transition-all">Doctors</button>
          <button onClick={() => navigate("/hospital_info")} className="hover:text-black transition-all">Hospital</button>
          <button onClick={() => navigate("/notifications")} className="hover:text-black transition-all">Notifications</button>
          <button onClick={() => navigate("/contact")} className="hover:text-black transition-all">Contact</button>
          <button onClick={() => navigate("/appointments")} className="hover:text-black transition-all">Appointments</button>
        </nav>

        <div className="hidden lg:flex gap-4 relative">
          {!isLoggedIn ? (
            <>
              <button onClick={() => navigate("/login")} className="bg-transparent ml-4 text-white px-4 py-2 rounded-md hover:bg-black transition duration-300 ease-in-out">Sign In</button>
              <button onClick={() => navigate("/register")} className="bg-brightColor ml-6 text-white px-4 py-2 rounded-md hover:bg-black transition duration-300 ease-in-out">Sign Up</button>
            </>
          ) : (
            <div ref={dropdownRef}>
              <button onClick={() => setAccountDropdown(!accountDropdown)} className="bg-red-800 px-4 py-2 rounded-md hover:bg-black transition duration-300 ease-in-out">Account</button>
              {accountDropdown && (
                <div className="absolute right-0 mt-2 w-60 rounded-md shadow-lg bg-white text-black ring-1 ring-black ring-opacity-5">
                  <div className="py-4 px-4 border-b border-gray-200">
                    <p className="text-sm font-medium">{userInfo.username}</p>
                    <p className="text-xs text-gray-500">{userInfo.email}</p>


                  </div>
                  <div className="py-2 px-4">
                    <button onClick={handleLogout} className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-black transition duration-300 ease-in-out text-sm">Logout</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:hidden flex items-center">
          {menu ? <AiOutlineClose size={28} onClick={handleChange} /> : <AiOutlineMenu size={28} onClick={handleChange} />}
        </div>
      </div>

      <div className={`${menu ? "translate-x-0" : "-translate-x-full"} lg:hidden flex flex-col absolute bg-backgroundColor text-white left-0 top-16 font-semibold text-2xl text-center pt-8 pb-4 gap-8 w-full h-fit transition-transform duration-300`}>
        <button onClick={() => { navigate("/user"); closeMenu(); }} className="hover:text-hoverColor transition-all">Home</button>
        <button onClick={() => { navigate("/services"); closeMenu(); }} className="hover:text-hoverColor transition-all">Services</button>
        <button onClick={() => { navigate("/doctor"); closeMenu(); }} className="hover:text-hoverColor transition-all">Doctors</button>
        <button onClick={() => { navigate("/hospital"); closeMenu(); }} className="hover:text-hoverColor transition-all">Hospital</button>
        <button onClick={() => { navigate("/notifications"); closeMenu(); }} className="hover:text-hoverColor transition-all">Notifications</button>
        <button onClick={() => { navigate("/contact"); closeMenu(); }} className="hover:text-hoverColor transition-all">Contact</button>
        <button onClick={() => { navigate("/appointments"); closeMenu(); }} className="hover:text-hoverColor transition-all">Appointments</button>

        <div className="flex flex-col gap-4 mt-4">
          {!isLoggedIn ? (
            <>
              <button onClick={() => { navigate("/login"); closeMenu(); }} className="bg-transparent border border-white text-white px-4 py-2 rounded-md hover:bg-black transition duration-300 ease-in-out">Sign In</button>
              <button onClick={() => { navigate("/register"); closeMenu(); }} className="bg-brightColor text-white px-4 py-2 rounded-md hover:bg-black transition duration-300 ease-in-out">Sign Up</button>
            </>
          ) : (
            <button onClick={() => { handleLogout(); closeMenu(); }} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-black transition duration-300 ease-in-out">Logout</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
