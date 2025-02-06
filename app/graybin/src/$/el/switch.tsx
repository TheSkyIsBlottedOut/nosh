// create a JSX switch component from scratch
/* Options:
  - Has On/Off state, which can be tied to a boolean value;
  - Can trigger a function callback when switched on or off;
  - Can be styled with CSS;
  - Can be disabled;
  - Has dark mode;
  - Can be animated;
  - Highlight color can be customized
*/
import React from 'react'

type SwitchProps = {
  on: boolean
  onSwitch: (on: boolean) => void
  disabled?: boolean
  darkMode?: boolean
  animated?: boolean
  highlightColor?: string
  callback?: () => void
}


const Switch: React.FC<SwitchProps> = ({ on, onSwitch, disabled, darkMode, animated, highlightColor }) => {
  const [isOn, setIsOn] = React.useState(on as boolean)
  const [isDisabled, setIsDisabled] = React.useState(disabled)
  const [isDarkMode, setIsDarkMode] = React.useState(darkMode)
  const [isAnimated, setIsAnimated] = React.useState(animated)
  const [highlight, setHighlight] = React.useState(highlightColor)

  const handleSwitch = () => {
    if (isDisabled) return
    setIsOn(!isOn)
    onSwitch(!isOn)
  }

  return (
    <div className={`switch ${isOn ? 'on' : 'off'} ${isDisabled ? 'disabled' : ''} ${isDarkMode ? 'dark' : ''} ${isAnimated ? 'animated' : ''}`} onClick={handleSwitch}>
      <div className={`switch-handle ${isOn ? 'on' : 'off'}`} style={{ backgroundColor: highlight }}></div>
    </div>
  )
}

export { Switch }