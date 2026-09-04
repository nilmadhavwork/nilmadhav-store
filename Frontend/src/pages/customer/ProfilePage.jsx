import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Key, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/authApi';
import { addressApi } from '../../api/addressApi';
import AddressFormModal from '../../components/checkout/AddressFormModal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

export const ProfilePage = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'addresses', 'security'

  // Personal Info Form State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Address Manager State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/profile');
      return;
    }
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user, isAuthenticated, navigate]);

  // Load Addresses
  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const list = await addressApi.getMyAddresses();
      setAddresses(list || []);
    } catch (err) {
      console.warn('Failed to load addresses:', err.message);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'addresses') {
      loadAddresses();
    }
  }, [activeTab]);

  // Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const updated = await authApi.updateProfile({
        name: profileData.name,
        phone: profileData.phone,
      });
      updateUser(updated);
      success('Profile details updated successfully');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Add / Edit Address
  const handleSaveAddress = async (formData) => {
    try {
      setSavingAddress(true);
      if (editingAddress) {
        const updated = await addressApi.update(editingAddress._id, formData);
        setAddresses((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
        success('Address updated successfully');
      } else {
        const created = await addressApi.create(formData);
        setAddresses((prev) => [created, ...prev]);
        success('Address added successfully');
      }
      setAddressModalOpen(false);
      setEditingAddress(null);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Are you sure you want to delete this delivery address?')) {
      try {
        await addressApi.delete(id);
        setAddresses((prev) => prev.filter((a) => a._id !== id));
        success('Address deleted');
      } catch (err) {
        error(err.response?.data?.message || 'Failed to delete address');
      }
    }
  };

  const handleSetDefault = async (addr) => {
    try {
      const updated = await addressApi.update(addr._id, { ...addr, isDefault: true });
      loadAddresses();
      success('Default address updated');
    } catch (err) {
      error('Failed to set default address');
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      error('Please enter your current and new passwords');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('New password and confirmation do not match');
      return;
    }
    try {
      setChangingPassword(true);
      await authApi.changePassword({ currentPassword, newPassword });
      success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '880px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
            My Account & Preferences
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Manage your personal profile, delivery destinations, and login credentials.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs-nav">
          <button
            className={`btn ${activeTab === 'personal' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', padding: '0.65rem 1.25rem' }}
            onClick={() => setActiveTab('personal')}
          >
            <User size={16} />
            <span>Personal Details</span>
          </button>

          <button
            className={`btn ${activeTab === 'addresses' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', padding: '0.65rem 1.25rem' }}
            onClick={() => setActiveTab('addresses')}
          >
            <MapPin size={16} />
            <span>Delivery Addresses ({addresses.length})</span>
          </button>

          <button
            className={`btn ${activeTab === 'security' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', padding: '0.65rem 1.25rem' }}
            onClick={() => setActiveTab('security')}
          >
            <Key size={16} />
            <span>Account Security</span>
          </button>
        </div>

        {/* TAB 1: Personal Details */}
        {activeTab === 'personal' && (
          <div style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '2rem', boxShadow: 'var(--shadow-xs)' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: '1.5rem' }}>
              Personal Information
            </h3>

            <form onSubmit={handleUpdateProfile}>
              <div className="profile-form-row-2">
                <Input
                  label="Full Name"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
                <Input
                  label="Email Address (Login ID)"
                  value={profileData.email}
                  disabled
                  hint="Email cannot be changed directly"
                />
              </div>

              <div style={{ maxWidth: '380px' }}>
                <Input
                  label="Phone Number"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                />
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                <Button variant="primary" type="submit" loading={savingProfile}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: Delivery Addresses */}
        {activeTab === 'addresses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)' }}>
                Saved Addresses
              </h3>
              <Button
                variant="outline-gold"
                size="sm"
                onClick={() => {
                  setEditingAddress(null);
                  setAddressModalOpen(true);
                }}
              >
                <Plus size={16} />
                <span>Add Address</span>
              </Button>
            </div>

            {loadingAddresses ? (
              <Spinner center />
            ) : addresses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <MapPin size={36} color="var(--color-gold-dark)" style={{ margin: '0 auto 1rem auto' }} />
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                  You do not have any saved delivery addresses yet.
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditingAddress(null);
                    setAddressModalOpen(true);
                  }}
                >
                  Add Your First Address
                </Button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    style={{
                      backgroundColor: 'var(--color-card)',
                      border: `1.5px solid ${addr.isDefault ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      boxShadow: 'var(--shadow-xs)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
                          {addr.fullName}
                        </span>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {addr.isDefault && (
                            <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                              Default
                            </span>
                          )}
                          <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                            {addr.addressType || 'HOME'}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                        <div>{addr.addressLine1}</div>
                        {addr.addressLine2 && <div>{addr.addressLine2}</div>}
                        <div>{addr.city}, {addr.state} - {addr.pincode}</div>
                        <div>{addr.country || 'India'}</div>
                        <div style={{ marginTop: '0.35rem', color: 'var(--color-text-muted)' }}>
                          Phone: {addr.phone}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                      {!addr.isDefault ? (
                        <button
                          onClick={() => handleSetDefault(addr)}
                          style={{ fontSize: '0.8rem', color: 'var(--color-gold-dark)', fontWeight: 600 }}
                        >
                          Set as Default
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                          <CheckCircle2 size={13} /> Default
                        </span>
                      )}

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.6rem' }}
                          onClick={() => {
                            setEditingAddress(addr);
                            setAddressModalOpen(true);
                          }}
                          title="Edit address"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.6rem', color: 'var(--color-danger)' }}
                          onClick={() => handleDeleteAddress(addr._id)}
                          title="Delete address"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Account Security */}
        {activeTab === 'security' && (
          <div style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '2rem', maxWidth: '520px', boxShadow: 'var(--shadow-xs)' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: '1.5rem' }}>
              Change Password
            </h3>

            <form onSubmit={handleChangePassword}>
              <Input
                label="Current Password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter existing password"
              />

              <Input
                label="New Password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
              />

              <Input
                label="Confirm New Password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />

              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                <Button variant="primary" type="submit" loading={changingPassword}>
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      <AddressFormModal
        isOpen={addressModalOpen}
        onClose={() => {
          setAddressModalOpen(false);
          setEditingAddress(null);
        }}
        onSubmit={handleSaveAddress}
        initialData={editingAddress}
        loading={savingAddress}
      />
    </div>
  );
};

export default ProfilePage;
