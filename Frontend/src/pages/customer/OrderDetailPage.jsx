import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  RotateCcw,
  XCircle,
  FileText,
  RefreshCw,
} from "lucide-react";
import { orderApi } from "../../api/orderApi";
import { paymentApi } from "../../api/paymentApi";
import { returnApi } from "../../api/returnApi";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import OrderTimeline from "../../components/order/OrderTimeline";
import CancelOrderModal from "../../components/order/CancelOrderModal";
import ReturnOrderModal from "../../components/order/ReturnOrderModal";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import {
  formatCurrency,
  formatDate,
  getOrderStatusBadge,
  getPaymentStatusBadge,
} from "../../utils/formatters";

export const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [existingReturns, setExistingReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [retryingPayment, setRetryingPayment] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const [data, returnsData] = await Promise.all([
          orderApi.getOrderById(id),
          returnApi.getMyReturns({ orderId: id }).catch(() => []),
        ]);
        setOrder(data);
        setExistingReturns(returnsData || []);
      } catch (err) {
        console.warn("Failed to load order details:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  // Handle Cancellation
  const handleCancelOrder = async (reason) => {
    try {
      setCancelling(true);
      const updatedOrder = await orderApi.cancelOrder(order._id, reason);
      setOrder(updatedOrder);
      setCancelModalOpen(false);
      success("Order has been cancelled successfully.");
    } catch (err) {
      error(err.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  // Handle Return Submission
  const handleReturnSubmit = async (returnData) => {
    try {
      setSubmittingReturn(true);
      await returnApi.createReturn(returnData);
      const updatedReturns = await returnApi.getMyReturns({ orderId: id }).catch(() => []);
      setExistingReturns(updatedReturns || []);
      setReturnModalOpen(false);
      success(
        "Return request submitted successfully. Our team will review it within 24 hours.",
      );
      navigate("/returns");
    } catch (err) {
      error(err.response?.data?.message || "Failed to submit return request.");
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Handle Retry Online Payment
  const handleRetryPayment = async () => {
    if (!window.Razorpay) {
      error(
        "Razorpay payment gateway could not be loaded. Please refresh or check your internet connection.",
      );
      return;
    }

    try {
      setRetryingPayment(true);

      // Create/Retrieve Razorpay order from backend
      const razorpayOrder = await paymentApi.createRazorpayOrder(order._id);

      const options = {
        key: razorpayOrder.keyId || "rzp_test_placeholder_key",
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "Nilmadhav Sarees",
        description: `Retry Payment for Order #${order.orderNumber}`,
        order_id: razorpayOrder.razorpayOrderId,
        prefill: {
          name: user?.name || shippingAddress.fullName || "",
          email: user?.email || "",
          contact: shippingAddress.phone || user?.phone || "",
        },
        theme: {
          color: "#5B1527",
        },
        handler: async (response) => {
          try {
            await paymentApi.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });
            const updatedOrder = await orderApi.getOrderById(order._id);
            setOrder(updatedOrder);
            success(
              `Payment completed successfully! Order #${order.orderNumber} is now confirmed.`,
            );
          } catch (verifyErr) {
            const msg =
              verifyErr.response?.data?.message ||
              "Payment verification failed.";
            error(msg);
          } finally {
            setRetryingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setRetryingPayment(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        error(
          response.error?.description || "Payment failed. Please try again.",
        );
        setRetryingPayment(false);
      });
      rzp.open();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to initiate retry payment. Please try again.";
      error(msg);
      setRetryingPayment(false);
    }
  };

  if (loading) {
    return <Spinner center size="lg" />;
  }

  if (!order) {
    return (
      <div
        className="section container"
        style={{ textAlign: "center", padding: "5rem 1.5rem" }}
      >
        <h2
          style={{ color: "var(--color-primary-dark)", marginBottom: "1rem" }}
        >
          Order Not Found
        </h2>
        <Link to="/orders" className="btn btn-primary">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const {
    orderNumber,
    createdAt,
    orderStatus,
    paymentStatus,
    paymentMethod,
    subtotal,
    shippingCost,
    totalAmount,
    shippingAddress = {},
    shipping = {},
    items = [],
  } = order;

  const activeReturns = (existingReturns || []).filter(
    (r) => r.status !== "REJECTED"
  );
  const hasExistingReturn = activeReturns.length > 0;

  // Cancellation is permitted only before dispatch
  const canCancel = ["PENDING", "CONFIRMED", "PACKED"].includes(orderStatus);
  // Return is permitted once delivered ONLY IF no return request has been submitted for this order yet
  const canReturn = orderStatus === "DELIVERED" && !hasExistingReturn;
  // Retry Payment is allowed when payment is PENDING or FAILED, order is not CANCELLED, and payment method is not COD
  const canRetryPayment =
    (paymentStatus === "PENDING" || paymentStatus === "FAILED") &&
    orderStatus !== "CANCELLED" &&
    paymentMethod !== "COD";

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: "900px" }}>
        {/* Navigation & Header */}
        <div style={{ marginBottom: "2rem" }}>
          <Link
            to="/orders"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--color-text-secondary)",
              fontSize: "0.9rem",
              marginBottom: "1rem",
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to All Orders</span>
          </Link>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "1.25rem",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "0.4rem",
                  flexWrap: "wrap",
                }}
              >
                <h1
                  style={{
                    fontSize: "1.85rem",
                    color: "var(--color-primary-dark)",
                  }}
                >
                  Order #{orderNumber}
                </h1>
                <span className={`badge ${getOrderStatusBadge(orderStatus)}`}>
                  {`Order : ${orderStatus}`}
                </span>
                <span
                  className={`badge ${getPaymentStatusBadge(paymentStatus)}`}
                >
                  {`Payment : ${paymentStatus} (${paymentMethod})`}
                </span>
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "var(--color-text-muted)",
                }}
              >
                Ordered on {formatDate(createdAt, true)} &bull; Payment via{" "}
                {paymentMethod}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap",marginTop:"1rem" }}>
            {canCancel && (
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelModalOpen(true)}
                  style={{
                    color: "var(--color-danger)",
                    borderColor: "var(--color-danger)",
                  }}
                >
                  <XCircle size={15} />
                  <span>Cancel Order</span>
                </Button>
              </div>
            )}

            {canReturn && (
              <Button
                variant="outline-gold"
                size="sm"
                onClick={() => setReturnModalOpen(true)}
              >
                <RotateCcw size={15} />
                <span>Request Return</span>
              </Button>
            )}
          </div>
        </div>

        {/* Active Return Notice Banner */}
        {activeReturns.length > 0 && (
          <div
            style={{
              backgroundColor: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: "var(--radius-md)",
              padding: "1rem 1.25rem",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              color: "#1E40AF",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <RotateCcw size={20} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Return Request Active ({activeReturns.length})
                </div>
                <div style={{ fontSize: "0.85rem", color: "#1D4ED8", marginTop: "0.15rem" }}>
                  Latest Status: <strong>{activeReturns[0].status.replace(/_/g, " ")}</strong> (Return #{activeReturns[0].returnNumber})
                </div>
              </div>
            </div>
            <Link to="/returns" className="btn btn-sm" style={{ backgroundColor: "#2563EB", color: "#FFFFFF", borderRadius: "var(--radius-sm)", padding: "0.4rem 0.85rem", fontSize: "0.85rem", textDecoration: "none" }}>
              View Return Details
            </Link>
          </div>
        )}

        {/* Cancelled Order Refund Notice Banner */}
        {orderStatus === "CANCELLED" && (
          <div
            style={{
              backgroundColor: "#FEF3C7",
              border: "1px solid #FCD34D",
              borderRadius: "var(--radius-md)",
              padding: "1rem 1.25rem",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              color: "#92400E",
            }}
          >
            <XCircle size={20} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                This order was cancelled
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#B45309",
                  marginTop: "0.15rem",
                }}
              >
                {order.cancellationReason
                  ? `Reason: "${order.cancellationReason}"`
                  : ""}
                {paymentStatus === "PAID"
                  ? " • Reimbursement request logged and will be processed per store policy."
                  : ""}
              </div>
            </div>
          </div>
        )}

        {/* Shiprocket Fulfillment Visual Timeline */}
        <div
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "1.75rem",
            marginBottom: "2rem",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <h3
            style={{
              fontSize: "1.2rem",
              color: "var(--color-primary-dark)",
              marginBottom: "0.5rem",
            }}
          >
            Shiprocket Logistics Progress
          </h3>
          <OrderTimeline orderStatus={orderStatus} shipping={shipping} />
        </div>

        {/* Two-Column Details Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {/* Shipping Address */}
          <div
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "1.5rem",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
                color: "var(--color-primary-dark)",
              }}
            >
              <MapPin size={18} />
              <h3 style={{ fontSize: "1.15rem" }}>Delivery Address</h3>
            </div>
            <div
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "var(--color-text)",
                marginBottom: "0.35rem",
              }}
            >
              {shippingAddress.fullName}
            </div>
            <div
              style={{
                fontSize: "0.9rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.5,
                marginBottom: "0.5rem",
              }}
            >
              <div>{shippingAddress.addressLine1}</div>
              {shippingAddress.addressLine2 && (
                <div>{shippingAddress.addressLine2}</div>
              )}
              <div>
                {shippingAddress.city}, {shippingAddress.state} -{" "}
                {shippingAddress.pincode}
              </div>
              <div>{shippingAddress.country || "India"}</div>
            </div>
            <div
              style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}
            >
              Contact: {shippingAddress.phone}
            </div>
          </div>

          {/* Payment & Billing Summary */}
          <div
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "1.5rem",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
                color: "var(--color-primary-dark)",
              }}
            >
              <CreditCard size={18} />
              <h3 style={{ fontSize: "1.15rem" }}>Payment Summary</h3>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
              }}
            >
              <span style={{ color: "var(--color-text-secondary)" }}>
                Payment Mode
              </span>
              <span style={{ fontWeight: 600 }}>
                {paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : "Online (Razorpay)"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
              }}
            >
              <span style={{ color: "var(--color-text-secondary)" }}>
                Items Subtotal
              </span>
              <span style={{ fontWeight: 600 }}>
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.75rem",
                fontSize: "0.9rem",
              }}
            >
              <span style={{ color: "var(--color-text-secondary)" }}>
                Shipping Charges
              </span>
              <span
                style={{
                  fontWeight: 600,
                  color:
                    shippingCost === 0 ? "var(--color-success)" : "inherit",
                }}
              >
                {shippingCost === 0 ? "FREE" : formatCurrency(shippingCost)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px dashed var(--color-border)",
                paddingTop: "0.75rem",
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "var(--color-primary-dark)",
              }}
            >
              <span>Total Paid / Payable</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>

            {canRetryPayment && (
              <div
                style={{
                  marginTop: "1.25rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--color-border-subtle)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#b45309",
                    backgroundColor: "#fef3c7",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  ⚠️ Payment is pending. Click below to complete online payment.
                </div>
                <Button
                  variant="gold"
                  block
                  size="sm"
                  onClick={handleRetryPayment}
                  loading={retryingPayment}
                >
                  <RefreshCw size={15} />
                  <span>Retry Payment Now</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Ordered Items Table */}
        <div
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "1.75rem",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              color: "var(--color-primary-dark)",
              marginBottom: "1.25rem",
              borderBottom: "1px solid var(--color-border-subtle)",
              paddingBottom: "0.75rem",
            }}
          >
            Ordered Items ({items.length})
          </h3>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            {items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1.25rem",
                  borderBottom:
                    idx < items.length - 1
                      ? "1px solid var(--color-border-subtle)"
                      : "none",
                  paddingBottom: idx < items.length - 1 ? "1.25rem" : "0",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80"
                    }
                    alt={item.productName}
                    style={{
                      width: "65px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                  <div>
                    <h4
                      style={{
                        fontSize: "1.05rem",
                        color: "var(--color-text)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {item.productName}
                    </h4>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      SKU: {item.sku || "N/A"} &bull; Qty:{" "}
                      <strong>{item.quantity}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "var(--color-primary-dark)",
                    }}
                  >
                    {formatCurrency(item.total || item.price * item.quantity)}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {formatCurrency(item.price)} each
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirmCancel={handleCancelOrder}
        orderNumber={orderNumber}
        loading={cancelling}
      />

      {/* Return Request Modal */}
      <ReturnOrderModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        order={order}
        existingReturns={existingReturns}
        onSubmitReturn={handleReturnSubmit}
        loading={submittingReturn}
      />
    </div>
  );
};

export default OrderDetailPage;
