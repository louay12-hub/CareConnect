import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("user_role");

        if (token && userRole !== null) {
            setUser({ token, user_role: Number(userRole) });
        }
        setLoading(false);
    }, []);

    const login = (token, user_role, user_id) => {
        const roleNumber = Number(user_role);

        localStorage.setItem("token", token);
        localStorage.setItem("user_role", roleNumber);
        localStorage.setItem("user_id", user_id); 

        setUser({ token, user_role: roleNumber, id: user_id });
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user");
        setUser(null);
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
