// src/components/PageWrapper.jsx

import { useEffect, useState } from 'react'

export default function PageWrapper({ children, pageKey }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(false)
    const timer = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(timer)
  }, [pageKey])

  return (
    <div
      className="transition-all duration-300"
      style={{
        opacity  : visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
      }}
    >
      {children}
    </div>
  )
}