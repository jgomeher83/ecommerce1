// src/services/backend.js
export const syncUserWithBackend = async (user) => {
    if (!user) return
  
    try {
      const res = await fetch('https://api.apuntatealpaseo.com.co/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          role: 'user'
        })
      })
  
      const result = await res.json()
      console.log('✅ Backend user sync:', result)
    } catch (err) {
      console.error('❌ Error syncing user with backend:', err)
    }
  }
  
  