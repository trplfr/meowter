import React, { useEffect, useState } from 'react'

import { theme } from 'core/styles/theme'

export const useResize = () => {
  const [isMobile, setMobile] = useState(
    window.innerWidth < +theme.media.desktop.match(/\d+/g)
  )

  const handleSizeChange = () =>
    setMobile(window.innerWidth < +theme.media.desktop.match(/\d+/g))

  useEffect(() => {
    window.addEventListener('resize', handleSizeChange)

    return () => window.removeEventListener('resize', handleSizeChange)
  })

  return isMobile
}
