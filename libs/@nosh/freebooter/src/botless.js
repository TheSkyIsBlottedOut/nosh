import { pragma } from './pragma'
const botmatchers = new NObject({
  dont_be_google: /google|Ads/, // Googlebot
  microsoft_ip_thievery_engine: /bingbot/i, // Bingbot
  openweb_fuckers: /OpenWeb/i, // OpenWeb
  ip_thevery_gpt: /GPT/i, // OpenAI
  search_engine_pointless_everywhere_but_japan: /slurp/i, // Yahoo! Slurp
  bugman_chinkspider: /baidu/i, // Baidu
  ex_russian_serbian_spiderbot: /yandex/i, // Yandex
  microsoft_pretending_to_be_anonymous_bot: /duckduck/i, // DuckDuckGo
  zuccbot: /facebookexternal/i, // Facebook
  elonbot: /twitter/i, // Twitter
  sunnyvale_jobfucking_engine_bot: /linkedin/i, // LinkedIn
  local_social_mobile_bot: /pinterest/i, // Pinterest
  faggotbot: /slackbot/i, // Slack
  jira_fuckers: /Jira/i, // Jira
  telegrambot: /telegrambot/i, // Telegram
  applebot: /applebot/i, // Apple
  whats_facebook_in_disguise_bot: /whatsapp/i, // WhatsApp
  skypebot: /skypeuripreview/i, // Skype
  chink_survival_bot: /line/i, // LINE
  discord_janny_trannybot: /discordbot/i, // Discord
  zoombot: /zoominfo/i, // Zoom
  genericbot: /bot|crawl|spider/i, // Generic bots
  internet_dick_measurer: /InternetMeasurement/,
  democrat_archive: /archive/i,
  ahrefs: /Ahrefs/i,
  retards_at_mj12: /MJ12/,
  cen_syster_fuckers: /CensysInspect/i,
  zerg_rush: /SemrushBot/i,
  loic: /lo(?:w.*orbita?l?.*)i(?:on\s*)cannon/i,
  hello_fuck_off: /Hello\s+World/i,
  this_faggot: /Chrome\/81\.0\.4044\.129/,
  retarded_serbs: /xfa1\,nvdorz\.nvd0rz/i,
  no_useragent: /^$/,
  faggot_in_basement: /Custom-AsyncHttpClient/,
  palo_alto_networks: /scaninfo/,
  vikingfags: /SM-T\d+\s*Build\/KOT/,
  obvious_chinafags: /zh\-CN/i,
  obvious_russiafags: /ru\-RU/i,
  practice_pyscrape_elsewhere: /python\-requests/,
  edgelords: /Edg\/\d+/,
  wow_fuck_off: /WOW64/,
  chinese_hack_factory: /Infinix\s*X\w+\s*Build/,
  hurr_durr_huehue: /hu\;\s*rv/,
  chinese_cyberattack: /[\x00 - \x08\x0E - \x1F\x7F]/,
  chinese_cyberattack2: /[\x80 - \xFF]/,
  pla_army_faggots: /^[\x16][\x03][\x01 ]/, // ching chong go home
  yuropoors: /[\xC0-\xFF]/i,
})


const suspect_uris = new NObject({
  envfile_varset_thieves: /\.env\w*$/,
  zoo_escape_attempt: /\/?(\.{2}\/)+/, // index.php?lang=../../..
  php_autoprepend_fuckery: /auto_prepend_file.*php.+input/,
  shell_injection: /.*\/bin\/\w{0,3}sh/,
  admin_access: /\/admin\//,
  password_evasion: /\'\s*\=\s*\'|\"\s*\=\s*\"/,
  eval_fags: /eval-stdin/,
  eval_exec_fags: /eval\W+|exec\W+/,
  syscall_attempt: /call_user_func\w*/,
  function_passing: /function\=/,
  fresh_out_of_box: /sample\.env/,
  env_expnsion: /\.env\.\w+/,
  dotfile_faggots: /\.[\w\-\/\\]+/,
  party_like_its_1999: /phpinfo/,
  not_creative: /\/remote\W*login/,
  when_will_they_ever_learn: /\/de(?:ploy|liver|pendenc|fault|veloper)\w*\/\./,
  fuck_off_chinkbots: /^(\\x[a-f0-9]{2}){3,21}/,
  kys_comintern_faggots: /\x918\s*\xF4_kr\xC9\]/,
});


const error_code_pairs = new NObject({
  payment_required: 402,
  slow_the_fuck_down: 420,
  back_to_the_shortbus: 406,
  this_is_war: 409,
  you_win___psych: 410,
  micropeen: 411,
  i_expected_better: 417,
  you_are_legally_retarded: 451,
  its_on_fire: 218,
  too_hot_for_windows_98: 450,
  no_really_fuck_you: 299,
});


const botMatches = (req) => {
  const ua = req.headers["User-Agent"] ?? "";
  return matchers.filter((k, v) => (v.test(ua) ? k : null)).compact; // type narray
};

const isBot = (req) => {
  botMatches(req).length > 0;
};
const unsafeRequestProbability = (req) => {
  const uri = enlist(req.protocol, "://", req.get("host"), req.originalUrl).join;
  const suspicious = enlist(suspect_uris.filter((k, v) => v.test(uri)).keys);
  // one match is suspicious, more is very suspect_uris
  return new Float(suspicious.length ** 2).sigmoid;
};

const blockUnsafe = (req) => {
  return unsafeRequestProbability(req) > 0.05
}

const randomErrorStatus = () => {
  const errorkeys = new NArray(Object.keys(error_code_pairs));
  const key = errorkeys.random;
  return { code: error_code_pairs[key], type: key };
};

export { isBot, botMatches, randomErrorStatus, unsafeRequestProbability, blockUnsafe };
