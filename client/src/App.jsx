import React, { useEffect, useMemo, useState } from 'react'
import { fetchVendors, fetchMonthly, fetchByProduct } from './api'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

export default function App() {
const [vendors, setVendors] = useState([])
const [vendorId, setVendorId] = useState('')
const [monthly, setMonthly] = useState([])
const [byProduct, setByProduct] = useState([])
const selectedVendor = useMemo(() => vendors.find(v => v._id === vendorId), [vendors, vendorId])


useEffect(() => { fetchVendors().then(setVendors) }, [])
useEffect(() => {
if (!vendorId) return
fetchMonthly(vendorId).then(setMonthly)
fetchByProduct(vendorId).then(setByProduct)
}, [vendorId])
return (
    <div className="container">
        <header>
            <h1>Supplier Dashboard</h1>
            <div className="controls">
            <label>Vendor:</label>
            <select value={vendorId} onChange={e => setVendorId(e.target.value)}>
            <option value="">Select vendor…</option>
            {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
            </select>
            </div>
        </header>

        <section className="card">
            <h2>Monthly Sales {selectedVendor ? `– ${selectedVendor.name}` : ''}</h2>
            {vendorId ? (
            <ResponsiveContainer width="100%" height={360}>
            <LineChart data={monthly} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <Tooltip />
            <Line yAxisId="left" type="monotone" dataKey="revenue" strokeWidth={2} />
            </LineChart>
            </ResponsiveContainer>
            ) : <p className="muted">Pick a vendor to see the chart.</p>}
        </section>

        <section className="card">
            <h2>All‑time Sales by Product</h2>
            {vendorId ? (
            <div className="table-wrap">
            <table>
            <thead>
            <tr>
            <th style={{width:'60%'}}>Product</th>
            <th>Units</th>
            <th>Revenue</th>
            </tr>
            </thead>
            <tbody>
            {byProduct.map(row => (
            <tr key={row.productId}>
            <td>{row.name}</td>
            <td>{row.units}</td>
            <td>{row.revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
            </tr>
            ))}
            </tbody>
            </table>
            </div>
            ) : <p className="muted">Pick a vendor to see the table.</p>}
        </section>

        <footer>
        <small>Assumptions: units = item_count × quantity; revenue = price × units. Dates grouped by YYYY‑MM.</small>
        </footer>
    </div>
)
}