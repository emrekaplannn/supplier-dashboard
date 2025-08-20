import axios from 'axios'


export const api = axios.create({ baseURL: 'http://localhost:4000/api' })


export const fetchVendors = () => api.get('/vendors').then(r => r.data)
export const fetchMonthly = (vendorId) => api.get(`/vendors/${vendorId}/monthly-sales`).then(r => r.data)
export const fetchByProduct = (vendorId) => api.get(`/vendors/${vendorId}/product-sales`).then(r => r.data)

