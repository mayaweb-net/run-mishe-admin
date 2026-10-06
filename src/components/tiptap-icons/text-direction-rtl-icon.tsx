import { memo } from "react"

type SvgProps = React.ComponentPropsWithoutRef<"svg">

export const TextDirectionRtlIcon = memo(({ className, ...props }: SvgProps) => {
  return (
    <svg
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5C20 5.55228 19.5523 6 19 6H5C4.44772 6 4 5.55228 4 5Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 10C8 9.44772 8.44772 9 9 9H19C19.5523 9 20 9.44772 20 10C20 10.5523 19.5523 11 19 11H9C8.44772 11 8 10.5523 8 10Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 15C11 14.4477 11.4477 14 12 14H19C19.5523 14 20 14.4477 20 15C20 15.5523 19.5523 16 19 16H12C11.4477 16 11 15.5523 11 15Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19 19C19 19.5523 18.5523 20 18 20H5.41421L7.70711 22.2929C8.09763 22.6834 8.09763 23.3166 7.70711 23.7071C7.31658 24.0976 6.68342 24.0976 6.29289 23.7071L2.29289 19.7071C1.90237 19.3166 1.90237 18.6834 2.29289 18.2929L6.29289 14.2929C6.68342 13.9024 7.31658 13.9024 7.70711 14.2929C8.09763 14.6834 8.09763 15.3166 7.70711 15.7071L5.41421 18H18C18.5523 18 19 18.4477 19 19Z"
        fill="currentColor"
      />
    </svg>
  )
})

TextDirectionRtlIcon.displayName = "TextDirectionRtlIcon"
