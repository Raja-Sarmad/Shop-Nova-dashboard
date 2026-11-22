# Shop Nova Admin Dashboard

Next.js admin app (port **3001**) talking to the Express API.

## Run

```bash
# terminal 1 — API (needs MongoDB + Cloudinary in backend/.env)
cd backend && npm install && npm run seed && npm run dev

# terminal 2 — dashboard
cd dashboard && npm install && npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## Login (after seed)

| | |
| --- | --- |
| Email | `admin@shopnova.pk` |
| Password | `Admin@12345` |

Customers use the storefront (`frontend`) — they are rejected on `/api/auth/admin/login`.

## Modules

- Overview — revenue, orders, low stock
- Products — CRUD + Cloudinary image upload
- Inventory — stock edit
- Orders — status updates
- Customers — registered store users
