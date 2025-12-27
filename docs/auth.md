# Authentication API Documentation

Base URL: `http://localhost:5001`

## 1. Register User
**Endpoint**: `POST /api/auth/register`
**Description**: Register a new customer.

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "password123",
    "role": "customer"
  }'
```

---

## 2. Login (Email/Password)
**Endpoint**: `POST /api/auth/login`
**Description**: Login to get a JWT token.

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

## 3. Send OTP
**Endpoint**: `POST /api/auth/send-otp`
**Description**: Trigger OTP SMS (Mocked).

```bash
curl -X POST http://localhost:5001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210"
  }'
```

---

## 4. Verify OTP (Login)
**Endpoint**: `POST /api/auth/verify-otp`
**Description**: Verify OTP and get Token. (Mock OTP is always `123456`)

```bash
curl -X POST http://localhost:5001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "otp": "123456"
  }'
```

---

## 5. Get Current User Profile
**Endpoint**: `GET /api/auth/me`
**Description**: Get profile of logged-in user. Requires Token.

```bash
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```
