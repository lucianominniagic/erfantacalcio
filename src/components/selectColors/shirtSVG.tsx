'use client'
import React from 'react'
import { ShirtTemplate } from '.'
import {
  SolidShirt,
  StripesShirt,
  CenterLineShirt,
  BicolorShirt,
  AjaxShirt,
  SampShirt,
  DiagonalShirt,
  InterShirt,
  CelticShirt,
  RomaShirt,
  AmericaShirt,
  PalmeirasShirt,
  GermanyShirt,
  VeneziaFCShirt,
  ManUnitedShirt,
  ManCityShirt,
  ChelseaShirt,
  JuventusShirt,
  LazioShirt,
  BarcelonaShirt,
  MilanShirt,
} from './templates'
import type { ShirtTemplateProps } from './templates'

type TemplateComponent = (props: ShirtTemplateProps) => React.ReactElement | null

const TEMPLATE_MAP: Partial<Record<ShirtTemplate, TemplateComponent>> = {
  solid: SolidShirt,
  stripes: StripesShirt,
  centerLine: CenterLineShirt,
  bicolor: BicolorShirt,
  ajax: AjaxShirt,
  samp: SampShirt,
  diagonal: DiagonalShirt,
  inter: InterShirt,
  celtic: CelticShirt,
  roma: RomaShirt,
  america: AmericaShirt,
  palmeiras: PalmeirasShirt,
  germany: GermanyShirt,
  veneziaFC: VeneziaFCShirt,
  manUnited: ManUnitedShirt,
  manCity: ManCityShirt,
  chelsea: ChelseaShirt,
  juventus: JuventusShirt,
  lazio: LazioShirt,
  barcelona: BarcelonaShirt,
  milan: MilanShirt,
}

export const ShirtSVG = ({
  template,
  mainColor,
  secondaryColor,
  thirdColor,
  textColor = 'black',
  size = 200,
  number = 10,
}: {
  template: ShirtTemplate
  mainColor: string
  secondaryColor: string
  thirdColor: string
  textColor: string
  size?: number
  number?: number
}) => {
  const Component = TEMPLATE_MAP[template]
  if (!Component) return null
  return (
    <Component
      mainColor={mainColor}
      secondaryColor={secondaryColor}
      thirdColor={thirdColor}
      textColor={textColor}
      size={size}
      number={number}
    />
  )
}
