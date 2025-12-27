# Cart & Coupon API Documentation

Base URL: `http://localhost:5001`

## 1. Validate Cart
**Endpoint**: `POST /api/cart/validate`
**Description**: Check price and stock for items before checkout.

```bash
curl -X POST http://localhost:5001/api/cart/validate \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": "<PRODUCT_ID_1>", "quantity": 2 },
      { "productId": "<PRODUCT_ID_2>", "quantity": 1 }
    ]
  }'
```

---

## 2. Create Coupon (Admin Only)
**Endpoint**: `POST /api/admin/coupons`

```bash
curl -X POST http://localhost:5001/api/admin/coupons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "code": "WELCOME10",
    "discountType": "percentage",
    "discountValue": 10,
    "minOrderValue": 500,
    "maxDiscountAmount": 100,
    "validUntil": "2025-12-31T00:00:00.000Z",
    "usageLimit": 1000,
    "applicableTo": "all"
  }'
```

---

## 3. Apply Coupon
**Endpoint**: `POST /api/coupons/apply`
**Description**: Apply coupon to get discount. Needs Valid Cart Total.

```bash
curl -X POST http://localhost:5001/api/coupons/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -d '{
    "code": "WELCOME10",
    "cartTotal": 1200
  }'
```

---

## 4. Get All Coupons (Admin Only)
**Endpoint**: `GET /api/coupons`
**Description**: List all coupons.

```bash
curl -X GET http://localhost:5001/api/coupons \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```
