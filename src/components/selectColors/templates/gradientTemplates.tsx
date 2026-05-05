'use client'
import React from 'react'
import type { ShirtTemplateProps } from './types'

const collar = <rect x="90" y="35" width="20" height="10" fill="white" />

export function ManCityShirt({
  mainColor,
  secondaryColor,
  thirdColor,
  textColor,
  size,
  number,
}: ShirtTemplateProps) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <defs>
        <linearGradient id="stripeGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={mainColor} stopOpacity="1" />
          <stop offset="100%" stopColor={mainColor} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <g stroke="black" strokeWidth={2}>
        <rect x="20" y="40" width="30" height="40" fill={thirdColor} />
        <rect x="150" y="40" width="30" height="40" fill={thirdColor} />
        <path
          d="M50 40 H150 V150 Q150 160 140 160 H60 Q50 160 50 150 Z"
          fill={mainColor}
        />
        {[...Array(10)].map((_, i) => {
          const x = 50 + i * 10
          return (
            <rect
              key={`stripe-${i}`}
              x={x}
              y="40"
              width={i % 2 === 0 ? 6 : 4}
              height="110"
              fill={i % 2 === 0 ? 'url(#stripeGradient)' : secondaryColor}
              opacity={i % 2 === 0 ? 1 : 0.8}
            />
          )
        })}
        {collar}
      </g>
      <text x="140" y="155" fontSize="20" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}

export function ChelseaShirt({
  mainColor,
  thirdColor,
  textColor,
  size,
  number,
}: ShirtTemplateProps) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <defs>
        <linearGradient id="horizontalGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={mainColor} stopOpacity="1" />
          <stop offset="100%" stopColor={mainColor} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <g stroke="black" strokeWidth={2}>
        <rect x="20" y="40" width="30" height="40" fill={thirdColor} />
        <rect x="150" y="40" width="30" height="40" fill={thirdColor} />
        <path
          d="M50 40 H150 V150 Q150 160 140 160 H60 Q50 160 50 150 Z"
          fill={mainColor}
        />
        {[...Array(7)].map((_, i) => {
          const y = 40 + i * 15
          return (
            <rect
              key={`stripe-${i}`}
              x="50"
              y={y}
              width="100"
              height="10"
              fill="url(#horizontalGradient)"
              opacity={i % 2 === 0 ? 1 : 0.6}
            />
          )
        })}
        {collar}
      </g>
      <text x="140" y="157" fontSize="20" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}

export function JuventusShirt({
  mainColor,
  secondaryColor,
  thirdColor,
  textColor,
  size,
  number,
}: ShirtTemplateProps) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <defs>
        <linearGradient id="stripeGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={mainColor} stopOpacity="1" />
          <stop offset="100%" stopColor={mainColor} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="altStripeGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <g stroke="black" strokeWidth={2}>
        <rect x="20" y="40" width="30" height="40" fill={thirdColor} />
        <rect x="150" y="40" width="30" height="40" fill={thirdColor} />
        <path
          d="M50 40 H150 V150 Q150 160 140 160 H60 Q50 160 50 150 Z"
          fill={mainColor}
        />
        {[...Array(7)].map((_, i) => {
          const x = 50 + i * 15
          return (
            <rect
              key={`stripe-${i}`}
              x={x}
              y={40}
              width={10}
              height={110}
              fill={i % 2 === 0 ? 'url(#stripeGradient)' : 'url(#altStripeGradient)'}
            />
          )
        })}
        {collar}
      </g>
      <text x="140" y="155" fontSize="20" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}

export function LazioShirt({
  mainColor,
  secondaryColor,
  thirdColor,
  textColor,
  size,
  number,
}: ShirtTemplateProps) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <defs>
        <linearGradient id="lazioGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={mainColor} stopOpacity="1" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <g stroke="black" strokeWidth={2}>
        <rect x="20" y="40" width="30" height="40" fill={thirdColor} />
        <rect x="150" y="40" width="30" height="40" fill={thirdColor} />
        <path
          d="M50 40 H150 V150 Q150 160 140 160 H60 Q50 160 50 150 Z"
          fill="url(#lazioGrad)"
        />
        {[...Array(10)].map((_, i) => (
          <line
            key={`diagLine-${i}`}
            x1={65 + i * 10}
            y1="40"
            x2={55 + i * 10}
            y2="150"
            stroke={secondaryColor}
            strokeWidth="1"
            opacity="0.5"
          />
        ))}
        {collar}
      </g>
      <text x="140" y="155" fontSize="20" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}

export function BarcelonaShirt({
  mainColor,
  secondaryColor,
  thirdColor,
  textColor,
  size,
  number,
}: ShirtTemplateProps) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <defs>
        <linearGradient id="barcaGrad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={mainColor} stopOpacity="1" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="barcaGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={secondaryColor} stopOpacity="1" />
          <stop offset="100%" stopColor={mainColor} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <g stroke="black" strokeWidth={2}>
        <rect x="20" y="40" width="30" height="40" fill={thirdColor} />
        <rect x="150" y="40" width="30" height="40" fill={thirdColor} />
        <path
          d="M50 40 H150 V150 Q150 160 140 160 H60 Q50 160 50 150 Z"
          fill="none"
        />
        {[...Array(5)].map((_, i) => (
          <rect
            key={`stripe-${i}`}
            x={50 + i * 20}
            y={40}
            width={10}
            height={110}
            fill={i % 2 === 0 ? 'url(#barcaGrad1)' : 'url(#barcaGrad2)'}
          />
        ))}
        {collar}
      </g>
      <text x="130" y="155" fontSize="20" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}

export function MilanShirt({
  mainColor,
  secondaryColor,
  thirdColor,
  textColor,
  size,
  number,
}: ShirtTemplateProps) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <defs>
        <linearGradient id="milanGradRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={mainColor} stopOpacity="1" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="milanGradBlack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={secondaryColor} stopOpacity="1" />
          <stop offset="100%" stopColor={mainColor} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <g stroke="black" strokeWidth={2}>
        <rect x="20" y="40" width="30" height="40" fill={thirdColor} />
        <rect x="150" y="40" width="30" height="40" fill={thirdColor} />
        <path
          d="M50 40 H150 V150 Q150 160 140 160 H60 Q50 160 50 150 Z"
          fill="none"
        />
        {[...Array(3)].map((_, i) => (
          <rect
            key={`milanStripe-${i}`}
            x={50 + i * 33}
            y={40}
            width={20}
            height={110}
            fill={i % 2 === 0 ? 'url(#milanGradRed)' : 'url(#milanGradBlack)'}
          />
        ))}
        {collar}
      </g>
      <text x="133" y="145" fontSize="18" fontWeight="bold" textAnchor="end" fill={textColor}>
        {number}
      </text>
    </svg>
  )
}
