import React, { useEffect, useState } from 'react'

import { theme } from 'core/styles/theme'

const mobile = `(${theme.media.mobile})`

export const useResize = () => {
  const [isMobile, setMobile] = useState(window.matchMedia(mobile).matches)

  const handleSizeChange = () => setMobile(window.matchMedia(mobile).matches)

  useEffect(() => {
    window.addEventListener('resize', handleSizeChange)

    return () => window.removeEventListener('resize', handleSizeChange)
  })

  return isMobile
}
