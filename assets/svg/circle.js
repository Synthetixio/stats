import * as React from "react"

function SvgComponent(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="red"
      width={18}
      height={18}
      {...props}
    >
        <circle cx={12} cy={12} r={12} />
    </svg>
  )
}

export default SvgComponent
