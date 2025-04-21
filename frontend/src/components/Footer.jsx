import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-auto">
      <div className="container mx-auto px-3">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-lg font-bold mb-1">
              Vehicle Management System
            </h2>
            <p className="text-gray-300 text-sm">
              Secure vehicle entry tracking and management
            </p>
          </div>

          <div className="mb-4 md:mb-0">
            <h3 className="text-base font-medium mb-1">Contact Information</h3>
            <ul className="text-gray-300 text-sm">
              <li className="mb-0.5">&nbsp;&nbsp;+91 8595509207</li>
              <li className="mb-0.5">&nbsp;&nbsp;+91 9717780932</li>
            </ul>
          </div>

          <div>
            <Link
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md btn-press-effect"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
