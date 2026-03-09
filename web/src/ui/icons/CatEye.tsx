import { type SVGProps } from 'react'

interface CatEyeProps extends SVGProps<SVGSVGElement> {
  size?: number
}

/* Eye open with cat diamond pupil */
export const CatEye = ({ size = 24, ...props }: CatEyeProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path d='M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0' />
      <path d='M12 9l2 3-2 3-2-3z' fill='currentColor' stroke='none' />
    </svg>
  )
}
