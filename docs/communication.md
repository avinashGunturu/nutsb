# Communication Services API Documentation

Base URL: `http://localhost:5001`

---

## 1. Submit Contact Request
**Endpoint**: `POST /api/contact`
**Description**: Public endpoint for "Contact Us" form on the website.

```bash
curl -X POST http://localhost:5001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane User",
    "email": "jane@example.com",
    "topic": "Order Issue",
    "message": "I havenot received my order #12345"
  }'
```

---

## 2. Get Contact Requests (Admin)
**Endpoint**: `GET /api/contact`
**Description**: View all submitted contact requests.

```bash
curl -X GET http://localhost:5001/api/contact \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## 3. Submit Wholesale Inquiry
**Endpoint**: `POST /api/wholesale/inquiry`
**Description**: Public endpoint for B2B/Wholesale lead generation form.

```bash
curl -X POST http://localhost:5001/api/wholesale/inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Big Store Buyer",
    "companyName": "Big Store Pvt Ltd",
    "email": "buyer@bigstore.com",
    "mobile": "9876500000",
    "requirements": "Need 500kg Cashews monthly"
  }'
```

---

## 4. Get Wholesale Inquiries (Admin)
**Endpoint**: `GET /api/wholesale`
**Description**: View all wholesale leads.

```bash
curl -X GET http://localhost:5001/api/wholesale \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```
