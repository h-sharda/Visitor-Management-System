import { useState, useEffect } from 'react';
import { 
  fetchAccessRequests, 
  approveAccessRequest, 
  rejectAccessRequest 
} from '../services/api';
import { useNotification } from '../hooks/useNotification';

const PendingRequestsTable = ({ onRequestProcessed }) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState({});
  const { showNotification } = useNotification();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetchAccessRequests();
      if (response) {
        setRequests(response);
        // Initialize selected roles with default 'VIEWER'
        const initialRoles = {};
        response.forEach(req => {
          initialRoles[req._id] = 'VIEWER';
        });
        setSelectedRoles(initialRoles);
      }
    } catch (error) {
      console.error('Error loading access requests:', error);
      showNotification('Failed to load access requests', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (requestId, role) => {
    setSelectedRoles({
      ...selectedRoles,
      [requestId]: role
    });
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm('Are you sure you want to accept this request?')) {
      return;
    }
    
    try {
      const role = selectedRoles[requestId] || 'VIEWER';
      const result = await approveAccessRequest(requestId, { role });
      
      if (result) {
        showNotification('Request approved and user created successfully', 'success');
        setRequests(requests.filter(req => req._id !== requestId));
        if (onRequestProcessed) onRequestProcessed();
      }
    } catch (error) {
      console.error('Error approving request:', error);
      showNotification('Failed to approve request', 'error');
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Are you sure you want to reject this request?')) {
      return;
    }
    
    try {
      const response = await rejectAccessRequest(requestId);
      
      if (response) {
        showNotification('Request rejected successfully', 'success');
        setRequests(requests.filter(req => req._id !== requestId));
        if (onRequestProcessed) onRequestProcessed();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      showNotification('Failed to reject request', 'error');
    }
  };

  // Filter to only show pending requests
  const pendingRequests = requests.filter(req => req.status === 'PENDING');

  // Function to get role color classes
  const getRoleColorClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'OPERATOR': return 'bg-green-100 text-green-800';
      case 'VIEWER': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Loading access requests...</p>
      </div>
    );
  }

  if (!pendingRequests.length) {
    return null; // Don't show the component if there are no pending requests
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
      <h2 className="text-xl font-bold p-4 border-b">Pending Access Requests</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pendingRequests.map(request => (
              <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{request.fullName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{request.email}</div>
                </td>
                <td className="px-6 py-4">
                <div className="text-sm text-gray-500 whitespace-normal break-words max-w-xs">{request.purpose}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(request.requestedAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select 
                    className={`text-sm border border-gray-300 rounded px-2 py-1 ${getRoleColorClass(selectedRoles[request._id] || 'VIEWER')}`}
                    onChange={(e) => handleRoleChange(request._id, e.target.value)}
                    value={selectedRoles[request._id] || 'VIEWER'}
                  >
                    <option value="VIEWER">VIEWER</option>
                    <option value="OPERATOR">OPERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center space-x-2">
                    <button 
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100 btn-press-effect"
                      onClick={() => handleApprove(request._id)}
                      title="Approve"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    <button 
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 btn-press-effect"
                      onClick={() => handleReject(request._id)}
                      title="Reject"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingRequestsTable;
