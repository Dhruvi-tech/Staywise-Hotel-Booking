import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getCompareList } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAllNotificationsAsRead } from '../utils/api';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isManager, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [compareCount, setCompareCount] = useState(0);

  // User Dropdown and Notifications Dropdown state
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  const updateCompareCount = () => {
    setCompareCount(getCompareList().length);
  };

  useEffect(() => {
    updateCompareCount();
    const handleStorageChange = () => {
      updateCompareCount();
    };
    window.addEventListener('staywise_storage_change', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('staywise_storage_change', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Fetch notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // 30s poll
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (e) {
      // Quiet fail if network hiccups
    }
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    closeMobileMenu();
    await logout();
    navigate('/');
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <header className="navbar-header" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-name">StayWise</span>
            <span className="brand-sub">Find • Compare • Book</span>
          </div>
        </Link>

        {/* Navigation Links: Home, Hotels, Compare, My Bookings */}
        <nav className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Home
          </NavLink>
          <NavLink
            to="/hotels"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Hotels
          </NavLink>
          <NavLink
            to="/compare"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Compare
            {compareCount > 0 && <span className="nav-badge">{compareCount}</span>}
          </NavLink>
          <NavLink
            to="/my-bookings"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            My Bookings
          </NavLink>
          <NavLink
            to="/verify-booking"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Verify
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to="/wishlist"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Wishlist
            </NavLink>
          )}
          {user?.role === 'hotel_manager' && (
            <NavLink
              to="/manager"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
              style={{ color: 'var(--accent-gold)' }}
            >
              🏨 Manager Portal
            </NavLink>
          )}
          {isAdmin && (
            <>
              <NavLink
                to="/manager"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Staff Portal
              </NavLink>
              <NavLink
                to="/admin"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
                style={{ color: 'var(--accent-gold)' }}
              >
                👑 Admin
              </NavLink>
            </>
          )}

          {/* Mobile Auth Links */}
          <div className="mobile-only-auth" style={{ display: 'none', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to="/profile" onClick={closeMobileMenu} className="nav-link">
                  👤 Profile ({user.name})
                </Link>
                <button
                  onClick={handleLogout}
                  style={{ textAlign: 'left', background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '0.5rem 0', fontSize: '0.95rem' }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to="/login" onClick={closeMobileMenu} className="nav-link">
                  Sign In
                </Link>
                <Link to="/register" onClick={closeMobileMenu} className="btn btn-primary" style={{ textAlign: 'center' }}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Right side actions */}
        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div ref={notifDropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  aria-label="Notifications"
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    position: 'relative'
                  }}
                >
                  🔔
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-3px',
                      background: 'var(--accent-rose)',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '46px',
                    width: '320px',
                    background: '#fff',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-floating)',
                    border: '1px solid var(--border-strong)',
                    zIndex: 1010,
                    overflow: 'hidden'
                  }}>
                    <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            style={{
                              padding: '0.75rem 1rem',
                              borderBottom: '1px solid var(--border)',
                              background: n.isRead ? '#fff' : 'var(--accent-blue-light)',
                              fontSize: '0.82rem'
                            }}
                          >
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.15rem' }}>
                              {n.title}
                            </div>
                            <div style={{ color: 'var(--text-secondary)' }}>{n.message}</div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div ref={userDropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.35rem 0.85rem 0.35rem 0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span style={{ maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                  <span style={{ fontSize: '0.65rem' }}>▼</span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '46px',
                    width: '210px',
                    background: '#fff',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-floating)',
                    border: '1px solid var(--border-strong)',
                    zIndex: 1010,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      <span style={{
                        display: 'inline-block',
                        marginTop: '0.35rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '12px',
                        background:
                          user.role === 'admin'
                            ? '#fef3c7'
                            : user.role === 'hotel_manager'
                            ? '#e0f2fe'
                            : '#f4f4f5',
                        color:
                          user.role === 'admin'
                            ? '#92400e'
                            : user.role === 'hotel_manager'
                            ? '#0369a1'
                            : '#52525b'
                      }}>
                        {user.role === 'admin'
                          ? '👑 System Administrator'
                          : user.role === 'hotel_manager'
                          ? '🏨 Hotel Manager'
                          : '🧳 Verified Guest'}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      👤 My Profile
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      💖 Saved Wishlist
                    </Link>

                    {/* Manager Links */}
                    {(user?.role === 'hotel_manager' || isAdmin) && (
                      <Link
                        to="/manager"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', color: '#0369a1', fontWeight: 600, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        🏨 Manager Portal (Staff Records)
                      </Link>
                    )}

                    {/* Admin Links */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 600, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        👑 Master Admin Console
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      style={{
                        padding: '0.65rem 1rem',
                        fontSize: '0.85rem',
                        color: 'var(--accent-rose)',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary nav-cta-btn" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                Join StayWise
              </Link>
            </div>
          )}

          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
