import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import { addressApi } from '../../api/addressApi';
import { orderApi } from '../../api/orderApi';
import { paymentApi } from '../../api/paymentApi';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import AddressSelector from '../../components/checkout/AddressSelector';
import AddressFormModal from '../../components/checkout/AddressFormModal';
import PaymentSelector from '../../components/checkout/PaymentSelector';
import CartSummary from '../../components/cart/CartSummary';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { items, cartSubtotal, fetchCart } = useCart();
  const { success, error, info } = useToast();
  const { codSettings, paymentSettings } = useSettings();

  const isCodEnabled = codSettings?.enabled ?? true;
  const isRazorpayEnabled = paymentSettings?.razorpayEnabled ?? true;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(() => {
    if (isCodEnabled) return 'COD';
    if (isRazorpayEnabled) return 'RAZORPAY';
    return '';
  });
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Sync selected payment method if settings update or current method gets disabled
  useEffect(() => {
    if (paymentMethod === 'COD' && !isCodEnabled) {
      setPaymentMethod(isRazorpayEnabled ? 'RAZORPAY' : '');
    } else if (paymentMethod === 'RAZORPAY' && !isRazorpayEnabled) {
      setPaymentMethod(isCodEnabled ? 'COD' : '');
    } else if (!paymentMethod) {
      if (isCodEnabled) setPaymentMethod('COD');
      else if (isRazorpayEnabled) setPaymentMethod('RAZORPAY');
    }
  }, [isCodEnabled, isRazorpayEnabled, paymentMethod]);

  // Load customer addresses
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    const loadAddresses = async () => {
      try {
        setLoading(true);
        const list = await addressApi.getMyAddresses();
        setAddresses(list || []);
        if (list && list.length > 0) {
          const defaultAddr = list.find((a) => a.isDefault);
          setSelectedAddressId(defaultAddr ? defaultAddr._id : list[0]._id);
        }
      } catch (err) {
        console.warn('Failed to load customer addresses:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, [isAuthenticated, navigate]);

  // Handle saving new address from modal
  const handleSaveAddress = async (formData) => {
    try {
      setSavingAddress(true);
      const newAddr = await addressApi.create(formData);
      setAddresses((prev) => [newAddr, ...prev]);
      setSelectedAddressId(newAddr._id);
      setAddressModalOpen(false);
      success('Address saved successfully');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  // Handle order placement flow
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      error('Please select or add a delivery address.');
      return;
    }

    if (!items || items.length === 0) {
      error('Your bag is empty.');
      navigate('/cart');
      return;
    }

    try {
      setPlacingOrder(true);

      // 1. Create order in real backend
      const order = await orderApi.createOrder({
        addressId: selectedAddressId,
        paymentMethod,
      });

      // 2. Handle Razorpay Online Payment Flow
      if (paymentMethod === 'RAZORPAY') {
        let razorpayOrder;
        try {
          razorpayOrder = await paymentApi.createRazorpayOrder(order._id, order.totalAmount);
        } catch (rzpErr) {
          try {
            await orderApi.discardUnpaidOrder(order._id);
          } catch (discardErr) {
            console.warn('Could not discard unpaid order:', discardErr.message);
          }
          await fetchCart();
          throw rzpErr;
        }

        // Check if Razorpay script is loaded on window
        if (window.Razorpay) {
          let paymentCompleted = false;

          const options = {
            key: razorpayOrder.keyId || 'rzp_test_placeholder_key',
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency || 'INR',
            name: 'Nilmadhav Sarees',
            description: `Order #${order.orderNumber}`,
            order_id: razorpayOrder.razorpayOrderId,
            prefill: {
              name: user?.name || '',
              email: user?.email || '',
              contact: user?.phone || '',
            },
            theme: {
              color: '#5B1527',
            },
            handler: async (response) => {
              paymentCompleted = true;
              try {
                // Verify payment on backend
                await paymentApi.verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: order._id,
                });
                await fetchCart();
                success(`Payment successful! Order #${order.orderNumber} confirmed.`);
                navigate(`/orders/${order._id}`);
              } catch (verifyErr) {
                const msg = verifyErr.response?.data?.message || 'Payment verification failed. Please contact support.';
                error(msg);
                navigate(`/orders/${order._id}`);
              }
            },
            modal: {
              ondismiss: async () => {
                if (paymentCompleted) return;
                try {
                  await orderApi.discardUnpaidOrder(order._id);
                } catch (discardErr) {
                  console.warn('Could not discard unpaid order:', discardErr.message);
                }
                await fetchCart();
                info('Payment cancelled. Your bag items have been retained and no order was placed.');
                setPlacingOrder(false);
              },
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          try {
            await orderApi.discardUnpaidOrder(order._id);
          } catch (discardErr) {
            console.warn('Could not discard unpaid order:', discardErr.message);
          }
          await fetchCart();
          error('Razorpay payment gateway could not be loaded. Please check your network or try Cash on Delivery.');
          setPlacingOrder(false);
        }
      } else {
        // COD order confirmed directly by backend
        await fetchCart();
        success(`Order #${order.orderNumber} placed successfully!`);
        navigate(`/orders/${order._id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order. Please try again.';
      error(msg);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return <Spinner center size="lg" />;
  }

  return (
    <div className="section">
      <div className="container">
        {/* Header */}
        <div className="checkout-page-header">
          <Link to="/cart" className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} />
            <span>Return to Bag</span>
          </Link>
          <div>
            <h1 className="checkout-page-title">
              Secure Checkout
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--color-success)' }}>
              <Lock size={13} />
              <span>256-bit Encrypted Checkout</span>
            </div>
          </div>
        </div>

        {/* Checkout Main Layout */}
        <div className="checkout-layout">
          {/* Left Column: Address and Payment Options */}
          <div>
            <AddressSelector
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={setSelectedAddressId}
              onOpenAddModal={() => setAddressModalOpen(true)}
            />

            <PaymentSelector
              selectedMethod={paymentMethod}
              onSelectMethod={setPaymentMethod}
            />
          </div>

          {/* Right Column: Order Review & Confirmation */}
          <div>
            <div className="checkout-summary-sticky">
              <CartSummary
                subtotal={cartSubtotal}
                isCheckoutPage
              />

              <div style={{ marginTop: '1.25rem' }}>
                <Button
                  variant="gold"
                  block
                  size="lg"
                  onClick={handlePlaceOrder}
                  loading={placingOrder}
                  disabled={placingOrder || !selectedAddressId || !paymentMethod || items.length === 0}
                >
                  {paymentMethod === 'COD' ? 'Confirm Cash on Delivery Order' : paymentMethod === 'RAZORPAY' ? 'Proceed to Secure Payment' : 'Payment Unavailable'}
                </Button>
              </div>

              <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                By placing your order, you agree to Nilmadhav Sarees' Terms of Service and Return Policy.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Address Modal */}
      <AddressFormModal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSubmit={handleSaveAddress}
        loading={savingAddress}
      />
    </div>
  );
};

export default CheckoutPage;
