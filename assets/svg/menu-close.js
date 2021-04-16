import * as React from "react"

function SvgComponent(props) {
  return (
    <svg
      width={19}
      height={19}
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x={0.414}
        y={17}
        width={24}
        height={2}
        rx={1}
        transform="rotate(-45 .414 17)"
        fill={props.fill || '#9492C4'}
      />
      <rect
        x={1.414}
        width={24}
        height={2}
        rx={1}
        transform="rotate(45 1.414 0)"
        fill={props.fill || '#9492C4'}
      />
    </svg>
  )
}

export default SvgComponent
