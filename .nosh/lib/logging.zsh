#!/usr/bin/env zsh -i
__bgcolor() {
  local color= __namedcolor "$1"
  printf "\e[48;5;%sm" $color
}

__emoji() {
  local emojiname="$1"
  case $emojiname in
    happy) print "😊";;
    sad) print "😢";;
    angry) print "😡";;
    warning) print "⚠️";;
    robot) print "🤖";;
    kitty) print "🐱";;
    dog) print "🐶";;
    boom|explode) print "💥";;
    rofl|lol) print "🤣";;
    alert) print "🚨";;
    check) print "✅";;
    x) print "❌";;
    question) print "❓";;
    exclamation) print "❗";;
    heart) print "❤️";;
    brokenheart) print "💔";;
    star) print "⭐";;
    star2) print "🌟";;
    star3) print "✨";;
    star4) print "💫";;
    star5) print "🌠";;
    fingercross|crossed-fingers) print "🤞";;
    peace) print "✌️";;
    handshake) print "🤝";;
    thumbsup) print "👍";;
    ok|okay) print "👌";;
    thumbsdown) print "👎";;
    shrug) print "🤷";;
    failure) print "🚫";;
    recycle) print "♻️";;
    recycle2) print "🔁";;
    horns|throw-horns) print "🤘";;
    point-left) print "👈";;
    point-right) print "👉";;
    arrow-left) print "⬅️";;
    arrow-right) print "➡️";;
    arrow-up) print "⬆️";;
    arrow-down) print "⬇️";;
    chart-up) print "📈";;
    chart-down) print "📉";;
    money) print "💰";;
    moneybag) print "💰";;
    money-flying) print "💸";;
    money-wings) print "💸";;
    call|phone) print "📞";;
    mail|email) print "📧";;
    mail2|email2) print "📨";;
    mail3|email3) print "📩";;
    connect) print "🔗";;
    disconnect) print "🔗";;
    lock) print "🔒";;
    unlock) print "🔓";;
    key) print "🔑";;
    key2) print "🗝️";;
    lock2) print "🔐";;
    unlock2) print "🔓";;
    anger|angry|angery) print "😡";;
    100%|100) print "💯";;
    kiss|lipstick) print "💋";;
    sweatdrops) print "💦";;
    sweat) print "😓";;
    sweatlaugh) print "😅";;
    sweatcry) print "😰";;
    sweatfrown) print "😥";;
    sleeping|zzz) print "💤";;
    sleepy|sleepyhead) print "😪";;
    halt|stop) print "🛑";;
    handprint) print "🖐️";;
    powerfist|fist) print "✊";;
    fistbump) print "👊";;
    fistbump-left) print "🤜";;
    fistbump-right) print "🤛";;
    clap|clapping) print "👏";;
    pray|praying) print "🙏";;
    highfive) print "🙌";;
    wave|waving) print "👋";;
    rocket) print "🚀";;
    fire|fiyah) print "🔥";;
    bomb) print "💣";;
    umbrella) print "☂️";;
    danger) print "☠️";;
    radioactive) print "☢️";;
    biohazard) print "☣️";;
    skull) print "💀";;
    nuclear) print "⚛️";;
    atom) print "⚛️";;
    usa|america) print "🇺🇸";;
    genie) print "🧞";;
    wizard) print "🧙";;
    witch) print "🧙‍♀️";;
    wheelchair|handicap) print "🧑‍🦽";;
    running|run-away) print "🏃";;
    climbing|climb) print "🧗";;
    swim|swimming) print "🏊";;
    cloud) print "☁️";;
    sun) print "☀️";;
    rain) print "🌧️";;
    moon) print "🌙";;
    storm) print "🌩️";;
    thunder|lightning) print "⚡";;
    snow) print "❄️";;
    snowflake) print "❄️";;
    snowman) print "☃️";;
    tornado) print "🌪️";;
    hurricane) print "🌀";;
    map) print "🗺️";;
    compass) print "🧭";;
    globe) print "🌐";;
    clock) print "⏰";;
    hourglass) print "⌛";;
    calendar) print "📅";;
    alarm) print "🚨";;
    surf|surfing) print "🏄";;
    ski|skiing) print "⛷️";;
    wave|tidal-wave|tsunami) print "🌊";;
    volcano) print "🌋";;
    mountain) print "⛰️";;
    lovers) print "💑";;
    family) print "👪";;
    baby) print "👶";;
    love) print "💕";;
    lots-of-love) print "💞";;
    clubs) print "♣️";;
    diamonds) print "♦️";;
    spades) print "♠️";;
    hearts) print "♥️";;
    crown) print "👑";;
    gorilla) print "🦍";;
    elephant) print "🐘";;
    tiger) print "🐅";;
    shark) print "🦈";;
    whale) print "🐋";;
    dolphin) print "🐬";;
    octopus) print "🐙";;
    squid) print "🦑";;
    snail) print "🐌";;
    butterfly) print "🦋";;
    bee) print "🐝";;
    ant) print "🐜";;
    ladybug) print "🐞";;
    spider) print "🕷️";;
    scorpion) print "🦂";;
    crab) print "🦀";;
    lobster) print "🦞";;
    shrimp) print "🦐";;
    fish) print "🐟";;
    whale) print "🐋";;
    dolphin) print "🐬";;
    *) print "💬❓";;
  esac
}

