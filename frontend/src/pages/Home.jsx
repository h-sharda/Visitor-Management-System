import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import EntryForm from "../components/EntryForm";
import EntryTable from "../components/EntryTable";
import { canCreateEntries } from "../services/permissions";

const Home = () => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    // Force refresh of entry table when new entry is uploaded
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div>
      {canCreateEntries(user) && (
        <EntryForm onUploadSuccess={handleUploadSuccess} />
      )}

      <EntryTable key={refreshTrigger} />
    </div>
  );
};

export default Home;
