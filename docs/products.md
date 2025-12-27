# Product Management API Documentation

Base URL: `http://localhost:5001`

## 1. Get All Products (Filterable)
**Endpoint**: `GET /api/products`
**Query Params**:
- `category`: Filter by category
- `type`: `wholesale` or `retail` (customer)
- `search`: Search by name

```bash
curl -X GET "http://localhost:5001/api/products?type=customer&search=cashew"
```

---

## 2. Get Single Product
**Endpoint**: `GET /api/products/:id`

```bash
curl -X GET http://localhost:5001/api/products/<PRODUCT_ID>
```

---

## 3. Create Product (Admin Only)
**Endpoint**: `POST /api/admin/products`
**Headers**: `Authorization: Bearer <ADMIN_TOKEN>`

```bash
curl -X POST http://localhost:5001/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "name": "California Almonds",
    "description": "Premium quality almond kernels",
    "sku": "ALM-001",
    "price": 800,
    "discountedPrice": 750,
    "weight": "1kg",
    "category": "Almonds",
    "stock": 500,
    "availableFor": ["customer", "wholesale"],
    "images": [
      { "url": "/uploads/almond1.jpg", "alt": "Almonds Front", "isPrimary": true }
    ]
  }'
```

---

## 4. Update Product (Admin Only)
**Endpoint**: `PUT /api/admin/products/:id`

```bash
curl -X PUT http://localhost:5001/api/admin/products/<PRODUCT_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "price": 850,
    "stock": 450
  }'
```

---

## 5. Delete Product (Admin Only)
**Endpoint**: `DELETE /api/admin/products/:id`

```bash
curl -X DELETE http://localhost:5001/api/admin/products/<PRODUCT_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```
