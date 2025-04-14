import { useState } from 'react';
import UserForm from '../components/UserForm';
import UserTable from '../components/UserTable';

const UserManagement = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleUserCreated = () => {
    // Force refresh of user table when new user is created
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      <UserForm onUserCreated={handleUserCreated} />
      <UserTable key={refreshTrigger} />
    </div>
  );
};

export default UserManagement;
