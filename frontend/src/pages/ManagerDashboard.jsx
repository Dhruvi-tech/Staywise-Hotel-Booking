import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchStaffList,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  fetchHotels,
  fetchManagerBookings
} from '../utils/api';

const ManagerDashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'properties' | 'bookings'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Staff State
  const [staffList, setStaffList] = useState([]);
  const [staffStats, setStaffStats] = useState({ totalStaff: 0, onDuty: 0, onLeave: 0, active: 0 });
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [shiftFilter, setShiftFilter] = useState('All');
  const [staffSearch, setStaffSearch] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Front Desk',
    role: 'Front Desk Associate',
    shift: 'Morning',
    status: 'On Duty',
    hotelName: 'The Oberoi Amarvilas, Agra',
    salary: '45000',
    emergencyContact: '+91 98000 11223'
  });

  // Properties & Bookings State
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [departmentFilter, shiftFilter]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Staff
      const staffRes = await fetchStaffList({
        department: departmentFilter !== 'All' ? departmentFilter : undefined,
        shift: shiftFilter !== 'All' ? shiftFilter : undefined,
        search: staffSearch || undefined
      });
      setStaffList(staffRes.data || []);
      if (staffRes.stats) {
        setStaffStats(staffRes.stats);
      }

      // 2. Fetch Sample Hotels
      const hotelsData = await fetchHotels();
      setProperties(hotelsData.slice(0, 6)); // Top curated managed properties

      // 3. Fetch Bookings
      try {
        const bookingsData = await fetchManagerBookings();
        setBookings(bookingsData || []);
      } catch (e) {
        // Fallback for bookings if empty
        setBookings([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load manager dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadDashboardData();
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingStaff) {
        await updateStaffMember(editingStaff._id, formData);
        setSuccessMsg(`Staff record for ${formData.name} updated successfully.`);
      } else {
        await createStaffMember(formData);
        setSuccessMsg(`New staff member ${formData.name} registered successfully.`);
      }
      setAddModalOpen(false);
      setEditingStaff(null);
      resetForm();
      loadDashboardData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save staff record.');
    }
  };

  const handleEditClick = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email || '',
      phone: staff.phone,
      department: staff.department,
      role: staff.role,
      shift: staff.shift,
      status: staff.status,
      hotelName: staff.hotelName || 'The Oberoi Amarvilas, Agra',
      salary: staff.salary ? String(staff.salary) : '45000',
      emergencyContact: staff.emergencyContact || ''
    });
    setAddModalOpen(true);
  };

  const handleDeleteStaff = async (staff) => {
    if (!window.confirm(`Are you sure you want to remove ${staff.name} (${staff.staffId}) from the roster?`)) {
      return;
    }
    try {
      await deleteStaffMember(staff._id);
      setSuccessMsg(`Staff record for ${staff.name} deleted.`);
      loadDashboardData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete staff member.');
    }
  };

  const handleToggleStatus = async (staff) => {
    const nextStatus =
      staff.status === 'On Duty' ? 'Active' : staff.status === 'Active' ? 'On Leave' : 'On Duty';
    try {
      await updateStaffMember(staff._id, { status: nextStatus });
      loadDashboardData();
    } catch (err) {
      setError(err.message || 'Failed to toggle status.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: 'Front Desk',
      role: 'Front Desk Associate',
      shift: 'Morning',
      status: 'On Duty',
      hotelName: 'The Oberoi Amarvilas, Agra',
      salary: '45000',
      emergencyContact: '+91 98000 11223'
    });
    setEditingStaff(null);
  };

  const departments = [
    'All',
    'Front Desk',
    'Concierge',
    'Housekeeping',
    'Food & Beverage',
    'Maintenance',
    'Security',
    'Management'
  ];

  return (
    <div className="manager-dashboard-page" style={{ padding: '2.5rem 1.5rem', maxWidth: '1280px', margin: '0 auto', minHeight: '85vh' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
          color: '#ffffff',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-lg, 12px)',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-card)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                background: 'rgba(197, 160, 89, 0.2)',
                color: 'var(--accent-gold, #c5a059)',
                padding: '0.3rem 0.75rem',
                borderRadius: '20px',
                border: '1px solid rgba(197, 160, 89, 0.4)'
              }}
            >
              🏨 Hotel Manager Portal
            </span>
            <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>
              Logged in as <strong>{user?.name}</strong> ({user?.email})
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif, serif)',
              fontSize: '2.4rem',
              color: '#ffffff',
              margin: '0.35rem 0 0.5rem',
              letterSpacing: '-0.02em'
            }}
          >
            Staff & Property Operations Portal
          </h1>
          <p style={{ color: '#d4d4d8', maxWidth: '680px', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
            Comprehensive management console for hotel staff rosters, on-duty shift coverage, room inventory availability, and guest property reservations.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                resetForm();
                setAddModalOpen(true);
              }}
              className="btn btn-primary"
              style={{
                background: 'var(--accent-gold, #c5a059)',
                color: '#18181b',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.25rem'
              }}
            >
              <span>➕</span>
              <span>Add Staff Member</span>
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className="btn btn-outline"
              style={{
                borderColor: '#71717a',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.25rem'
              }}
            >
              <span>🏨</span>
              <span>View Managed Properties</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div
          style={{
            background: '#ecfdf5',
            color: '#065f46',
            borderLeft: '4px solid #10b981',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-xs, 4px)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          style={{
            background: '#fff1f2',
            color: '#be123c',
            borderLeft: '4px solid #f43f5e',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-xs, 4px)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Roster & Operations Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border, #e5e5e5)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #71717a)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            👥 Total Staff Roster
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main, #18181b)', marginTop: '0.25rem' }}>
            {staffStats.totalStaff || staffList.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '0.35rem' }}>
            Across 7 luxury departments
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border, #e5e5e5)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #71717a)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            🟢 On Duty Today
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
            {staffStats.onDuty || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #71717a)', marginTop: '0.35rem' }}>
            Active on shift right now
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border, #e5e5e5)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #71717a)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            🏨 Managed Properties
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-gold, #c5a059)', marginTop: '0.25rem' }}>
            {properties.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #71717a)', marginTop: '0.35rem' }}>
            Curated 5-star heritage hotels
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border, #e5e5e5)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #71717a)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            📅 Active Reservations
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary, #1c1917)', marginTop: '0.25rem' }}>
            {bookings.length || 14}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #71717a)', marginTop: '0.35rem' }}>
            Guest arrivals pending
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid var(--border, #e5e5e5)',
          marginBottom: '2rem'
        }}
      >
        <button
          onClick={() => setActiveTab('staff')}
          style={{
            padding: '0.85rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'staff' ? '3px solid var(--accent-gold, #c5a059)' : '3px solid transparent',
            color: activeTab === 'staff' ? 'var(--text-main, #18181b)' : 'var(--text-secondary, #71717a)',
            fontWeight: activeTab === 'staff' ? 700 : 500,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>👥</span>
          <span>Staff & Personnel Records</span>
          <span
            style={{
              fontSize: '0.75rem',
              background: 'var(--bg-subtle, #f4f4f5)',
              padding: '0.15rem 0.5rem',
              borderRadius: '10px'
            }}
          >
            {staffList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('properties')}
          style={{
            padding: '0.85rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'properties' ? '3px solid var(--accent-gold, #c5a059)' : '3px solid transparent',
            color: activeTab === 'properties' ? 'var(--text-main, #18181b)' : 'var(--text-secondary, #71717a)',
            fontWeight: activeTab === 'properties' ? 700 : 500,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>🏨</span>
          <span>Managed Properties & Inventory</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            padding: '0.85rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'bookings' ? '3px solid var(--accent-gold, #c5a059)' : '3px solid transparent',
            color: activeTab === 'bookings' ? 'var(--text-main, #18181b)' : 'var(--text-secondary, #71717a)',
            fontWeight: activeTab === 'bookings' ? 700 : 500,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>📅</span>
          <span>Property Reservations</span>
        </button>
      </div>

      {/* TAB 1: STAFF RECORDS */}
      {activeTab === 'staff' && (
        <div>
          {/* Filters & Search Toolbar */}
          <div
            style={{
              background: 'var(--bg-card, #ffffff)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--border, #e5e5e5)',
              marginBottom: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            {/* Search */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 300px' }}>
              <input
                type="text"
                placeholder="Search staff by name, ID (e.g. STF-101), or role..."
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-xs, 4px)',
                  border: '1px solid var(--border-strong, #d4d4d8)',
                  fontSize: '0.9rem'
                }}
              />
              <button type="submit" className="btn btn-outline" style={{ padding: '0.65rem 1.15rem' }}>
                Search
              </button>
            </form>

            {/* Department Filter */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #71717a)' }}>
                Department:
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                style={{
                  padding: '0.6rem 0.9rem',
                  borderRadius: 'var(--radius-xs, 4px)',
                  border: '1px solid var(--border-strong, #d4d4d8)',
                  fontSize: '0.88rem',
                  background: '#ffffff'
                }}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Shift Filter */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #71717a)' }}>
                Shift:
              </label>
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                style={{
                  padding: '0.6rem 0.9rem',
                  borderRadius: 'var(--radius-xs, 4px)',
                  border: '1px solid var(--border-strong, #d4d4d8)',
                  fontSize: '0.88rem',
                  background: '#ffffff'
                }}
              >
                <option value="All">All Shifts</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
                <option value="Rotating">Rotating</option>
              </select>
            </div>
          </div>

          {/* Staff Table */}
          <div
            style={{
              background: 'var(--bg-card, #ffffff)',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--border, #e5e5e5)',
              overflowX: 'auto',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle, #f9f8f6)', borderBottom: '1px solid var(--border, #e5e5e5)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-secondary, #52525b)' }}>Staff ID</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-secondary, #52525b)' }}>Name & Contact</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-secondary, #52525b)' }}>Department</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-secondary, #52525b)' }}>Role / Title</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-secondary, #52525b)' }}>Shift</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-secondary, #52525b)' }}>Property</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-secondary, #52525b)' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-secondary, #52525b)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Loading staff records...
                    </td>
                  </tr>
                ) : staffList.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No staff records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  staffList.map((member) => (
                    <tr
                      key={member._id}
                      style={{
                        borderBottom: '1px solid var(--border, #e5e5e5)',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--accent-gold, #c5a059)' }}>
                        {member.staffId}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main, #18181b)' }}>{member.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #71717a)' }}>
                          📞 {member.phone} {member.email && `• ${member.email}`}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            background: '#f4f4f5',
                            fontWeight: 600
                          }}
                        >
                          {member.department}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-main, #18181b)' }}>
                        {member.role}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            background:
                              member.shift === 'Morning'
                                ? '#eff6ff'
                                : member.shift === 'Evening'
                                ? '#fef3c7'
                                : '#f3e8ff',
                            color:
                              member.shift === 'Morning'
                                ? '#1d4ed8'
                                : member.shift === 'Evening'
                                ? '#b45309'
                                : '#7e22ce',
                            fontWeight: 600
                          }}
                        >
                          🕒 {member.shift}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {member.hotelName || 'The Oberoi Amarvilas, Agra'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(member)}
                          title="Click to toggle status"
                          style={{
                            cursor: 'pointer',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.3rem 0.65rem',
                            borderRadius: '12px',
                            background:
                              member.status === 'On Duty'
                                ? '#dcfce7'
                                : member.status === 'Active'
                                ? '#e0f2fe'
                                : '#fef9c3',
                            color:
                              member.status === 'On Duty'
                                ? '#15803d'
                                : member.status === 'Active'
                                ? '#0369a1'
                                : '#a16207'
                          }}
                        >
                          {member.status === 'On Duty' ? '● On Duty' : member.status === 'Active' ? 'Active' : 'On Leave'}
                        </button>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleEditClick(member)}
                            className="btn btn-outline"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(member)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              fontSize: '0.8rem',
                              background: '#fff1f2',
                              color: '#be123c',
                              border: '1px solid #fecdd3',
                              borderRadius: 'var(--radius-xs, 4px)',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGED PROPERTIES */}
      {activeTab === 'properties' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {properties.map((hotel) => (
            <div
              key={hotel._id || hotel.customId}
              style={{
                background: 'var(--bg-card, #ffffff)',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border, #e5e5e5)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <img
                src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                alt={hotel.name}
                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
              />
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    {hotel.customId}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>⭐ {hotel.rating}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', margin: '0.35rem 0' }}>
                  {hotel.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  📍 {hotel.location}
                </p>

                <div
                  style={{
                    background: 'var(--bg-subtle, #f9f8f6)',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Available Rooms:</span>
                  <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>{hotel.availableRooms || 10} Rooms</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{hotel.price?.toLocaleString()} / night</span>
                  <a
                    href={`/hotels/${hotel.customId || hotel._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                  >
                    View Listing →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: PROPERTY RESERVATIONS */}
      {activeTab === 'bookings' && (
        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border, #e5e5e5)',
            boxShadow: 'var(--shadow-card)',
            padding: '1.5rem'
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', marginBottom: '1rem' }}>
            Guest Reservations Overview
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Live status of guest bookings, arrival schedules, and room allocations across your managed properties.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle, #f9f8f6)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.8rem 1rem' }}>Booking Ref</th>
                <th style={{ padding: '0.8rem 1rem' }}>Guest Name</th>
                <th style={{ padding: '0.8rem 1rem' }}>Property</th>
                <th style={{ padding: '0.8rem 1rem' }}>Dates</th>
                <th style={{ padding: '0.8rem 1rem' }}>Rooms</th>
                <th style={{ padding: '0.8rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.8rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No reservations recorded yet for your assigned properties.
                  </td>
                </tr>
              ) : (
                bookings.map((bk) => (
                  <tr key={bk._id || bk.bookingReference} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                      {bk.bookingReference || bk.id}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{bk.guestName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{bk.email}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>{bk.hotelName}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {bk.checkIn} → {bk.checkOut} ({bk.nights} nights)
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>{bk.rooms} Room(s)</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>₹{bk.totalAmount?.toLocaleString()}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '10px',
                          fontWeight: 700,
                          background: bk.status === 'Confirmed' ? '#dcfce7' : '#fee2e2',
                          color: bk.status === 'Confirmed' ? '#15803d' : '#b91c1c'
                        }}
                      >
                        {bk.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      {addModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1500,
            padding: '1rem'
          }}
        >
          <div
            style={{
              maxWidth: '560px',
              width: '100%',
              background: '#ffffff',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '2rem',
              boxShadow: 'var(--shadow-floating)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>
                {editingStaff ? 'Edit Staff Member' : 'Register New Staff Member'}
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Full Name <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Vikramaditya Rathore"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d4d4d8' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Phone <span style={{ color: '#e11d48' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98000 11223"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d4d4d8' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="staff@staywise.com"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d4d4d8' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Department <span style={{ color: '#e11d48' }}>*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d4d4d8' }}
                  >
                    {departments.filter((d) => d !== 'All').map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Role / Title <span style={{ color: '#e11d48' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="e.g. Chief Guest Relations Officer"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d4d4d8' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Shift Schedule
                  </label>
                  <select
                    name="shift"
                    value={formData.shift}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d4d4d8' }}
                  >
                    <option value="Morning">Morning (07:00 - 15:30)</option>
                    <option value="Evening">Evening (15:00 - 23:30)</option>
                    <option value="Night">Night (23:00 - 07:30)</option>
                    <option value="Rotating">Rotating</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d4d4d8' }}
                  >
                    <option value="On Duty">On Duty</option>
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Assigned Hotel Property
                </label>
                <input
                  type="text"
                  name="hotelName"
                  value={formData.hotelName}
                  onChange={handleInputChange}
                  placeholder="e.g. The Oberoi Amarvilas, Agra"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d4d4d8' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="btn btn-outline"
                  style={{ padding: '0.75rem 1.25rem' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
                  {editingStaff ? 'Update Staff Member' : 'Save Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
