# Backend Missing Endpoints (TODO_BACKEND.md)

> [!NOTE]
> **STATUS UPDATE: COMPLETED & CONNECTED!**
> The backend developer has implemented and deployed:
> 1. **Razorpay Payments**: `POST /api/payments/razorpay/create-order`, `POST /api/payments/razorpay/verify`, `POST /api/payments/cod/confirm`, `GET /api/payments/order/:orderId`
> 2. **Returns Lifecycle**: `POST /api/returns`, `GET /api/returns/my`, `GET /api/returns`, `GET /api/returns/:id`, `PUT /api/returns/:id/status`
> 3. **Refunds Disbursement**: `POST /api/refunds`, `PUT /api/refunds/:id/complete`, `GET /api/refunds/my`, `GET /api/refunds`
> 4. **Store Settings**: `GET /api/settings`, `PUT /api/settings`
>
> The React frontend has been fully connected to these live backend endpoints. All fallback localStorage and mock objects have been removed.

---

## 1. Razorpay Payment APIs

### 1.1 Create Razorpay Order
- **TODO**: `POST /api/payments/razorpay/create-order`
- **Reason**: The frontend checkout flow needs to initiate a Razorpay order from backend so Razorpay's Checkout modal (`window.Razorpay`) can be opened with a genuine `order_id` and calculated `amount`.
- **Auth Required**: Yes (Customer)
- **Role**: `CUSTOMER`
- **Expected Request**:
  ```json
  {
    "orderId": "664b2e8a10f92b001a1e4o01"
  }
  ```
- **Expected Response**:
  ```json
  {
    "razorpayOrderId": "order_EK53JuOWnPn05w",
    "amount": 999900,
    "currency": "INR",
    "keyId": "rzp_test_YourKeyHere"
  }
  ```
- **Suggested Backend Implementation**:
  Install `razorpay` npm package. Initialize `new Razorpay({ key_id, key_secret })`. Call `razorpay.orders.create({ amount: order.totalAmount * 100, currency: 'INR', receipt: order.orderNumber })`. Create a record in `Payment` model with status `'PENDING'`.

---

