import React, { useState, useEffect } from 'react';
import { getAdminDashboard, getAdminUsers, updateUserRole } from '../utils/api';
import Loading from '../components/Loading';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users'

  // User management state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [roleUpdatingId, setRoleUpdatingId] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getAdminDashboard();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setUserLoading(true);
    try {
      const params = {};
      if (userSearch) params.search = userSearch;
      if (userRoleFilter) params.role = userRoleFilter;
      const res = await getAdminUsers(params);
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, userRoleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    setRoleUpdatingId(userId);
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(err.message || 'Failed to update role.');
    } finally {
      setRoleUpdatingId(null);
    }
  };

  if (loading) {
    return <Loading text="Aggregating platform intelligence and live analytics..." />;
  }

  const summary = stats?.summary || {
    totalUsers: 0,
    totalHotels: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    averageBookingValue: 0
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 600 }}>
            Executive Control Center
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', marginTop: '0.35rem', color: 'var(--text-main)' }}>
            System Intelligence & Operations
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Real-time MongoDB Atlas aggregations, reservations telemetry and user governance.
          </p>
        </div>

        {/* Actions & Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href="/manager"
            className="btn btn-outline"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <span>🏨</span>
            <span>Staff Records & Roster</span>
          </a>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.5rem 1.25rem',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              background: activeTab === 'overview' ? '#fff' : 'transparent',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'overview' ? 'var(--shadow-xs)' : 'none',
              color: activeTab === 'overview' ? 'var(--text-main)' : 'var(--text-secondary)'
            }}
          >
            📊 Analytics Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '0.5rem 1.25rem',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              background: activeTab === 'users' ? '#fff' : 'transparent',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'users' ? 'var(--shadow-xs)' : 'none',
              color: activeTab === 'users' ? 'var(--text-main)' : 'var(--text-secondary)'
            }}
          >
            👥 User Management
          </button>
        </div>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Summary Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
            <div className="card" style={{ padding: '1.25rem', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Revenue</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.35rem', color: 'var(--emerald)' }}>
                ₹{summary.totalRevenue.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Confirmed Stays</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.35rem', color: 'var(--text-main)' }}>
                {summary.confirmedBookings}
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hotels Catalog</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.35rem', color: 'var(--text-main)' }}>
                {summary.totalHotels}
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registered Users</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.35rem', color: 'var(--text-main)' }}>
                {summary.totalUsers}
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Booking Size</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.35rem', color: 'var(--accent-gold)' }}>
                ₹{summary.averageBookingValue.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Aggregations Grid: Destinations & Top Hotels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            
            {/* Top Destinations */}
            <div className="card" style={{ padding: '1.75rem', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
                📍 Top Destination Demand
              </h3>
              {stats?.topDestinations?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {stats.topDestinations.map((dest, idx) => (
                    <div key={dest._id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <strong>{dest._id}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                          {dest.bookingCount} reservation(s)
                        </span>
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--emerald)' }}>
                        ₹{dest.revenue.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No destination bookings recorded yet.</p>
              )}
            </div>

            {/* Top Booked Properties */}
            <div className="card" style={{ padding: '1.75rem', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
                🏨 Top Performing Properties
              </h3>
              {stats?.topHotels?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {stats.topHotels.map((item, idx) => (
                    <div key={item._id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <strong>{item._id}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                          {item.bookings} stay(s) booked
                        </span>
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--emerald)' }}>
                        ₹{item.revenue.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No property bookings recorded yet.</p>
              )}
            </div>

          </div>

          {/* Recent Reservations Table */}
          <div className="card" style={{ padding: '1.75rem', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
              📋 Latest Platform Bookings
            </h3>
            {stats?.recentBookings?.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-strong)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '0.75rem' }}>Reference</th>
                      <th style={{ padding: '0.75rem' }}>Guest</th>
                      <th style={{ padding: '0.75rem' }}>Hotel Property</th>
                      <th style={{ padding: '0.75rem' }}>Stay Dates</th>
                      <th style={{ padding: '0.75rem' }}>Total</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBookings.map((b) => (
                      <tr key={b._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600, fontFamily: 'monospace' }}>
                          {b.bookingReference}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div>{b.guestName}</div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.email}</span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>{b.hotelName}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                          {b.checkIn} → {b.checkOut} ({b.nights}n)
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                          ₹{b.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            background: b.status === 'Confirmed' ? 'var(--emerald-light)' : 'var(--accent-rose-light)',
                            color: b.status === 'Confirmed' ? 'var(--emerald)' : 'var(--accent-rose)'
                          }}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No reservation history yet.</p>
            )}
          </div>
        </>
      ) : (
        /* User Management Tab */
        <div className="card" style={{ padding: '1.75rem', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--text-main)' }}>
              Registered Platform Accounts
            </h3>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Search by name, email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                style={{ padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', fontSize: '0.85rem' }}
              />

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                style={{ padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', fontSize: '0.85rem', background: '#fff' }}
              >
                <option value="">All Roles</option>
                <option value="guest">Guest</option>
                <option value="hotel_manager">Hotel Manager</option>
                <option value="admin">Administrator</option>
              </select>

              <button
                onClick={loadUsers}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Search
              </button>
            </div>
          </div>

          {userLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Fetching accounts...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-strong)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.75rem' }}>Name</th>
                    <th style={{ padding: '0.75rem' }}>Email</th>
                    <th style={{ padding: '0.75rem' }}>Phone</th>
                    <th style={{ padding: '0.75rem' }}>Current Role</th>
                    <th style={{ padding: '0.75rem' }}>Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: '0.75rem' }}>{u.email}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{u.phone || '—'}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          background: u.role === 'admin' ? '#fef3c7' : u.role === 'hotel_manager' ? '#eff6ff' : '#f4f4f5',
                          color: u.role === 'admin' ? '#92400e' : u.role === 'hotel_manager' ? '#1e40af' : '#374151'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <select
                          disabled={roleUpdatingId === u._id}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          style={{ padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', fontSize: '0.82rem', background: '#fff' }}
                        >
                          <option value="guest">guest</option>
                          <option value="hotel_manager">hotel_manager</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
