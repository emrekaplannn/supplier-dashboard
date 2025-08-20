// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mongo'ya bağlan
mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME || 'lonca' })
  .then(() => console.log('✅ Mongo connected'))
  .catch(err => { console.error('❌ Mongo connection error', err); process.exit(1); });

const db = () => mongoose.connection.db;
const { Types } = mongoose;

// 1) Vendor listesi (dropdown)
app.get('/api/vendors', async (_req, res) => {
  try {
    const vendors = await db().collection('vendors')
      .find({})
      .project({ name: 1 })
      .toArray();
    res.json(vendors);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2) Aylık satış (revenue + units) – seçili vendor
app.get('/api/vendors/:vendorId/monthly-sales', async (req, res) => {
  try {
    const vendorId = new Types.ObjectId(req.params.vendorId);
    const pipeline = [
      { $unwind: '$cart_item' },
      { $lookup: {
          from: 'parent_products',
          localField: 'cart_item.product',
          foreignField: '_id',
          as: 'pp'
        } },
      { $unwind: '$pp' },
      { $match: { 'pp.vendor': vendorId } },
      { $addFields: {
          units:   { $multiply: ['$cart_item.item_count', '$cart_item.quantity'] },
          revenue: { $multiply: ['$cart_item.price', '$cart_item.item_count', '$cart_item.quantity'] },
          month:   { $dateToString: { format: '%Y-%m', date: '$payment_at' } }
        } },
      { $group: { _id: '$month', revenue: { $sum: '$revenue' }, units: { $sum: '$units' } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, month: '$_id', revenue: { $round: ['$revenue', 2] }, units: 1 } }
    ];
    const data = await db().collection('orders').aggregate(pipeline).toArray();
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3) Tüm zamanlar ürün bazlı satış – seçili vendor
app.get('/api/vendors/:vendorId/product-sales', async (req, res) => {
  try {
    const vendorId = new Types.ObjectId(req.params.vendorId);
    const pipeline = [
      { $unwind: '$cart_item' },
      { $lookup: {
          from: 'parent_products',
          localField: 'cart_item.product',
          foreignField: '_id',
          as: 'pp'
        } },
      { $unwind: '$pp' },
      { $match: { 'pp.vendor': vendorId } },
      { $addFields: {
          units:   { $multiply: ['$cart_item.item_count', '$cart_item.quantity'] },
          revenue: { $multiply: ['$cart_item.price', '$cart_item.item_count', '$cart_item.quantity'] }
        } },
      { $group: {
          _id: { productId: '$pp._id', name: '$pp.name' },
          units: { $sum: '$units' },
          revenue: { $sum: '$revenue' }
        } },
      { $project: {
          _id: 0,
          productId: '$_id.productId',
          name: '$_id.name',
          units: 1,
          revenue: { $round: ['$revenue', 2] }
        } },
      { $sort: { revenue: -1 } }
    ];
    const data = await db().collection('orders').aggregate(pipeline).toArray();
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`🚀 API running on http://localhost:${port}`));
