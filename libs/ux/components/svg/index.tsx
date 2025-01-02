import React from 'react'
const SVGTemplates = Object.create({} as Record<string, string>)
const KnownSvgs = ['crypto', 'cyberskull', 'eagle', 'finance', 'globe', 'leaf', 'meditation', 'music', 'ninja', 'palm', 'plus', 'return', 'service', 'shadow', 'sonnenrad', 'spear', 'what', 'wreath']

KnownSvgs.forEach(async (name) => {
  SVGTemplates[name] = await import(`./${name}.svg`).then(({ default: svg }) => svg)
})

interface SVGProps extends React.SVGProps<SVGSVGElement> {
  name: string
  width?: number|string
  height?: number|string
  bgcolor?: string
  fgcolor?: string
}

function NoSVG(props: SVGProps) {
  const name = props.name ?? 'what'
  const template = SVGTemplates[name]
  const { width, height, bgcolor, fgcolor } = { width: 24, height: 24, bgcolor: 'transparent', fgcolor: 'currentColor', ...props }
  const fills = { width, height, bgcolor, fgcolor }
  const SVG = template.replaceAll(/:(\w+)/g, (_, key) => fills[key] ?? '')
  return (SVG)
}

export { NoSVG, KnownSvgs }