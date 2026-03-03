import React from 'react'
import { Navigate } from 'react-router-dom'

/**
 * ProtectedRoute component wraps routes that require authentication.
 * It checks if a "user" object exists in localStorage.
 * If not, it redirects to the login page.
 * 
 * Future Integration: This can be updated to check AWS Cognito session
 * or other authentication providers.
 */
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'))

  if (!user) {
    // If no user session found, redirect to login
    return <Navigate to="/login" replace />
  }

  // If user session exists, allow access to the protected content
  return children
}

export default ProtectedRoute
