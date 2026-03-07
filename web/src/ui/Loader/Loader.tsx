import { type SVGProps } from 'react'

interface LoaderProps extends SVGProps<SVGSVGElement> {
  size?: number
}

export const Loader = ({ size = 38, ...props }: LoaderProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 38 38"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g transform="translate(19 19)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <g key={angle} transform={`rotate(${angle})`}>
            <circle cx="0" cy="12" r="3" fill="currentColor" opacity={0.125 + i * 0.125}>
              <animate
                attributeName="opacity"
                dur="1.2s"
                begin={`${i * 0.15}s`}
                repeatCount="indefinite"
                keyTimes="0;1"
                values={`1;${0.125 + i * 0.125}`}
              />
            </circle>
          </g>
        ))}
      </g>
    </svg>
  )
}
