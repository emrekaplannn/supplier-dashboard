# Supplier Dashboard Case

React (Vite) + Node.js (Express) + MongoDB ile tedarikçi panosu.

## Özellikler
- Aylık satış grafiği (revenue; opsiyonel units görünümü).
- Ürün bazlı tüm zamanlar tablosu (units & revenue).


## Varsayımlar
- **units = item_count × quantity**
- **revenue = price × units**
- Aylık gruplama: `payment_at` üzerinden `YYYY-MM`

## Kurulum

### 1) MongoDB (Compass ile)
- Database: **lonca**
- Collections & import:
  - `orders.json` → **orders**
  - `parent_products.json` → **parent_products**
  - `vendors.json` → **vendors**
- Indexes:
  - `parent_products`: `vendor:1`
  - `orders`: `payment_at:1`, `cart_item.product:1`

### 2) Server
```bash
cd server
cp .env.example .env
npm install
npm run dev
