'use client'
import React from 'react'
import type { ShirtTemplateProps } from './types'

const collar = <rect x="90" y="35" width="20" height="10" fill="white" />

export function SolidShirt({
  mainColor,
  thirdColor,
  textColor,
  size,
  number,
}: ShirtTemplateProps) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <g stroke="black" strokeWidth={2}>
        <rect x="20" y="40" width="30" height="40" fill={thirdColor} />
        <rect x="150" y="40" width="30" height="40" fill={thirdColor} />
        <path
          d="M50 40 H150 V150 Q150 160 140 160 H60 Q50 160 50 150 Z"
          fill={mainColor}
        />
        {collar}
      </g>
      <text x="140" y="155" fontSize="20" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}

export function StripesShirt({
  mainColor,
  secondaryColor,
  thirdColor,
  textColor,
  size,
  number,
}: ShirtTemplateProps) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <g stroke="black" strokeWidth={2}>
        <rect x="20" y="40" width="30" height="40" fill={thirdColor} />
        <rect x="150" y="40" width="30" height="40" fill={thirdColor} />
        <path
          d="M50 40 H150 V150 Q150 160 140 160 H60 Q50 160 50 150 Z"
          fill={mainColor}
        />
        {[60, 80, 100, 120, 140].map((x) => (
          <rect key={x} x={x} y="40" width="10" height="110" fill={secondaryColor} />
        ))}
        {collar}
      </g>
      <text x="140" y="155" fontSize="20" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}

export function CenterLineShirt({
  mainColor,
  secondaryColor,
  thirdColor,
  textColor,
  size,
  number,
}: ShirtTemplateProps) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <g stroke="black" strokeWidth={2}>
        <rect x="20" y="40" width="30" height="40" fill={thirdColor} />
        <rect x="150" y="40" width="30" height="40" fill={thirdColor} />
        <path
          d="M50 40 H150 V150 Q150 160 140 160 H60 Q50 160 50 150 Z"
          fill={mainColor}
        />
        <rect x="95" y="40" width="10" height="120" fill={secondaryColor} />
        {collar}
      </g>
      <text x="140" y="155" fontSize="20" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}

export function BicolorShirt({
  mainColor,
  secondaryColor,
  textColor,
  size,
  number,
}: ShirtTemplateProps) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <g stroke="black" strokeWidth={2}>
        <rect x="20" y="40" width="30" height="40" fill={mainColor} />
        <rect x="150" y="40" width="30" height="40" fill={secondaryColor} />
        <path
          d="M50 40 H150 V150 Q150 160 140 160 H60 Q50 160 50 150 Z"
          fill={mainColor}
        />
        <path d="M100 40 H150 V140 Q150 150 140 150 H100 Z" fill={secondaryColor} />
        {collar}
      </g>
      <text x="140" y="145" fontSize="20" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}
