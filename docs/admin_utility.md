# Admin & Utility Services API Documentation

Base URL: `http://localhost:5001`

---

## 1. Admin Dashboard Stats
**Endpoint**: `GET /api/admin/dashboard/stats`
**Description**: Aggregated data for dashboard widgets.

```bash
curl -X GET http://localhost:5001/api/admin/dashboard/stats \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## 2. Update User Role & Permissions (Admin)
**Endpoint**: `PUT /api/admin/users/:id/role`
**Description**: Update a user's role and granular permissions.

```bash
curl -X PUT http://localhost:5001/api/admin/users/<USER_ID>/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "role": "wholesale_manager",
    "permissions": ["manage_products", "view_reports"]
  }'
```

---

## 3. Upload Image
**Endpoint**: `POST /api/upload`
**Description**: Upload image (multipart/form-data). Returns file URL.

```bash
# Using -F for form-data file upload
curl -X POST http://localhost:5001/api/upload \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -F "image=@/path/to/your/image.jpg"
```

---



---

## 7. Notification Templates (Admin)
**Endpoint**: `POST /api/admin/notifications/templates`

```bash
curl -X POST http://localhost:5001/api/admin/notifications/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "name": "order_shipped",
    "type": "email",
    "subject": "Your Order is Shipped!",
    "content": "Hi {{name}}, your order {{orderId}} is on the way."
  }'
```

---

## 8. Get Notification Templates (Admin)
**Endpoint**: `GET /api/admin/notifications/templates`

```bash
curl -X GET http://localhost:5001/api/admin/notifications/templates \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## 9. Send Manual Notification (Admin)
**Endpoint**: `POST /api/admin/notifications/send`
**Description**: Trigger a notification manually (e.g. for testing or system alerts).

```bash
curl -X POST http://localhost:5001/api/admin/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "type": "email",
    "to": "customer@example.com",
    "templateName": "order_shipped",
    "variables": {
      "name": "John Doe",
      "orderId": "KC-12345"
    }
  }'
```
