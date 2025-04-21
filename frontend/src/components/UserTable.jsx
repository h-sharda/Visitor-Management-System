import { useState, useEffect } from "react";
import { fetchUsers, deleteUser, updateUser } from "../services/api";
import { useNotification } from "../hooks/useNotification";

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetchUsers();
      if (response) {
        setUsers(response);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      showNotification("Failed to load users", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole, originalRole) => {
    console.log(originalRole);
    try {
      const result = await updateUser(userId, { role: newRole });

      if (result) {
        showNotification("User role updated successfully", "success");
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, role: newRole } : user
          )
        );
        return true;
      } else {
        showNotification("Failed to update user role", "error");
        return false;
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      showNotification("Failed to update user role", "error");
      return false;
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await deleteUser(userId);

      if (response) {
        showNotification("User deleted successfully", "success");
        setUsers(users.filter((user) => user._id !== userId));
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification("Failed to delete user", "error");
    }
  };

  // New function that returns complete class strings
  const getRoleColorClass = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "OPERATOR":
        return "bg-green-100 text-green-800";
      case "VIEWER":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <h2 className="text-xl font-bold p-4 border-b">User List</h2>

      {users.length === 0 ? (
        <div className="text-center text-gray-500 my-8">No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.fullName || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RoleSelector
                      userId={user._id}
                      initialRole={user.role}
                      onRoleChange={handleRoleChange}
                      getRoleColorClass={getRoleColorClass}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 btn-press-effect"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Role selector component
const RoleSelector = ({
  userId,
  initialRole,
  onRoleChange,
  getRoleColorClass,
}) => {
  const [role, setRole] = useState(initialRole);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = async (e) => {
    const newRole = e.target.value;

    if (newRole === role) return;

    setIsLoading(true);

    const success = await onRoleChange(userId, newRole, role);

    if (success) {
      setRole(newRole);
    }

    setIsLoading(false);
  };

  // Use the function that returns complete class strings
  const colorClass = getRoleColorClass(role);

  return (
    <select
      className={`role-dropdown rounded text-sm border border-gray-300 px-2 py-1 ${colorClass} ${
        isLoading ? "opacity-50" : ""
      }`}
      value={role}
      onChange={handleChange}
      disabled={isLoading}
    >
      <option value="ADMIN">ADMIN</option>
      <option value="OPERATOR">OPERATOR</option>
      <option value="VIEWER">VIEWER</option>
    </select>
  );
};

export default UserTable;
