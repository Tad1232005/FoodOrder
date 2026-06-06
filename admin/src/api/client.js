import axios from 'axios'
import { url } from '../config/config.js'

const client = axios.create({
  baseURL: url,
})

client.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token')
    if (token) config.headers.token = token
  } catch {
    // ignore
  }
  return config
})

export async function listFoods() {
  const res = await client.get('/api/food/list')
  return res.data
}

export async function removeFood(id) {
  const res = await client.post('/api/food/remove', { id })
  return res.data
}

export async function updateFood(payload) {
  const isFormData = payload instanceof FormData
  const res = await client.post('/api/food/update', payload, isFormData ? {
    headers: { 'Content-Type': 'multipart/form-data' },
  } : {})
  return res.data
}

export async function addFood(formData) {
  const res = await client.post('/api/food/add', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function login(payload) {
  const res = await client.post('/api/user/login', payload)
  return res.data
}

export async function listUsers() {
  const res = await client.get('/api/user/list')
  return res.data
}

export async function updateUserRole(payload) {
  const res = await client.post('/api/user/role', payload)
  return res.data
}

export async function getMe() {
  const res = await client.get('/api/user/me')
  return res.data
}

export async function createUser(payload) {
  const res = await client.post('/api/user/create', payload)
  return res.data
}

export async function setUserBlocked(payload) {
  const res = await client.post('/api/user/block', payload)
  return res.data
}

export async function deleteUser(payload) {
  const res = await client.post('/api/user/delete', payload)
  return res.data
}

export function imageUrl(imageFilename) {
  if (!imageFilename) return ''
  return `${url}/images/${imageFilename}`
}

export default client

