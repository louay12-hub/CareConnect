import React, { useEffect, useState } from "react";
import { apiURL } from "../apiURL.JSX";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  // ✅ Toggle user active/inactive status
  const handleToggleActive = async (userId, currentStatus) => {
    const endpoint =
      currentStatus === "active"
        ? `${apiURL}/api/users/${userId}/deactivate`
        : `${apiURL}/api/users/${userId}/activate`;

    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to update user status");
      const data = await response.json();
      console.log(data.message);
 
      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, is_active: user.is_active === 1 ? 0 : 1 }
            : user
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const toggleRole = async (userId, currentRole) => {

    const endpoint =
      currentRole === 2
        ? `${apiURL}/api/users/${userId}/role/user`
        : `${apiURL}/api/users/${userId}/role/admin`;

    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to update user role");
      const data = await response.json();
      console.log(data.message);

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
              ...user,
              user_role: user.user_role === 2 ? 0 : 2,
            }
            : user
        )
      );
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${apiURL}/api/users`);
        if (!response.ok) throw new Error("Failed to fetch users");

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4">Manage Users</h2>

      <div className="w-full border border-gray-200 rounded overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Username</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Role</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.length > 0 ? (
              users
                .filter((user) => user.user_role !== 1) 
                .map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{user.username}</td>
                    <td className="py-2 px-4 border-b">{user.email}</td>
                    <td className="py-2 px-4 border-b">
                      {user.user_role === 2 ? "Hospital" : "User"}
                    </td>
                    <td className="py-2 px-4 border-b capitalize">
                      {user.is_active === 1 ? "Active" : "Inactive"}
                    </td>
                    <td className="py-2 px-4 border-b flex gap-2">
                      <button
                        onClick={() =>
                          handleToggleActive(
                            user.id,
                            user.is_active === 1 ? "active" : "inactive"
                          )
                        }
                        className={`px-3 py-1 rounded text-white ${user.is_active === 0
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                          }`}
                      >
                        {user.is_active === 0 ? "Activate" : "Deactivate"}
                      </button>

                      <button
                        onClick={() => toggleRole(user.id, user.user_role)}
                        className={`px-3 py-1 rounded text-white ${user.user_role === 2
                            ? "bg-purple-500 hover:bg-purple-600"
                            : "bg-blue-500 hover:bg-indigo-600"
                          }`}
                      >
                        {user.user_role === 2
                          ? "Change to User"
                          : "Change to Hospital"}
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500 italic">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
