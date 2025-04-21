import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { hasPermission } from "../services/permissions";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link to="/" className="hover:text-blue-200">
            Vehicle Management System NSUT
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="flex items-center">
                <span className="mr-2">{user.name || user.email}</span>
                <span className="bg-blue-700 text-xs px-2 py-1 rounded-full">
                  {user.role}
                </span>
              </div>

              {hasPermission(user, ["ADMIN"]) && (
                <Link
                  to="/user-management"
                  className="bg-blue-700 hover:bg-blue-800 px-4 py-2 mr-2 rounded-md btn-press-effect"
                >
                  User Management
                </Link>
              )}

              <button
                onClick={logout}
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md btn-press-effect"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/signin"
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md btn-press-effect"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
