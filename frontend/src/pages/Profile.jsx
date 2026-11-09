import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, changePassword } from '../utils/api';
import Loading from '../components/Loading';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile edit form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getUserProfile();
      setProfileData(data);
      setName(data.user.name || '');
      setPhone(data.user.phone || '');
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileSubmitting(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const updated = await updateUserProfile({ name, phone });
      updateUser(updated);
      setProfileMessage({ type: 'success', text: 'Profile information updated successfully.' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setPasswordSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMessage({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (loading) {
    return <Loading text="Loading your profile and member statistics..." />;
  }

  const stats = profileData?.stats || {
    totalBookings: 0,
    confirmedStays: 0,
    cancelledStays: 0,
    wishlistCount: 0
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 600 }}>
          Account & Preferences
        </span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', marginTop: '0.35rem', color: 'var(--text-main)' }}>
          Guest Profile & Security
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage your personal details, credentials, and review your hospitality journey.
        </p>
      </div>

      {/* Role-Specific Portal Actions */}
      {user?.role === 'hotel_manager' && (
        <div
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e40af' }}>
              🏨 Hotel Manager Operations Portal
            </div>
            <div style={{ fontSize: '0.85rem', color: '#1d4ed8', marginTop: '0.2rem' }}>
              Access full staff personnel records, shift scheduling, property inventory, and live guest reservations.
            </div>
          </div>
          <a
            href="/manager"
            className="btn btn-primary"
            style={{ background: '#1d4ed8', border: 'none', color: '#ffffff', fontWeight: 600, padding: '0.6rem 1.25rem' }}
          >
            Launch Manager Portal →
          </a>
        </div>
      )}

      {user?.role === 'admin' && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#854d0e' }}>
              👑 Master Administrator Access
            </div>
            <div style={{ fontSize: '0.85rem', color: '#a16207', marginTop: '0.2rem' }}>
              Full authority to manage users, role promotions, all 84 catalog hotels, and global reservations.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a
              href="/manager"
              className="btn btn-outline"
              style={{ borderColor: '#ca8a04', color: '#854d0e', fontWeight: 600, padding: '0.6rem 1rem' }}
            >
              Staff Records
            </a>
            <a
              href="/admin"
              className="btn btn-primary"
              style={{ background: '#a16207', border: 'none', color: '#ffffff', fontWeight: 600, padding: '0.6rem 1.25rem' }}
            >
              Launch Admin Console →
            </a>
          </div>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Membership Tier</span>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--accent-gold)', textTransform: 'capitalize' }}>
            {user?.role === 'admin' ? '👑 Administrator' : user?.role === 'hotel_manager' ? '🏨 Hotel Manager' : '🧳 Verified Guest'}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Reservations</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-main)' }}>
            {stats.totalBookings}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirmed Stays</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--emerald)' }}>
            {stats.confirmedStays}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saved in Wishlist</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--accent-rose)' }}>
            {stats.wishlistCount}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Personal Details Form */}
        <div className="card" style={{ padding: '2rem', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
            Personal Details
          </h2>

          {profileMessage.text && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-xs)',
              marginBottom: '1.25rem',
              fontSize: '0.88rem',
              background: profileMessage.type === 'success' ? 'var(--emerald-light)' : 'var(--accent-rose-light)',
              color: profileMessage.type === 'success' ? 'var(--emerald)' : 'var(--accent-rose)',
              borderLeft: `4px solid ${profileMessage.type === 'success' ? 'var(--emerald)' : 'var(--accent-rose)'}`
            }}>
              {profileMessage.text}
            </div>
          )}

          <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', background: 'var(--bg-subtle)', cursor: 'not-allowed', color: 'var(--text-muted)' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>Email cannot be altered once verified.</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <button
              type="submit"
              disabled={profileSubmitting}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.25rem', alignSelf: 'flex-start', marginTop: '0.5rem', cursor: profileSubmitting ? 'not-allowed' : 'pointer' }}
            >
              {profileSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card" style={{ padding: '2rem', background: '#fff', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
            Security & Password
          </h2>

          {passwordMessage.text && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-xs)',
              marginBottom: '1.25rem',
              fontSize: '0.88rem',
              background: passwordMessage.type === 'success' ? 'var(--emerald-light)' : 'var(--accent-rose-light)',
              color: passwordMessage.type === 'success' ? 'var(--emerald)' : 'var(--accent-rose)',
              borderLeft: `4px solid ${passwordMessage.type === 'success' ? 'var(--emerald)' : 'var(--accent-rose)'}`
            }}>
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter current password"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Minimum 6 characters"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-type new password"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <button
              type="submit"
              disabled={passwordSubmitting}
              className="btn btn-outline"
              style={{ padding: '0.75rem 1.25rem', alignSelf: 'flex-start', marginTop: '0.5rem', cursor: passwordSubmitting ? 'not-allowed' : 'pointer' }}
            >
              {passwordSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Profile;
