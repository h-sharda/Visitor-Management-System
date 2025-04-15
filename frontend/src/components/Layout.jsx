import Header from './Header';
import Notification from './Notification';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>
      <Footer />
      <Notification />
    </div>
  );
};

export default Layout;
