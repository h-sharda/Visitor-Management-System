import { useState } from "react";
import { createUser } from "../services/api";
import { useNotification } from "../hooks/useNotification";

const UserForm = ({ onUserCreated }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!email.trim()) {
      showNotification("Email is required", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
      });

      if (response.status === 201) {
        showNotification(response.data.message, "success");

        // Reset form
        setName("");
        setEmail("");
        setRole("VIEWER");

        // Refresh user list
        if (onUserCreated) {
          onUserCreated();
        }
      } else {
        showNotification(
          response.data.message || "Failed to create user",
          "error"
        );
      }
    } catch (error) {
      console.error("Error creating user:", error);
      showNotification("Failed to create user. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Create New User
      </h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row md:items-end gap-4"
      >
        <div className="flex-1">
          <label
            htmlFor="newUserName"
            className="block text-gray-700 text-sm mb-1"
          >
            Name
          </label>
          <input
            type="text"
            id="newUserName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1">
          <label
            htmlFor="newUserEmail"
            className="block text-gray-700 text-sm mb-1"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="newUserEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1">
          <label
            htmlFor="newUserRole"
            className="block text-gray-700 text-sm mb-1"
          >
            Role <span className="text-red-500">*</span>
          </label>
          <select
            id="newUserRole"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="VIEWER">VIEWER</option>
            <option value="OPERATOR">OPERATOR</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div className="md:w-auto">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 ease-in-out btn-press-effect ${
              isLoading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
