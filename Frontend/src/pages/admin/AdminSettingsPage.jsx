import React, { useState, useEffect } from 'react';
import { Sliders, Save, RefreshCw, Truck, RotateCcw, CreditCard, Store, CheckCircle } from 'lucide-react';
import { settingApi } from '../../api/settingApi';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

export const AdminSettingsPage = () => {
  const { success, error: toastError } = useToast();
  const { fetchSettings } = useSettings();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    storeName: '',
    email: '',
    phone: '',
    address: {
      city: '',
      state: '',
      pincode: '',
    },
    shippingSettings: {
      freeShippingEnabled: true,
      defaultShippingCharge: 150,
      freeShippingAbove: 5000,
    },
    returnSettings: {
      returnWindowDays: 7,
      returnEnabled: true,
    },
    codSettings: {
      enabled: true,
    },
    paymentSettings: {
      razorpayEnabled: true,
    },
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingApi.getSettings();
      if (data) {
        setFormData({
          storeName: data.storeName || 'Nilmadhav Sarees',
          email: data.email || '',
          phone: data.phone || '',
          address: {
            city: data.address?.city || '',
            state: data.address?.state || '',
            pincode: data.address?.pincode || '',
          },
          shippingSettings: {
            freeShippingEnabled: data.shippingSettings?.freeShippingEnabled ?? true,
            defaultShippingCharge: data.shippingSettings?.defaultShippingCharge ?? 150,
            freeShippingAbove: data.shippingSettings?.freeShippingAbove ?? 5000,
          },
          returnSettings: {
            returnWindowDays: data.returnSettings?.returnWindowDays ?? 7,
            returnEnabled: data.returnSettings?.returnEnabled ?? true,
          },
          codSettings: {
            enabled: data.codSettings?.enabled ?? true,
          },
          paymentSettings: {
            razorpayEnabled: data.paymentSettings?.razorpayEnabled ?? true,
          },
        });
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to load store settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingApi.updateSettings({
        storeName: formData.storeName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        shippingSettings: {
          freeShippingEnabled: Boolean(formData.shippingSettings.freeShippingEnabled),
          defaultShippingCharge: Number(formData.shippingSettings.defaultShippingCharge),
          freeShippingAbove: Number(formData.shippingSettings.freeShippingAbove),
        },
        returnSettings: {
          returnWindowDays: Number(formData.returnSettings.returnWindowDays),
          returnEnabled: Boolean(formData.returnSettings.returnEnabled),
        },
        codSettings: {
          enabled: Boolean(formData.codSettings.enabled),
        },
        paymentSettings: {
          razorpayEnabled: Boolean(formData.paymentSettings.razorpayEnabled),
        },
      });
      await fetchSettings();
      success('Store settings saved and updated successfully!');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner center size="lg" />;
  }

  return (
    <div style={{ maxWidth: '960px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
            Store & Business Settings
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
            Configure shipping thresholds, return policy periods, and payment gateway controls.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={loadSettings}>
          <RefreshCw size={14} />
          <span>Reload</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Section 1: Store Details */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.75rem' }}>
            <Store size={20} color="var(--color-gold-dark)" />
            <h2 style={{ fontSize: '1.15rem', color: 'var(--color-primary-dark)', margin: 0 }}>
              General Store Profile
            </h2>
          </div>

          <div className="admin-form-row-2">
            <Input
              label="Store Brand Name"
              required
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              placeholder="Nilmadhav Sarees"
            />
            <Input
              label="Official Contact Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@nilmadhavsarees.com"
            />
          </div>

          <div className="admin-form-row-2" style={{ marginTop: '1rem' }}>
            <Input
              label="Customer Support Helpline"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
            <Input
              label="City"
              value={formData.address.city}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
              placeholder="Surat"
            />
          </div>

          <div className="admin-form-row-2" style={{ marginTop: '1rem' }}>
            <Input
              label="State / Province"
              value={formData.address.state}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
              placeholder="Gujarat"
            />
            <Input
              label="Pincode"
              value={formData.address.pincode}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
              placeholder="395002"
            />
          </div>
        </div>

        {/* Section 2: Shipping Rules */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.75rem' }}>
            <Truck size={20} color="var(--color-gold-dark)" />
            <h2 style={{ fontSize: '1.15rem', color: 'var(--color-primary-dark)', margin: 0 }}>
              Shipping Charges & Free Delivery Threshold
            </h2>
          </div>

          <div className="admin-form-row-2">
            <Input
              label="Default Standard Shipping Rate (₹)"
              type="number"
              min="0"
              value={formData.shippingSettings.defaultShippingCharge}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  shippingSettings: { ...formData.shippingSettings, defaultShippingCharge: e.target.value },
                })
              }
              placeholder="e.g. 150 (0 for standard free shipping)"
            />

            {formData.shippingSettings.freeShippingEnabled ? (
              <Input
                label="Complimentary Free Shipping On Orders Above (₹)"
                type="number"
                min="1"
                value={formData.shippingSettings.freeShippingAbove}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingSettings: { ...formData.shippingSettings, freeShippingAbove: e.target.value },
                  })
                }
                placeholder="e.g. 5000"
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem', backgroundColor: '#F9FAFB', borderRadius: 'var(--radius-sm)', border: '1px solid #E5E7EB', color: '#6B7280', fontSize: '0.85rem' }}>
                Free shipping threshold is disabled. Standard shipping rate will apply to all orders.
              </div>
            )}
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #F3F4F6' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--color-primary-dark)', fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={formData.shippingSettings.freeShippingEnabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingSettings: { ...formData.shippingSettings, freeShippingEnabled: e.target.checked },
                  })
                }
                style={{ width: '1.15rem', height: '1.15rem', accentColor: 'var(--color-primary)' }}
              />
              <span>Offer Complimentary Free Shipping when order total reaches threshold amount</span>
            </label>
          </div>
        </div>

        {/* Section 3: Return Policy Settings */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.75rem' }}>
            <RotateCcw size={20} color="var(--color-gold-dark)" />
            <h2 style={{ fontSize: '1.15rem', color: 'var(--color-primary-dark)', margin: 0 }}>
              Return & Replacement Policy
            </h2>
          </div>

          <div className="admin-form-row-2">
            <Input
              label="Return Window Period (Days post delivery)"
              type="number"
              min="1"
              max="60"
              value={formData.returnSettings.returnWindowDays}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  returnSettings: { ...formData.returnSettings, returnWindowDays: e.target.value },
                })
              }
              placeholder="7"
            />

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Customer Returns Policy Status</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={formData.returnSettings.returnEnabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      returnSettings: { ...formData.returnSettings, returnEnabled: e.target.checked },
                    })
                  }
                  style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--color-primary)' }}
                />
                <span>Allow customers to submit return requests</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Payment Methods */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.75rem' }}>
            <CreditCard size={20} color="var(--color-gold-dark)" />
            <h2 style={{ fontSize: '1.15rem', color: 'var(--color-primary-dark)', margin: 0 }}>
              Payment Methods Availability
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#F9FAFB' }}>
              <input
                type="checkbox"
                checked={formData.paymentSettings.razorpayEnabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentSettings: { ...formData.paymentSettings, razorpayEnabled: e.target.checked },
                  })
                }
                style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--color-primary)' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Razorpay Online Gateway</div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  Enable UPI, Credit/Debit Cards, NetBanking, and Wallets via Razorpay checkout
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#F9FAFB' }}>
              <input
                type="checkbox"
                checked={formData.codSettings.enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    codSettings: { ...formData.codSettings, enabled: e.target.checked },
                  })
                }
                style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--color-primary)' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Cash on Delivery (COD)</div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  Allow customers to pay in cash upon doorstep delivery by courier
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Save Button Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
          <Button variant="primary" size="lg" type="submit" loading={saving}>
            <Save size={18} />
            <span>Save Settings Changes</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
