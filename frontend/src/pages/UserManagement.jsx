import { useState } from "react";
import UserForm from "../components/UserForm";
import UserTable from "../components/UserTable";
import PendingRequestsTable from "../components/PendingRequestsTable";

const UserManagement = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <UserForm onUserCreated={handleRefresh} />
      <PendingRequestsTable
        key={`requests-${refreshTrigger}`}
        onRequestProcessed={handleRefresh}
      />
      <UserTable key={refreshTrigger} />
    </div>
  );
};

export default UserManagement;
