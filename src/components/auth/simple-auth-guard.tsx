"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/tiptap-ui-primitive/button'
import { Input } from '@/components/tiptap-ui-primitive/input'

export function SimpleAuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Verify existing token on mount
  useEffect(() => {
    verifyToken()
  }, [])

  const verifyToken = async () => {
    const token = localStorage.getItem('write-auth-token')
    
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      
      const result = await response.json()
      
      if (result.valid) {
        setIsAuthenticated(true)
      } else {
        // Remove invalid token
        localStorage.removeItem('write-auth-token')
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('write-auth-token')
    }
    
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      
      const result = await response.json()
      
      if (result.success) {
        localStorage.setItem('write-auth-token', result.token)
        setIsAuthenticated(true)
        setError('')
      } else {
        setError('Incorrect password')
        setPassword('')
      }
    } catch (error) {
      setError('Authentication failed')
      setPassword('')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Access Required</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full"
                autoFocus
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            <Button type="submit" className="w-full">
              Access
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
