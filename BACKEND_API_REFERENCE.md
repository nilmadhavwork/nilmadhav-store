# Backend API Reference — Nilmadhav Saree Store

Comprehensive documentation of all existing backend APIs based on the actual backend source code (`server/src`).

**Base URL**: `http://localhost:5000/api`
**CORS**: Enabled for all origins (`app.use(cors())`).
**Standard Error Format**:
```json
{
  "message": "Error description message",
  "stack": "Stack trace (omitted in production)"
}
```

---

## 1. Authentication & User Profile (`/api/auth`)

### 1.1 Register User
- **METHOD**: `POST`
- **ENDPOINT**: `/api/auth/register`
- **AUTH REQUIRED**: No
- **ROLE**: Public
- **REQUEST**:
  ```json
  {
    "name": "Ananya Sharma",
    "email": "ananya@example.com",
    "password": "password123",
    "phone": "9876543210"
  }
  ```
- **RESPONSE** (`201 Created`):
  ```json
  {
    "_id": "664b2e8a10f92b001a1e4a11",
    "name": "Ananya Sharma",
    "email": "ananya@example.com",
    "role": "CUSTOMER",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **ERROR RESPONSE** (`400 Bad Request`):
  ```json
  {
    "message": "Name, email, and password are required"
  }
  ```
  or
  ```json
  {
    "message": "Email already registered"
  }
  ```

---

### 1.2 Login User
- **METHOD**: `POST`
- **ENDPOINT**: `/api/auth/login`
- **AUTH REQUIRED**: No
- **ROLE**: Public (Customer & Admin)
- **REQUEST**:
  ```json
  {
    "email": "ananya@example.com",
    "password": "password123"
  }
  ```
- **RESPONSE** (`200 OK`):
  ```json
  {
    "_id": "664b2e8a10f92b001a1e4a11",
    "name": "Ananya Sharma",
    "email": "ananya@example.com",
    "role": "CUSTOMER",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **ERROR RESPONSE** (`400 Bad Request` / `401 Unauthorized` / `403 Forbidden`):
  ```json
  {
    "message": "Email and password are required"
  }
  ```
  ```json
  {
    "message": "Invalid email or password"
  }
  ```
  ```json
  {
    "message": "Account is deactivated"
  }
  ```

---

### 1.3 Get Current User Profile
- **METHOD**: `GET`
- **ENDPOINT**: `/api/auth/me`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: Any authenticated user (Customer / Admin)
- **REQUEST**: None (Headers: `Authorization: Bearer <token>`)
- **RESPONSE** (`200 OK`):
  ```json
  {
    "_id": "664b2e8a10f92b001a1e4a11",
    "name": "Ananya Sharma",
    "email": "ananya@example.com",
    "phone": "9876543210",
    "role": "CUSTOMER",
    "isActive": true,
    "createdAt": "2026-09-04T05:00:00.000Z",
    "updatedAt": "2026-09-04T05:00:00.000Z"
  }
  ```
- **ERROR RESPONSE** (`401 Unauthorized`):
  ```json
  {
    "message": "Not authorized, no token provided"
  }
  ```
  or
  ```json
  {
    "message": "Not authorized, token invalid or expired"
  }
  ```

---

## 2. Categories (`/api/categories`)

### 2.1 Get All Categories
- **METHOD**: `GET`
- **ENDPOINT**: `/api/categories`
- **AUTH REQUIRED**: No
- **ROLE**: Public
- **REQUEST**: None
- **RESPONSE** (`200 OK`):
  ```json
  [
    {
      "_id": "664b2e8a10f92b001a1e4c01",
      "name": "Banarasi Silk",
      "slug": "banarasi-silk",
      "description": "Rich heritage Banarasi silk sarees crafted for weddings and regal occasions.",
      "image": "https://res.cloudinary.com/.../banarasi.jpg",
      "isActive": true,
      "createdAt": "2026-09-04T05:00:00.000Z",
      "updatedAt": "2026-09-04T05:00:00.000Z"
    }
  ]
  ```
- **ERROR RESPONSE**: Standard 500 server error JSON.

---

### 2.2 Get Category by Slug
- **METHOD**: `GET`
- **ENDPOINT**: `/api/categories/:slug`
- **AUTH REQUIRED**: No
- **ROLE**: Public
- **REQUEST**: None (Params: `:slug`)
- **RESPONSE** (`200 OK`):
  ```json
  {
    "_id": "664b2e8a10f92b001a1e4c01",
    "name": "Banarasi Silk",
    "slug": "banarasi-silk",
    "description": "Rich heritage Banarasi silk sarees...",
    "image": "https://res.cloudinary.com/.../banarasi.jpg",
    "isActive": true
  }
  ```
- **ERROR RESPONSE** (`404 Not Found`):
  ```json
  {
    "message": "Category not found"
  }
  ```

---

### 2.3 Create Category
- **METHOD**: `POST`
- **ENDPOINT**: `/api/categories`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: `ADMIN` only
- **REQUEST**:
  ```json
  {
    "name": "Kanjivaram Silk",
    "description": "Lustrous pure mulberry silk sarees with pure gold zari borders.",
    "image": "https://res.cloudinary.com/.../kanjivaram.jpg"
  }
  ```
- **RESPONSE** (`201 Created`):
  ```json
  {
    "_id": "664b2e8a10f92b001a1e4c02",
    "name": "Kanjivaram Silk",
    "slug": "kanjivaram-silk",
    "description": "Lustrous pure mulberry silk...",
    "image": "https://res.cloudinary.com/.../kanjivaram.jpg",
    "isActive": true,
    "createdAt": "2026-09-04T05:00:00.000Z",
    "updatedAt": "2026-09-04T05:00:00.000Z"
  }
  ```
- **ERROR RESPONSE** (`400 Bad Request` / `403 Forbidden`):
  ```json
  {
    "message": "Category name is required"
  }
  ```
  ```json
  {
    "message": "Admin access required"
  }
  ```

---

### 2.4 Update Category
- **METHOD**: `PUT`
- **ENDPOINT**: `/api/categories/:id`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: `ADMIN` only
- **REQUEST**:
  ```json
  {
    "name": "Pure Kanjivaram Silk",
    "description": "Updated description",
    "image": "https://res.cloudinary.com/...",
    "isActive": true
  }
  ```
- **RESPONSE** (`200 OK`): Updated category object.
- **ERROR RESPONSE** (`404 Not Found` / `403 Forbidden`):
  ```json
  {
    "message": "Category not found"
  }
  ```

---

### 2.5 Delete / Deactivate Category
- **METHOD**: `DELETE`
- **ENDPOINT**: `/api/categories/:id`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: `ADMIN` only
- **REQUEST**: None
- **RESPONSE** (`200 OK`):
  ```json
  {
    "message": "Category deactivated",
    "category": {
      "_id": "664b2e8a10f92b001a1e4c02",
      "isActive": false
    }
  }
  ```

---

## 3. Products (`/api/products`)

### 3.1 Get Products (Filter, Search, Paginate)
- **METHOD**: `GET`
- **ENDPOINT**: `/api/products`
- **AUTH REQUIRED**: No
- **ROLE**: Public
- **QUERY PARAMETERS**:
  - `category`: Category ObjectId (string)
  - `fabric`: Fabric name search regex (e.g. `Silk`, `Georgette`)
  - `color`: Color name search regex (e.g. `Red`, `Maroon`)
  - `minPrice`: Number (e.g. `1000`)
  - `maxPrice`: Number (e.g. `10000`)
  - `search`: Text query string (searches MongoDB text index on `name` and `description`)
  - `page`: Number (defaults to `1`)
  - `limit`: Number (defaults to `20`)
- **RESPONSE** (`200 OK`):
  ```json
  {
    "products": [
      {
        "_id": "664b2e8a10f92b001a1e4p01",
        "name": "Crimson Zari Banarasi Silk Saree",
        "slug": "crimson-zari-banarasi-silk-saree",
        "description": "Exquisite crimson Banarasi saree with intricate golden zari floral motifs.",
        "categoryId": {
          "_id": "664b2e8a10f92b001a1e4c01",
          "name": "Banarasi Silk",
          "slug": "banarasi-silk"
        },
        "price": 12500,
        "discountPrice": 9999,
        "stock": 15,
        "sku": "BAN-CRM-001",
        "fabric": "Pure Katan Silk",
        "color": "Crimson Red",
        "pattern": "Floral Jaal",
        "occasion": "Bridal / Festive",
        "blouseIncluded": true,
        "blouseColor": "Matching Crimson",
        "careInstructions": "Dry clean only",
        "images": [
          {
            "url": "https://res.cloudinary.com/.../image1.jpg",
            "publicId": "saree-products/img1",
            "isPrimary": true,
            "sortOrder": 0
          },
          {
            "url": "https://res.cloudinary.com/.../image2.jpg",
            "publicId": "saree-products/img2",
            "isPrimary": false,
            "sortOrder": 1
          }
        ],
        "isActive": true,
        "createdAt": "2026-09-04T05:00:00.000Z",
        "updatedAt": "2026-09-04T05:00:00.000Z"
      }
    ],
    "page": 1,
    "totalPages": 1,
    "totalResults": 1
  }
  ```

---

### 3.2 Get Product by Slug
- **METHOD**: `GET`
- **ENDPOINT**: `/api/products/:slug`
- **AUTH REQUIRED**: No
- **ROLE**: Public
- **REQUEST**: None (Params: `:slug`)
- **RESPONSE** (`200 OK`): Single Product object with populated `categoryId: { _id, name, slug }`.
- **ERROR RESPONSE** (`404 Not Found`):
  ```json
  {
    "message": "Product not found"
  }
  ```

---

### 3.3 Create Product (Multipart Form-Data)
- **METHOD**: `POST`
- **ENDPOINT**: `/api/products`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: `ADMIN` only
- **REQUEST CONTENT-TYPE**: `multipart/form-data`
- **FORM FIELDS**:
  - `name`: string (required)
  - `description`: string (required)
  - `categoryId`: string ObjectId (required)
  - `price`: number (required)
  - `sku`: string (required)
  - `discountPrice`: number (optional)
  - `stock`: number (required)
  - `fabric`: string (optional)
  - `color`: string (optional)
  - `pattern`: string (optional)
  - `occasion`: string (optional)
  - `blouseIncluded`: boolean or `"true"`/`"false"` (optional)
  - `blouseColor`: string (optional)
  - `careInstructions`: string (optional)
  - `images`: file[] (up to 6 files, JPG/PNG/WEBP, max 5MB each)
- **RESPONSE** (`201 Created`): Product object with uploaded Cloudinary `images`.
- **ERROR RESPONSE** (`400 Bad Request` / `403 Forbidden`):
  ```json
  {
    "message": "name, description, categoryId, price, and sku are required"
  }
  ```

---

### 3.4 Update Product
- **METHOD**: `PUT`
- **ENDPOINT**: `/api/products/:id`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: `ADMIN` only
- **REQUEST CONTENT-TYPE**: `multipart/form-data` or `application/json`
- **REQUEST BODY**: Any product fields to update. If `images` files are passed, they are appended to the product's existing images.
- **RESPONSE** (`200 OK`): Updated product object.

---

### 3.5 Delete Product Image
- **METHOD**: `DELETE`
- **ENDPOINT**: `/api/products/:id/images`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: `ADMIN` only
- **REQUEST**:
  ```json
  {
    "publicId": "saree-products/img1"
  }
  ```
- **RESPONSE** (`200 OK`):
  ```json
  {
    "message": "Image removed",
    "product": { ... }
  }
  ```

---

### 3.6 Delete / Deactivate Product
- **METHOD**: `DELETE`
- **ENDPOINT**: `/api/products/:id`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: `ADMIN` only
- **REQUEST**: None
- **RESPONSE** (`200 OK`):
  ```json
  {
    "message": "Product deactivated",
    "product": { ... }
  }
  ```

---

## 4. Shopping Cart (`/api/cart`)

### 4.1 Get Cart
- **METHOD**: `GET`
- **ENDPOINT**: `/api/cart`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: Authenticated Customer
- **REQUEST**: None
- **RESPONSE** (`200 OK`):
  ```json
  {
    "_id": "664b2e8a10f92b001a1e4c99",
    "userId": "664b2e8a10f92b001a1e4a11",
    "items": [
      {
        "productId": {
          "_id": "664b2e8a10f92b001a1e4p01",
          "name": "Crimson Zari Banarasi Silk Saree",
          "slug": "crimson-zari-banarasi-silk-saree",
          "price": 12500,
          "discountPrice": 9999,
          "images": [ { "url": "...", "publicId": "...", "isPrimary": true } ],
          "stock": 15,
          "isActive": true
        },
        "quantity": 2,
        "price": 9999
      }
    ],
    "createdAt": "...",
    "updatedAt": "..."
  }
  ```

---

### 4.2 Add Item to Cart
- **METHOD**: `POST`
- **ENDPOINT**: `/api/cart/items`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: Authenticated Customer
- **REQUEST**:
  ```json
  {
    "productId": "664b2e8a10f92b001a1e4p01",
    "quantity": 1
  }
  ```
- **RESPONSE** (`201 Created`): Populated Cart object.
- **ERROR RESPONSE** (`400 Bad Request` / `404 Not Found`):
  ```json
  {
    "message": "Not enough stock available"
  }
  ```

---

### 4.3 Update Cart Item Quantity
- **METHOD**: `PUT`
- **ENDPOINT**: `/api/cart/items/:productId`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: Authenticated Customer
- **REQUEST**:
  ```json
  {
    "quantity": 3
  }
  ```
- **RESPONSE** (`200 OK`): Populated Cart object.

---

### 4.4 Remove Single Cart Item
- **METHOD**: `DELETE`
- **ENDPOINT**: `/api/cart/items/:productId`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: Authenticated Customer
- **REQUEST**: None
- **RESPONSE** (`200 OK`): Populated Cart object.

---

### 4.5 Clear Cart
- **METHOD**: `DELETE`
- **ENDPOINT**: `/api/cart`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: Authenticated Customer
- **REQUEST**: None
- **RESPONSE** (`200 OK`):
  ```json
  {
    "message": "Cart cleared",
    "cart": {
      "_id": "...",
      "userId": "...",
      "items": []
    }
  }
  ```

---

## 5. Wishlist (`/api/wishlist`)

### 5.1 Get Wishlist
- **METHOD**: `GET`
- **ENDPOINT**: `/api/wishlist`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: Authenticated Customer
- **REQUEST**: None
- **RESPONSE** (`200 OK`):
  ```json
  {
    "_id": "664b2e8a10f92b001a1e4w01",
    "userId": "664b2e8a10f92b001a1e4a11",
    "products": [
      {
        "productId": {
          "_id": "664b2e8a10f92b001a1e4p01",
          "name": "Crimson Zari Banarasi Silk Saree",
          "slug": "crimson-zari-banarasi-silk-saree",
          "price": 12500,
          "discountPrice": 9999,
          "images": [ { "url": "..." } ],
          "isActive": true
        },
        "addedAt": "2026-09-04T05:00:00.000Z"
      }
    ]
  }
  ```

---

### 5.2 Add Product to Wishlist
- **METHOD**: `POST`
- **ENDPOINT**: `/api/wishlist/:productId`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: Authenticated Customer
- **REQUEST**: None
- **RESPONSE** (`201 Created`): Populated Wishlist object.

---

### 5.3 Remove Product from Wishlist
- **METHOD**: `DELETE`
- **ENDPOINT**: `/api/wishlist/:productId`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: Authenticated Customer
- **REQUEST**: None
- **RESPONSE** (`200 OK`): Populated Wishlist object.

---

### 5.4 Move Product from Wishlist to Cart
- **METHOD**: `POST`
- **ENDPOINT**: `/api/wishlist/:productId/move-to-cart`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: Authenticated Customer
- **REQUEST**: None
- **RESPONSE** (`200 OK`):
  ```json
  {
    "message": "Moved to cart",
    "cart": { ... },
    "wishlist": { ... }
  }
  ```

---

## 6. Addresses (`/api/addresses`)

### 6.1 Create Address
- **METHOD**: `POST`
- **ENDPOINT**: `/api/addresses`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: Authenticated Customer
- **REQUEST**:
  ```json
  {
    "fullName": "Ananya Sharma",
    "phone": "9876543210",
    "addressLine1": "Flat 402, Lotus Apartments",
    "addressLine2": "Near City Garden, MG Road",
    "city": "Surat",
    "state": "Gujarat",
    "pincode": "395007",
    "country": "India",
    "addressType": "HOME",
    "isDefault": true
  }
  ```
- **RESPONSE** (`201 Created`): Address object.
- **ERROR RESPONSE** (`400 Bad Request`):
  ```json
  {
    "message": "fullName, phone, addressLine1, city, state, and pincode are required"
  }
  ```

---

### 6.2 Get My Addresses
- **METHOD**: `GET`
- **ENDPOINT**: `/api/addresses`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: Authenticated Customer
- **REQUEST**: None
- **RESPONSE** (`200 OK`): Array of Address objects, sorted with default first.

---

### 6.3 Get Address by ID
- **METHOD**: `GET`
- **ENDPOINT**: `/api/addresses/:id`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: Authenticated Customer (must own address)
- **RESPONSE** (`200 OK`): Address object.

---

### 6.4 Update Address
- **METHOD**: `PUT`
- **ENDPOINT**: `/api/addresses/:id`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: Authenticated Customer (must own address)
- **REQUEST**: Updated address fields.
- **RESPONSE** (`200 OK`): Updated Address object.

---

### 6.5 Delete Address
- **METHOD**: `DELETE`
- **ENDPOINT**: `/api/addresses/:id`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: Authenticated Customer (must own address)
- **REQUEST**: None
- **RESPONSE** (`200 OK`):
  ```json
  {
    "message": "Address deleted"
  }
  ```

---

## 7. Orders & Shiprocket Fulfillment (`/api/orders`)

### 7.1 Place Order from Cart
- **METHOD**: `POST`
- **ENDPOINT**: `/api/orders`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: Authenticated Customer
- **REQUEST**:
  ```json
  {
    "addressId": "664b2e8a10f92b001a1e4d01",
    "paymentMethod": "COD"
  }
  ```
  *(Supported `paymentMethod` values: `"COD"`, `"RAZORPAY"`)*
- **RESPONSE** (`201 Created`):
  ```json
  {
    "_id": "664b2e8a10f92b001a1e4o01",
    "orderNumber": "ORD1725432000123",
    "userId": "664b2e8a10f92b001a1e4a11",
    "items": [
      {
        "productId": "664b2e8a10f92b001a1e4p01",
        "productName": "Crimson Zari Banarasi Silk Saree",
        "sku": "BAN-CRM-001",
        "quantity": 1,
        "price": 9999,
        "total": 9999,
        "image": "https://res.cloudinary.com/.../img1.jpg"
      }
    ],
    "shippingAddress": {
      "fullName": "Ananya Sharma",
      "phone": "9876543210",
      "addressLine1": "Flat 402, Lotus Apartments",
      "addressLine2": "MG Road",
      "city": "Surat",
      "state": "Gujarat",
      "pincode": "395007",
      "country": "India"
    },
    "subtotal": 9999,
    "shippingCost": 0,
    "discount": 0,
    "totalAmount": 9999,
    "paymentMethod": "COD",
    "paymentStatus": "PENDING",
    "orderStatus": "PENDING",
    "shipping": {
      "provider": "SHIPROCKET",
      "status": "NOT_CREATED"
    },
    "createdAt": "2026-09-04T05:00:00.000Z",
    "updatedAt": "2026-09-04T05:00:00.000Z"
  }
  ```
- **ERROR RESPONSE** (`400 Bad Request` / `404 Not Found`):
  ```json
  {
    "message": "Cart is empty"
  }
  ```
  or
  ```json
  {
    "message": "Insufficient stock for Crimson Zari Banarasi Silk Saree"
  }
  ```

---

### 7.2 Get Customer Order History
- **METHOD**: `GET`
- **ENDPOINT**: `/api/orders/my`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: Authenticated Customer
- **REQUEST**: None
- **RESPONSE** (`200 OK`): Array of Order objects sorted by newest first.

---

### 7.3 Get Order Details by ID
- **METHOD**: `GET`
- **ENDPOINT**: `/api/orders/:id`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: Order Owner or `ADMIN`
- **REQUEST**: None (Params: `:id`)
- **RESPONSE** (`200 OK`): Single Order object populated with `userId: { name, email, phone }`.
- **ERROR RESPONSE** (`403 Forbidden` / `404 Not Found`):
  ```json
  {
    "message": "Not authorized to view this order"
  }
  ```

---

### 7.4 Cancel Order (Customer & Admin)
- **METHOD**: `PUT`
- **ENDPOINT**: `/api/orders/:id/cancel`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: Order Owner or `ADMIN`
- **REQUEST**:
  ```json
  {
    "cancellationReason": "Changed mind about the color"
  }
  ```
- **RESPONSE** (`200 OK`): Order object with `orderStatus: "CANCELLED"`, restored product stock, and `cancelledAt` timestamp.
- **ERROR RESPONSE** (`400 Bad Request`):
  ```json
  {
    "message": "Order already shipped, cannot cancel — request a return instead"
  }
  ```

---

### 7.5 Get All Orders (Admin)
- **METHOD**: `GET`
- **ENDPOINT**: `/api/orders`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: `ADMIN` only
- **QUERY PARAMETERS**:
  - `orderStatus`: `PENDING`, `CONFIRMED`, `PACKED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `RTO`
  - `paymentStatus`: `PENDING`, `PAID`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED`
  - `page`: number (default 1)
  - `limit`: number (default 20)
- **RESPONSE** (`200 OK`):
  ```json
  {
    "orders": [ ... ],
    "page": 1,
    "totalPages": 1,
    "totalResults": 1
  }
  ```

---

### 7.6 Update Order Status (Admin)
- **METHOD**: `PUT`
- **ENDPOINT**: `/api/orders/:id/status`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: `ADMIN` only
- **REQUEST**:
  ```json
  {
    "orderStatus": "CONFIRMED"
  }
  ```
- **RESPONSE** (`200 OK`): Updated Order object.

---

### 7.7 Update Shiprocket Shipping Details (Admin)
- **METHOD**: `PUT`
- **ENDPOINT**: `/api/orders/:id/shipping`
- **AUTH REQUIRED**: Yes (`Bearer <token>`)
- **ROLE**: `ADMIN` only
- **REQUEST**:
  ```json
  {
    "shipmentId": "SR10928374",
    "awbCode": "143289081290",
    "courierName": "Delhivery Surface",
    "trackingUrl": "https://shiprocket.co/tracking/143289081290",
    "status": "IN_TRANSIT"
  }
  ```
  *(Status options: `'NOT_CREATED'`, `'CREATED'`, `'PICKUP_SCHEDULED'`, `'PICKED_UP'`, `'IN_TRANSIT'`, `'OUT_FOR_DELIVERY'`, `'DELIVERED'`, `'CANCELLED'`, `'RTO'`, `'RETURNED'`)*
- **RESPONSE** (`200 OK`): Updated Order object (automatically aligns `orderStatus` to `'SHIPPED'`, `'OUT_FOR_DELIVERY'`, or `'DELIVERED'` when respective shipping status is chosen).
