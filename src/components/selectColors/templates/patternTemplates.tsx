'use client'
import React from 'react'
import type { ShirtTemplateProps } from './types'

const collar = <rect x="90" y="35" width="20" height="10" fill="white" />

export function AjaxShirt({
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
        <path d="M50 40 H80 V160 H60 Q50 160 50 150 Z" fill={secondaryColor} />
        <path d="M80 40 H120 V160 H80 Z" fill={mainColor} />
        <path d="M120 40 H150 V150 Q150 160 140 160 H120 Z" fill={secondaryColor} />
        {collar}
      </g>
      <text x="145" y="155" fontSize="20" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}

export function SampShirt({
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
        <rect x="20" y="60" width="30" height="8" fill={secondaryColor} />
        <rect x="20" y="68" width="30" height="8" fill={thirdColor} />
        <rect x="20" y="76" width="30" height="8" fill={secondaryColor} />
        <rect x="150" y="60" width="30" height="8" fill={secondaryColor} />
        <rect x="150" y="68" width="30" height="8" fill={thirdColor} />
        <rect x="150" y="76" width="30" height="8" fill={secondaryColor} />
        {collar}
      </g>
      <text x="140" y="155" fontSize="20" fontWeight="bold" textAnchor="middle" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}

export function DiagonalShirt({
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
        <path d="M50 45 L70 40 L150 145 L130 150 Z" fill={secondaryColor} stroke="none" />
        {collar}
      </g>
      <text x="70" y="155" fontSize="20" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}

export function InterShirt({
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
        {Array.from({ length: 5 }).map((_, i) => {
          const yStart = 40 + i * 20
          const zigzag = `
            M55 ${yStart}
            L75 ${yStart + 10}
            L95 ${yStart}
            L115 ${yStart + 10}
            L135 ${yStart}
            L145 ${yStart + 10}
            L145 ${yStart + 20}
            L135 ${yStart + 10}
            L115 ${yStart + 20}
            L95 ${yStart + 10}
            L75 ${yStart + 20}
            L55 ${yStart + 10}
            Z
          `
          return <path key={i} d={zigzag} fill={secondaryColor} stroke="none" />
        })}
        {collar}
      </g>
      <text x="140" y="155" fontSize="20" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}

export function CelticShirt({
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
        <clipPath id="celticClip">
          <path d="M50 40 H150 V150 Q150 160 140 160 H60 Q50 160 50 150 Z" />
        </clipPath>
        <g clipPath="url(#celticClip)">
          {[...Array(6)].map((_, i) => (
            <rect
              key={i}
              x={50}
              y={40 + i * 18}
              width={100}
              height={18}
              fill={i % 2 === 0 ? mainColor : secondaryColor}
            />
          ))}
        </g>
        <path
          d="M50 40 H150 V150 Q150 160 140 160 H60 Q50 160 50 150 Z"
          fill="none"
          stroke="black"
          strokeWidth={2}
        />
        {collar}
      </g>
      <text x="140" y="145" fontSize="18" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}

export function RomaShirt({
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
        <clipPath id="romaClip">
          <path d="M50 40 H150 V150 Q150 160 140 160 H60 Q50 160 50 150 Z" />
        </clipPath>
        <g clipPath="url(#romaClip)">
          <rect x={50} y={40} width={100} height={120} fill={mainColor} />
          {[...Array(12)].map((_, i) => (
            <rect
              key={i}
              x={50}
              y={40 + i * 10}
              width={100}
              height={5}
              fill={secondaryColor}
              opacity={0.2}
            />
          ))}
        </g>
        <path
          d="M50 40 H150 V150 Q150 160 140 160 H60 Q50 160 50 150 Z"
          fill="none"
          stroke="black"
          strokeWidth={2}
        />
        {collar}
      </g>
      <text x="140" y="155" fontSize="20" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}

export function AmericaShirt({
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
        <path d="M50 40 L100 100 L150 40 L140 40 L100 90 L60 40 Z" fill={secondaryColor} />
        {collar}
      </g>
      <text x="140" y="155" fontSize="20" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}

export function PalmeirasShirt({
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
        <rect x="95" y="40" width="10" height="110" fill={secondaryColor} />
        <rect x="60" y="85" width="80" height="10" fill={secondaryColor} />
        {collar}
      </g>
      <text x="140" y="155" fontSize="20" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}

export function GermanyShirt({
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
        <path
          d="M50 80 L70 110 L90 80 L110 110 L130 80 L150 110 L150 150 L130 150 L110 120 L90 150 L70 120 L50 150 Z"
          fill={secondaryColor}
        />
        {collar}
      </g>
      <text x="148" y="145" fontSize="20" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}

export function VeneziaFCShirt({
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
        <polygon points="50,40 75,70 50,100" fill={secondaryColor} />
        <polygon points="150,40 125,70 150,100" fill={secondaryColor} />
        <polygon points="75,70 125,70 100,100" fill={secondaryColor} />
        <polygon points="60,100 140,100 100,130" fill={secondaryColor} />
        {collar}
      </g>
      <text x="140" y="155" fontSize="20" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}

export function ManUnitedShirt({
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
        <path d="M60 60 C90 80, 110 40, 140 70" stroke={secondaryColor} strokeWidth={5} fill="none" />
        <path d="M60 90 C90 110, 110 70, 140 100" stroke={secondaryColor} strokeWidth={5} fill="none" />
        <path d="M60 120 C90 140, 110 100, 140 130" stroke={secondaryColor} strokeWidth={5} fill="none" />
        {collar}
      </g>
      <text x="140" y="155" fontSize="20" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}
