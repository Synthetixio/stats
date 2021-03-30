import * as React from "react"

function SvgComponent(props) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="#fff"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx={12} cy={12} r={12} />
      <path
        d="M8.623 15.208h2.416v-4.416H8.863V9h4.64v6.208h2.528V17H8.623v-1.792zm4.912-7.248h-2.816V5.432h2.816V7.96z"
        fill="#09092f"
      />
    </svg>
  )
}

export default SvgComponent
