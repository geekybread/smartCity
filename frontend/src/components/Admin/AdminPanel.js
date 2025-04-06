import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import FeedbackList from '../Feedback/FeedbackList';
import './AdminPanel.css'; // Create this file for admin-specific styles

const AdminPanel = ({ feedbacks }) => {
    const { isAdmin, user } = useAuth();
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    if (!isAdmin) {
        return (
            <div className="admin-access-denied">
                <h3>Access Denied</h3>
                <p>Administrator privileges required to view this panel.</p>
            </div>
        );
    }

    const filteredFeedbacks = feedbacks.filter(feedback => {
        const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;
        const matchesSearch = feedback.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             feedback.location_name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="admin-panel">
            <h2>Admin Dashboard</h2>
            <div className="admin-controls">
                <div className="admin-filter-controls">
                    <div className="filter-group">
                        <label>Filter by Status:</label>
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="reported">Reported</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                    <div className="search-group">
                        <label>Search:</label>
                        <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <FeedbackList 
                feedbacks={filteredFeedbacks}
                showAdminControls={true}
                isAdmin={true}
            />
        </div>
    );
};

export default AdminPanel;