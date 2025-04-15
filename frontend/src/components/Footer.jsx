import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-xl font-bold mb-2">Vehicle Management System</h2>
            <p className="text-gray-300">Secure vehicle entry tracking and management</p>
          </div>
          
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-medium mb-2">Contact Information</h3>
            <ul className="text-gray-300">
              <li className="mb-1">&nbsp;&nbsp;&nbsp; +91 8595509207</li>
              <li className="mb-1">&nbsp;&nbsp;&nbsp; +91 9717780932</li>
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
