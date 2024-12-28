# scripts for messing with terminal - colors, prompts, curses behavior
# and other terminal-related stuff

autoload -U colors && colors


DarkColors=(001 002 003 004 005 006 007 008 016 017 018 019 232 233 234 235 236 237 238 239 240 241 242 243 244 245 246 247 248 249 250)
# set up colors

__show_reference_color_grid() {
  local fgc, bgc
  for bgc in {1..255}; do
    # make fgc readable: dark colors are 016, 017, 018, 019, 232, 233,
    fgc=0
    [[ "$bgc" in $DarkColors ]] && fgc=15
    printf "\e[48;5;%sm\e[38;5;%sm%3s\e[0m " $bgc $fgc $bgc
    (( $bgc % 6 == 3 )) && echo
  done
  return 0
}

# color jumps happen every 6 colors; the 7th is close.
# color + 1 is the next color when above 16, except when you're at 21, 27, 33, etc.
# these are grid jumps and the next color is +6. also, 232-255 are greyscale.
# the next *brightest* colors that are similar to 16+ are +1, +2, +36, +37.
# you can detect you're near a jump if color > 16 && color % 6 == 4 (downwards) or 3 (upwards).


Colors16Neighbors=((052 001 088) (022 002 040) (058 003 100) (018 004 027) (128 005 200) (023 006 039) (059 007 250) (019 008 028) (124 009 186) (028 010 040) (060 011 102) (027 012 029) (130 013 202) (044 014 081) (250 015 255))
__closest_colors() {
  # returns an array of most similar colors to find gradients.
  # Usage: __closest_colors 012
  # Returns: array of color 3 digit codes 001-255
  local color="$1"
  # if color is under 16, pull first and last from the subarray of 16 colors, as well as +/- 8.
  local tmp=()
  if [[ "$color" -lt 16 ]]; then
    tmp=("${Colors16Neighbors[$color]}")
    tmp[1]=$(( ($color + 8) % 16 ))
  elif [[ "$color" -gt 231 ]]; then
    tmp=("$color" "$(($color + 1))" "$(($color + 2 ))")
    [[ "$color" -gte 250 ]] && tmp+=( 015 195 231 )
    [[ "$color" -lte 235 ]] && tmp+=( 016 000 052 022 )
    [[ "$color" -lt 250 && "$color" -gt 235 ]] && tmp+=( 008 059 066 101 )
  else
    # find current modulo 6
    local mod6=$(( $color % 6 ))
    if [[ "$mod6" -ne 4 && "$mod6" -ne 3 ]]; then
      tmp=("$((color - 1))" "$((color + 1))" "$((color + 6))" "$((color + 7))")
      [[ color -gt 051 ]] && tmp += (( color - 36 ) ( color - 37 ))
      [[ color -lt 232 ]] && tmp += (( color + 36 )  ( color + 37 ))
      # if we're not near a jump, just return the 4 closest colors.
    elif [[ "$mod6" -eq 4 ]]; then
      tmp=("$((color - 1))" "$((color - 2))" "$((color + 36))" "$((color + 37))")
      [[ tmp -gt 051 ]] && tmp += (( color - 36 ) ( color - 37 ))
    elif [[ "$mod6" -eq 3 ]]; then
      tmp=("$((color - 1))" "$((color + 1))" "$((color + 6))" "$((color + 7))")
    fi
    echo "${tmp[@]}"
    return 0
  fi
}

__pick_random_color() {
  # picks a random color from the 256 color palette.
  # Usage: __pick_random_next_color
  # Returns: 3 digit color code
  local color=$(( $RANDOM % 256 ))
  echo $color
  return 0
}

__choose_from_closest() {
  local color="$1"
  local tmp="$(__closest_colors $color)"
  local random=$(( $RANDOM % ${#tmp} ))
  echo "${tmp[$random]}"
  return 0
}

__set_contrast_color() {
  # sets the most different non-clashing color to the input color.
  # center scale colors should have solid black/white, colors under 16 should have color + 4 % 16,
  # colors over 231 can pick any color, but the formula would have these outputs:
  # 232 (very dark) -> 015, 008, and the bottom colors - 051, 087, 123, 159, 195, 231 - all should be modulo.
  # 255 should be top row, (000, 016, 052, 088, 124, 160, 196, 232)
  # So, the formula is: if color < 16, color + 4 % 16; if color > 231, 15 + (color - 232) % 24; else, color + 128 % 256
  local color="$1"
  local contrast
  if [[ "$color" -lt 16 ]]; then
    contrast=$(( (color + 4) % 16 ))
  elif [[ "$color" -gt 231 ]]; then
    contrast=$(( 15 + (color - 232) % 24 ))
  else
    contrast=$(( (color + 128) % 256 ))
  fi
  echo "$contrast"
  return 0
}

__print_next_character() {
  # prints a character in the next selected fg/bg colors.
  # Usage: __print_next_character "character", current_fg
  # Returns: nothing
  local character="$1"
  local current_fg="$2"
  local next_fg="$(__choose_from_closest $current_fg)"
  local contrast="$(__set_contrast_color $next_fg)"
  printf "\e[38;5;%sm\e[48;5;%sm%s\e[0m" $next_fg $contrast $character
  return 0
}

__reset_colors() {
  # resets the terminal colors to default.
  printf "\e[0m"
  return 0
}

__nosh_pinatatype() {
  # prints a string in a gradient of colors.
  # Usage: __print_gradient_string "string"
  # Returns: nothing
  local string="$1"
  local fg="$(__pick_random_color)"
  local contrast="$(__set_contrast_color $fg)"
  for char in $(echo $string | grep -o .); do
    printf "\e[38;5;%sm\e[48;5;%sm%s\e[0m" $fg $contrast $char
    fg="$(__choose_from_closest $fg)"
    contrast="$(__set_contrast_color $fg)"
  done
  __reset_colors
  echo
  return 0
}
