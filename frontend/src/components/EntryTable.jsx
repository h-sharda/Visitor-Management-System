import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchEntries, updateEntryNumber, deleteEntry } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { canManageEntries } from '../services/permissions';
import { useNotification } from '../hooks/useNotification';
import ImageViewer from './ImageViewer';

const EntryTable = () => {
  const [entries, setEntries] = useState([]);
  const [entriesByDate, setEntriesByDate] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreEntries, setHasMoreEntries] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const observer = useRef(null);
  const loadingRef = useRef(null);

  // Group entries by date
  const groupEntriesByDate = useCallback((entryList) => {
    return entryList.reduce((acc, entry) => {
      const entryDate = new Date(entry.timestamp);
      const formattedDate = entryDate.toLocaleDateString();
      if (!acc[formattedDate]) {
        acc[formattedDate] = [];
      }
      acc[formattedDate].push(entry);
      return acc;
    }, {});
  }, []);

  // Load entries on component mount
  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (isLoading || !hasMoreEntries) return;
    
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    };
    
    const handleObserver = (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMoreEntries && !isLoading) {
        loadMoreEntries();
      }
    };
    
    observer.current = new IntersectionObserver(handleObserver, options);
    
    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [isLoading, hasMoreEntries]);

  // Initial load of entries
  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const response = await fetchEntries(1);
      if (response) {
        setEntries(response.entries);
        setEntriesByDate(groupEntriesByDate(response.entries));
        setCurrentPage(2);
        setHasMoreEntries(response.entries.length > 0);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      showNotification('Failed to load entries', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load more entries for infinite scrolling
  const loadMoreEntries = async () => {
    if (isLoading || !hasMoreEntries) return;

    setIsLoading(true);
    try {

      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await fetchEntries(currentPage);
      if (response) {
        if (response.entries.length === 0) {
          setHasMoreEntries(false);
        } else {
          const newEntries = [...entries, ...response.entries];
          setEntries(newEntries);
          setEntriesByDate(groupEntriesByDate(newEntries));
          setCurrentPage(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error loading more entries:', error);
      showNotification('Failed to load more entries', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle number update
  const handleNumberUpdate = async (entryId, newNumber, originalValue) => {
    console.log(originalValue);
    try {
      const response = await updateEntryNumber(entryId, newNumber);
      if (response) {
        showNotification('Vehicle number updated successfully', 'success');
        setEntries(entries.map(entry => 
          entry._id === entryId ? { ...entry, number: newNumber } : entry
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating number:', error);
      showNotification('Failed to update vehicle number', 'error');
      return false;
    }
  };

  // Handle entry deletion
  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }
    
    try {
      const response = await deleteEntry(entryId);
      if (response) {
        showNotification('Entry deleted successfully', 'success');
        const updatedEntries = entries.filter(entry => entry._id !== entryId);
        setEntries(updatedEntries);
        setEntriesByDate(groupEntriesByDate(updatedEntries));
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      showNotification('Failed to delete entry', 'error');
    }
  };

  // Render date sections
  const renderDateSections = () => {
    return Object.entries(entriesByDate).map(([date, dateEntries]) => (
      <div key={date} className="mb-8">
        <h2 className="text-xl font-bold my-4 text-center">Date: {date}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 responsive-table">
            <thead className="bg-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3 text-center text-gray-500 uppercase tracking-wider">Time</th>
                <th scope="col" className="px-6 py-3 text-center text-gray-500 uppercase tracking-wider">Vehicle Number</th>
                <th scope="col" className="px-6 py-3 text-center text-gray-500 uppercase tracking-wider">Image</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dateEntries.map((entry) => {
                const entryDate = new Date(entry.timestamp);
                const formattedTime = entryDate.toLocaleTimeString();
                const canEdit = canManageEntries(user);
                
                return (
                  <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-center" data-label="Time">
                      {formattedTime}
                      {canEdit && (
                        <div className="mt-2">
                          <button 
                            className="delete-button text-red-600 hover:text-red-800 hover:bg-red-100 p-1.5 rounded-full btn-press-effect" 
                            title="Delete entry"
                            onClick={() => handleDeleteEntry(entry._id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center" data-label="Vehicle Number">
                      {canEdit ? (
                        <EditableVehicleNumber 
                          entryId={entry._id} 
                          initialValue={entry.number || ''} 
                          onUpdate={handleNumberUpdate}
                        />
                      ) : (
                        <span className="text-base font-medium text-gray-900">
                          {entry.number || 'Not specified'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center relative image-cell">
                      <div className="image-container">
                        <img 
                          src={entry.signedUrl} 
                          className="max-h-10vh object-contain rounded-md cursor-pointer mx-auto" 
                          alt="Vehicle" 
                          onClick={() => setSelectedImage(entry.signedUrl)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    ));
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
      <h2 className="text-xl font-bold p-4 border-b">Vehicle Entries</h2>
      
      {entries.length === 0 && !isLoading ? (
        <div className="text-center text-gray-500 my-8">
          No entries uploaded yet.
        </div>
      ) : (
        <div>
          {renderDateSections()}
          
          {hasMoreEntries && (
            <div 
              ref={loadingRef}
              className="text-center py-4"
            >
              {isLoading ? (
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              ) : (
                <button 
                  onClick={loadMoreEntries}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  Load More
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      {selectedImage && (
        <ImageViewer 
          imageUrl={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  );
};

// Editable Vehicle Number component
const EditableVehicleNumber = ({ entryId, initialValue, onUpdate }) => {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleBlur = async () => {
    if (value !== initialValue) {
      setIsLoading(true);
      const success = await onUpdate(entryId, value, initialValue);
      if (!success) {
        setValue(initialValue);
      }
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    } else if (e.key === 'Escape') {
      setValue(initialValue);
      e.target.blur();
    }
  };
  
  return (
    <div className="relative inline-block">
      <input 
        type="text" 
        className={`entry-number-input text-base font-medium text-center border border-gray-300 rounded-md py-1 px-2 w-36 ${
          isLoading ? 'opacity-50' : ''
        }`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        placeholder="Enter number"
      />
    </div>
  );
};

export default EntryTable;