### 1.2 Verify Razorpay Payment Signature
- **TODO**: `POST /api/payments/razorpay/verify`
- **Reason**: When the customer completes payment in Razorpay modal, Razorpay returns `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`. The backend must verify this HMAC SHA256 signature using `RAZORPAY_KEY_SECRET` to prevent tampering, then mark `Order.paymentStatus = 'PAID'` and `Order.orderStatus = 'CONFIRMED'`.
- **Auth Required**: Yes (Customer)
- **Role**: `CUSTOMER`
- **Expected Request**:
  ```json
  {
    "orderId": "664b2e8a10f92b001a1e4o01",
    "razorpayOrderId": "order_EK53JuOWnPn05w",
    "razorpayPaymentId": "pay_29QQoUBi66xm2f",
    "razorpaySignature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
  }
  ```
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Payment verified successfully",
    "order": { ... }
  }
  ```
- **Suggested Backend Implementation**:
  Use `crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(razorpayOrderId + '|' + razorpayPaymentId).digest('hex')`. If matches signature, update `Payment` record status to `'SUCCESS'` and `Order.paymentStatus = 'PAID'`, `Order.orderStatus = 'CONFIRMED'`.

---

## 2. Order Returns APIs (`Return` Model exists in `models/Return.js`)

### 2.1 Customer Request Return
- **TODO**: `POST /api/returns`
- **Reason**: Customers need to request returns for eligible delivered orders with reasons, items, and optional photo URLs.
- **Auth Required**: Yes (Customer)
- **Role**: `CUSTOMER`
- **Expected Request**:
  ```json
  {
    "orderId": "664b2e8a10f92b001a1e4o01",
    "items": [
      {
        "productId": "664b2e8a10f92b001a1e4p01",
        "quantity": 1,
        "reason": "Color mismatch with screen display"
      }
    ],
    "reason": "Defective / Mismatch",
    "description": "The zari border has slight fraying along the edge.",
    "images": ["https://res.cloudinary.com/.../defect.jpg"]
  }
  ```
- **Expected Response** (`201 Created`):
  ```json
  {
    "_id": "664b2e8a10f92b001a1e4r01",
    "returnNumber": "RET1725432000456",
    "orderId": "664b2e8a10f92b001a1e4o01",
    "userId": "664b2e8a10f92b001a1e4a11",
    "status": "REQUESTED",
    "items": [...],
    "createdAt": "..."
  }
  ```
- **Suggested Backend Implementation**:
  Verify order belongs to `req.user._id` and `order.orderStatus === 'DELIVERED'` within `returnWindowDays`. Create new `Return` document with status `'REQUESTED'`.

---

### 2.2 Customer My Returns
- **TODO**: `GET /api/returns/my`
- **Reason**: Customers need to track return status (Requested, Approved, Pickup Scheduled, Quality Check, Refund Initiated, Refunded).
- **Auth Required**: Yes (Customer)
- **Role**: `CUSTOMER`
- **Expected Response**: Array of `Return` documents populated with `orderId` and product details.

---

### 2.3 Admin All Returns
- **TODO**: `GET /api/returns`
- **Reason**: Admin needs to list all return requests, filter by status, and view customer details.
- **Auth Required**: Yes (Admin)
- **Role**: `ADMIN`
- **Expected Response**:
  ```json
  {
    "returns": [ ... ],
    "page": 1,
    "totalPages": 1,
    "totalResults": 1
  }
  ```

---

### 2.4 Admin Update Return Status
- **TODO**: `PUT /api/returns/:id/status`
- **Reason**: Admin can approve, reject, schedule pickup, or mark received.
- **Auth Required**: Yes (Admin)
- **Role**: `ADMIN`
- **Expected Request**:
  ```json
  {
    "status": "APPROVED",
    "reverseShipmentId": "SR_REV_987123"
  }
  ```
- **Expected Response**: Updated `Return` document.

---

## 3. Refunds APIs (`Refund` Model exists in `models/Refund.js`)

### 3.1 Customer My Refunds
- **TODO**: `GET /api/refunds/my`
- **Reason**: Customers need to view refund status, amount, and payment method for their returned or cancelled prepaid orders.
- **Auth Required**: Yes (Customer)
- **Role**: `CUSTOMER`
- **Expected Response**: Array of `Refund` documents.

---

### 3.2 Admin List Refunds
- **TODO**: `GET /api/refunds`
- **Reason**: Admin dashboard and refund management page needs to view all initiated and completed refunds.
- **Auth Required**: Yes (Admin)
- **Role**: `ADMIN`
- **Expected Response**: Array of `Refund` documents populated with user and order details.

---

### 3.3 Admin Process / Create Refund
- **TODO**: `POST /api/refunds`
- **Reason**: Admin can process a refund via Razorpay API or bank transfer upon successful quality check of returned items.
- **Auth Required**: Yes (Admin)
- **Role**: `ADMIN`
- **Expected Request**:
  ```json
  {
    "orderId": "664b2e8a10f92b001a1e4o01",
    "returnId": "664b2e8a10f92b001a1e4r01",
    "amount": 9999,
    "method": "RAZORPAY",
    "reason": "Return approved after quality check"
  }
  ```
- **Expected Response**:
  ```json
  {
    "_id": "664b2e8a10f92b001a1e4f01",
    "refundNumber": "REF1725432000789",
    "status": "COMPLETED",
    "amount": 9999,
    "method": "RAZORPAY",
    "processedAt": "..."
  }
  ```

---

## 4. User Profile & Admin Customers

### 4.1 Update Profile
- **TODO**: `PUT /api/auth/profile`
- **Reason**: Customer needs to update name and phone number on the Profile page.
- **Auth Required**: Yes
- **Expected Request**:
  ```json
  {
    "name": "Ananya S. Sharma",
    "phone": "9876500000"
  }
  ```
- **Expected Response**: Updated User object (without password).

---

### 4.2 Change Password
- **TODO**: `PUT /api/auth/change-password`
- **Reason**: Profile page security section to update user password.
- **Auth Required**: Yes
- **Expected Request**:
  ```json
  {
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword456"
  }
  ```
- **Expected Response**:
  ```json
  {
    "message": "Password updated successfully"
  }
  ```

---

### 4.3 Admin List Customers
- **TODO**: `GET /api/admin/customers` or `GET /api/auth/users`
- **Reason**: Admin "Customers" section needs to view registered customers with their registration date, order count, and contact info.
- **Auth Required**: Yes (Admin)
- **Role**: `ADMIN`
- **Expected Response**:
  ```json
  {
    "customers": [
      {
        "_id": "664b2e8a10f92b001a1e4a11",
        "name": "Ananya Sharma",
        "email": "ananya@example.com",
        "phone": "9876543210",
        "role": "CUSTOMER",
        "isActive": true,
        "createdAt": "2026-09-04T05:00:00.000Z"
      }
    ]
  }
  ```

---

## 5. Store Settings & Admin Dashboard Metrics

### 5.1 Get Store Settings
- **TODO**: `GET /api/settings`
- **Reason**: Frontend needs store contact details, free shipping threshold (`freeShippingAbove`), and return window days (`returnWindowDays`) from the `Setting` model.
- **Auth Required**: No (Public)
- **Role**: Public
- **Expected Response**: Setting document from `Setting.getSettings()`.

---

### 5.2 Admin Dashboard Stats
- **TODO**: `GET /api/admin/dashboard`
- **Reason**: Admin home dashboard needs high-level summary counts: total products, total orders, pending orders, delivered orders, total customers, and total revenue.
- **Auth Required**: Yes (Admin)
- **Role**: `ADMIN`
- **Expected Response**:
  ```json
  {
    "totalProducts": 48,
    "totalOrders": 124,
    "pendingOrders": 12,
    "deliveredOrders": 98,
    "totalCustomers": 86,
    "totalRevenue": 482500
  }
  ```
