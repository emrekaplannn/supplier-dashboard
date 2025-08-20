# Supplier Dashboard API


### Import sample data (Windows)
1. Put `orders.json`, `parent_products.json`, `vendors.json` under a `data/` folder in this repo.
2. Open **MongoDB Command Prompt** (ships with MongoDB Tools) and run:


```
mongoimport --db lonca --collection orders --file data/orders.json --jsonArray
mongoimport --db lonca --collection parent_products --file data/parent_products.json --jsonArray
mongoimport --db lonca --collection vendors --file data/vendors.json --jsonArray
```


MongoDB's Extended JSON ($oid, $date) is supported by `mongoimport` by default.


### Create helpful indexes
```
mongosh lonca --eval "db.parent_products.createIndex({vendor:1}); db.orders.createIndex({payment_at:1}); db.orders.createIndex({'cart_item.product':1});"
```


### Run API
```
cp .env.example .env
npm install
npm run dev
```


---