__fgcolor() {
  local color= __namedcolor "$1"
  printf "\e[38;5;4%sm" $color
}


 # logs to file and console
  # __log 'info' 'user.did.thing' "any other" "messages"

__log() {
  local Level="$1"
  local Event="$2"
  local Message="${@:2}"
  __nosh_log $Level $Event "$Message"
  __nosh_log_to_file $Level $Event "$Message"
  return 0
}

__log_help() {
  echo "Usage: scrawl [level] [event.name] [message...]" &1>2
}


__namedcolor() {
  local colorname="$1"
  case $colorname in
    black) print "30";;
    red) print "31";;
    green) print "32";;
    yellow) print "33";;
    blue) print "34";;
    magenta) print "35";;
    cyan) print "36";;
    white) print "37";;
    BLACK) print "40";;
    RED) print "41";;
    GREEN) print "42";;
    YELLOW) print "43";;
    BLUE) print "44";;
    MAGENTA) print "45";;
    CYAN) print "46";;
    WHITE) print "47";;
    *) print "37";;
  esac
}

__nosh_log() {
  # __nosh_log info 'user.did.thing' "any other" "messages"
  # __nosh_log error 'user.did.thing'
  local Level="$1"
  local Color="gray"
  case $Level in
    info) Color="blue";;
    error|fatal) Color="red";;
    warn|warning) Color="yellow";;
    chatty|debug|success) Color="green";;
    crit|critical) Color="magenta";;
    fatal) Color="red";;
    comment) Color="gray";;
    notice|message) Color="cyan";;
    bright|highlight) Color="white";;
    *) Color="gray";;

  esac
  local Event="$2"
  # find all :emoji: in the message and replace them with the actual emoji
  local Message="${@:3}"
  grep -o -E ':[a-zA-Z0-9_-]+:' <<< $Message | while read -r match; do
    local emoji=$(echo $match | sed 's/://g')
    local replacement=$(__emoji $emoji)
    Message=$(echo $Message | sed "s/$match/$replacement/g")
  done
  print "$(__fgcolor white)[$(__fgcolor $Color)$Level$(__fgcolor white)] $(__emoji $Level) - $Message$(__resetcolor)\n"
  return 0
}


__nosh_log_to_file() {
    # logs to logs/nosh log file
    # __nosh_log_to_file 'info' 'user.did.thing' "any other" "messages"
    local Level="$1"
    local Event="$2"
    local Message="$@:3"
    local Timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    local LogMessage="($Timestamp) [$Level] $Event: $Message"
    local logfile="$Nosh_LogDir/nosh.$(date +"%Y.%m.%d").log"
    touch $logfile
    chmod +rw $logfile
    echo $LogMessage >> $logfile
    return 0
}
__nosh_spinner() {
  # shows fractions of a string in a spinner until a process is complete.
  # uses while loop to show spinner until the process is complete.
  # __nosh_spinner 'loading-message' 'command'
  local Message="$1"
  local Command="$2"
  local SpinnerChars="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
  local SpinnerCharsLength=${#SpinnerChars}
  local SpinnerIndex=0
  local SpinnerChar=""
  local SpinnerMessage=""
  local SpinnerPID=""
  local SpinnerStatus=""

  while true; do
    SpinnerChar="${SpinnerChars:$SpinnerIndex:1}"
    SpinnerMessage="$(__fgcolor white)[$(__fgcolor blue)loading$(__fgcolor white)] $Message$(__fgcolor white) $SpinnerChar"
    print -n $SpinnerMessage
    eval $Command &
    SpinnerPID=$!
    while kill -0 $SpinnerPID 2>/dev/null; do
      sleep 0.1
      SpinnerIndex=$(( (SpinnerIndex + 1) % SpinnerCharsLength ))
      print -n "\b"
      print -n "${SpinnerChars:$SpinnerIndex:1}"
    done
    wait $SpinnerPID
    SpinnerStatus=$?
    if [[ $SpinnerStatus -eq 0 ]]; then
      print -n "\b"
      print -n "$(__fgcolor green)✅"
      puts
      return 0
    else
      print -n "\b"
      print -n "$(__fgcolor red)❌"
      puts
      return 1
    fi
  done
}
__resetcolor() {
  printf "\e[0m"
}