# Order & Payment API Documentation

Base URL: `http://localhost:5001`

A typical checkout flow involves:
1.  User adds items to cart (Frontend)
2.  Frontend calls `POST /api/cart/validate` (See Cart Docs)
3.  Frontend calls `POST /api/orders/checkout/initiate`
    -   Server creates 'pending' Order in DB
    -   Server creates Razorpay Order
    -   Server returns `razorpayOrderId` and `mongoOrderId`
4.  Frontend opens Razorpay Modal
5.  On Payment Success, Frontend calls `POST /api/orders/checkout/verify` with payment details.
    -   Server verifies signature
    -   Server updates Order to 'Processing'

---

## 1. Initiate Checkout
**Endpoint**: `POST /api/orders/checkout/initiate`
**Input**: Cart items, Delivery Address, Coupon Code (optional)

```bash
curl -X POST http://localhost:5001/api/orders/checkout/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -d '{
    "items": [
       { "productId": "<PRODUCT_ID>", "quantity": 1 }
    ],
    "shippingAddress": {
       "street": "123 Main St",
       "city": "Mumbai",
       "state": "MH",
       "zip": "400001",
       "country": "India"
    },
    "couponCode": "WELCOME10"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "orderId": "KC-1735...",
    "razorpayOrderId": "order_P...",
    "amount": 950,
    "mongoOrderId": "64e..."
  }
}
```

---

## 2. Verify Payment (Completes Order)
**Endpoint**: `POST /api/orders/checkout/verify`
**Input**: Razorpay response details

```bash
curl -X POST http://localhost:5001/api/orders/checkout/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -d '{
    "razorpay_order_id": "order_P...",
    "razorpay_payment_id": "pay_Q...",
    "razorpay_signature": "e5c...",
    "mongoOrderId": "64e..." 
  }'
```

---

## 3. Get My Orders
**Endpoint**: `GET /api/orders/my-orders`

```bash
curl -X GET http://localhost:5001/api/orders/my-orders \
  -H "Authorization: Bearer <USER_TOKEN>"
```

---

## 4. Get All Orders (Admin)
**Endpoint**: `GET /api/admin/orders`
**Description**: View all orders (Customer details populated)

```bash
curl -X GET http://localhost:5001/api/admin/orders \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## 5. Update Order Status (Admin)
**Endpoint**: `PUT /api/admin/orders/:id/status`

```bash
curl -X PUT http://localhost:5001/api/admin/orders/<MONGO_ORDER_ID>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "status": "shipped"
  }'
```
