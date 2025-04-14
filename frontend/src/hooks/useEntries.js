import { useState, useEffect, useCallback, useRef } from "react";
import { fetchEntries, updateEntryNumber, deleteEntry } from "../services/api";
import { useNotification } from "./useNotification";

export const useEntries = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { showNotification } = useNotification();
  const observer = useRef(null);

  const loadEntries = useCallback(
    async (page = 1, reset = false) => {
      if (loading) return;

      setLoading(true);

      try {
        const response = await fetchEntries(page);

        if (!response) return;

        const newEntries = response.entries;

        if (newEntries.length === 0) {
          setHasMore(false);
        } else {
          setEntries((prev) => (reset ? newEntries : [...prev, ...newEntries]));
          setCurrentPage(page);
        }
      } catch (error) {
        console.error("Error loading entries:", error);
        showNotification("Failed to load entries", "error");
      } finally {
        setLoading(false);
      }
    },
    [loading, showNotification]
  );

  const refreshEntries = useCallback(() => {
    setHasMore(true);
    loadEntries(1, true); // Reset and load page 1
  }, [loadEntries]);

  const loadMoreEntries = () => {
    if (hasMore && !loading) {
      loadEntries(currentPage + 1);
    }
  };

  const updateEntryNumberById = async (entryId, newNumber) => {
    try {
      const response = await updateEntryNumber(entryId, newNumber);

      if (response) {
        // Update entry in local state
        setEntries((prev) =>
          prev.map((entry) =>
            entry._id === entryId ? { ...entry, number: newNumber } : entry
          )
        );
        showNotification("Vehicle number updated successfully", "success");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating entry number:", error);
      showNotification("Failed to update vehicle number", "error");
      return false;
    }
  };

  const deleteEntryById = async (entryId) => {
    try {
      const response = await deleteEntry(entryId);

      if (response) {
        // Remove entry from local state
        setEntries((prev) => prev.filter((entry) => entry._id !== entryId));
        showNotification("Entry deleted successfully", "success");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting entry:", error);
      showNotification("Failed to delete entry", "error");
      return false;
    }
  };

  // Initialize entries on component mount
  useEffect(() => {
    refreshEntries();

    return () => {
      // Clean up observer on unmount
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [refreshEntries]);

  return {
    entries,
    loading,
    hasMore,
    refreshEntries,
    loadMoreEntries,
    updateEntryNumber: updateEntryNumberById,
    deleteEntry: deleteEntryById,
    observer,
  };
};
