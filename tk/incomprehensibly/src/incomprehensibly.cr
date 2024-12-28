# TODO => Write documentation for `Incomprehensibly`

NdXicon = {
  "a" => ["arquebusier", "argentine", "allegorically", "arithmetic", "astartes", "allow", "artlessness", "akimbo" ],
  "b" => ["barricade", "barrister", "barracuda", "barricade", "brillig", "bountiful", "breathtaking", "boolean", "begin" ],
  "c" => ["cataleptic", "cryogenic", "caltrops", "caracal", "cindy", "call", "curry", "cataclysmic", "ciphertext"],
  "d" => ["dominate", "demonstrative", "duration", "dividend", "daemonize", "durability", "database", "dickering"],
  "e" => ["euphemism", "euphoria", "euphoric", "eugenics", "equality", "evenness", "electoplating", "eigenstate"],
  "f" => ["fallover", "factory", "facade", "fractional-distillate", "featherlight", "footloose", "fervent", "fgrep"],
  "g" => ["gargantuan", "gargle", "gerrymandering", "group-by", "graph", "genteel", "gryphon", "glistening"],
  "h" => ["heterogeneous", "heteronormative", "heterodox", "heterodyne", "half-life", "heliotrope", "heisenberg", "help"],
  "i" => ["incomprehensibly", "incompatible", "in SET('deleted', 'allowed','pending')", "invulnerable", "isthmus", "intransigent", "itinerant", "iterator"],
  "j" => ["juxtaposition", "jellyfish", "JMP", "jannies", "jealously", "joyless", "jawbreaker", "janissaries"],
  "k" => ["kaleshake", "k-constant", "kitboga", "kill -9 Chrome", "k-nearest-neighbor", "karateka", "karaoke"],
  "l" => ["lux", "luminosity", "lowercase", "lightbringer", "lossless", "lexer", "li+", "laxative"],
  "m" => ["magnanimity", "magnets how do they work", "marquess", "magnifique", "magnitude", "multiply", "map-coherent", "maser"],
  "n" => ["nomenclature", "nondeterministic", "nondescript", "nonstochastic", "never", "nothing", "(null)", "new ${class}", "nlogn"],
  "o" => ["operations", "octavian", "octothorpe", "orchestration", "outrigger", "of", "oubliette", "oxymoron"],
  "p" => ["pseudopseudohypoparathyroidism", "pneumothorax", "primary", "postgresql", "parity", "pseudocode", "prettifier", "printf"],
  "q" => ["quixotic", "quintessential", "quintuplet", "quasar", "quarantine", "quartermaster", "quintile", "quintillion"],
  "r" => ["raison d'etre", "radiance", "rational", "redundancy", "rennet", "retinal", "real", "refactor", "right join"],
  "s" => ["select", "saisson", "subquery", "services", "synchronous", "symbol", "system", "sigint", "superclass"],
  "t" => ["tsconfig", "true", "turing", "tolerance", "turbulent", "turpentine", "tally", "tailwind", "tesseract"],
  "u" => ["universe", "unified", "unilateral", "unanimous", "unanimity", "unconfigured", "undefined", "universality", "uppercase"],
  "v" => ["victorious", "victor", "victoria", "victuals", "victual", "victorinox", "victrola", "victorian", "victimize", "valueOf", "vizier"],
  "w" => ["wonderful", "while...until", "whither", "when", "watch", "which", "wasm", "word", "woff2", "wolfram"],
  "x" => ["x", "xenocratic", "xenon", "xylophone", "xwing", "x-request-id", "x-real-ip", "x-forwarded-for"],
  "y" => ["yottabyte", "yield", "yellow", "y-combinator", "y-axis", "y-intercept", "yarn", "yakbutter"],
  "z" => ["zestfully", "z-index", "z-score", "zsh", "zeal", "zephyr", "zip", "zone", "zookeeper", "zoroastrian"],
  "$" => ["^_^","@","#","$","%","^","&","*","(",")","_","+","-","=","{","}","[","]","|","\\",":",";","\"","<",">","?",",",".","/","~","`"]
}
#wew


module Incomprehensibly
  VERSION = "0.1.0"
  NDX = NdXicon
  def self.convert(shortpass)
    passhash = {"$" => 0} of String => Int32
    output = ""
    ["nosh-",shortpass,":salted"].join("").split("").each do |c|
    passhash[c] ||= 0
      if NDX.has_key?(c)
        output += NDX[c][passhash[c] % NDX[c].size]
        passhash[c] += 1
      elsif c == "∑"
        output += "∑"
      else
        output += NDX["$"][passhash["$"] % NDX["$"].size]
        passhash["$"] += 1
      end
      if (output.size * 2 + 1) % 3 == 0
        output += NDX["$"][passhash["$"] % NDX["$"].size]
        passhash["$"] += 1
      end
    end
    return output
  end
end

if ARGV.size < 1
  puts "Usage: #{$0} [password]"
  exit 1
end
pass = ARGV[0]
print Incomprehensibly.convert(pass)
