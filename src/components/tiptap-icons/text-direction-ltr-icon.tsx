import { memo } from "react"

type SvgProps = React.ComponentPropsWithoutRef<"svg">

export const TextDirectionLtrIcon = memo(({ className, ...props }: SvgProps) => {
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
        d="M4 10C4 9.44772 4.44772 9 5 9H15C15.5523 9 16 9.44772 16 10C16 10.5523 15.5523 11 15 11H5C4.44772 11 4 10.5523 4 10Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 15C4 14.4477 4.44772 14 5 14H12C12.5523 14 13 14.4477 13 15C13 15.5523 12.5523 16 12 16H5C4.44772 16 4 15.5523 4 15Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 19C5 18.4477 5.44772 18 6 18H18.5858L16.2929 15.7071C15.9024 15.3166 15.9024 14.6834 16.2929 14.2929C16.6834 13.9024 17.3166 13.9024 17.7071 14.2929L21.7071 18.2929C22.0976 18.6834 22.0976 19.3166 21.7071 19.7071L17.7071 23.7071C17.3166 24.0976 16.6834 24.0976 16.2929 23.7071C15.9024 23.3166 15.9024 22.6834 16.2929 22.2929L18.5858 20H6C5.44772 20 5 19.5523 5 19Z"
        fill="currentColor"
      />
    </svg>
  )
})

TextDirectionLtrIcon.displayName = "TextDirectionLtrIcon"
