
__nosh_internal_ckey() {
  # returns or generates a consistent key for this repository.
  if [[ ! -f "${Nosh_Config}/.nosh.cyk" ]]; then
    echo "nosh-$(date +%s | sha256sum | base64 | head -c 32)" > "${Nosh_Config}/.nosh.cyk"
  fi
  cat "${Nosh_Config}/.nosh.cyk"
  return 0
}

__nosh_encrypt_string() {
  # Encrypts a string using the Nosh encryption key.
  # Usage: __nosh_encrypt_string "string"
  # Returns: Encrypted string.
  local $1
  echo "$1" | openssl enc -aes-256-cbc -a -salt -pass pass:$(__nosh_internal_ckey)
  return 0
}

__nosh_decrypt_string() {
  # Decrypts a string using the Nosh encryption key.
  # Usage: __nosh_decrypt_string "string"
  # Returns: Decrypted string.
  local $1
  echo "$1" | openssl enc -aes-256-cbc -a -d -salt -pass pass:$(__nosh_internal_ckey)
  return 0
}

# We could create rsa keys / pairs, but there are good reasons not to for the simple
# string case - the key is already stored in the repository, and the encryption is
# only as strong as the key. If the key is compromised, the encryption is compromised.
# However, it's useful to create RSA keys, so the functions are here for that.

__create_pem() {
  # Creates a PEM file for RSA encryption.
  # Usage: __create_pem "filename"
  # Returns: stdout of the pem string
  local $1
  local Password="$1"
  [[ -z "$Password" ]] && Password="$(__nosh_internal_ckey)"
  openssl enc -aes-256-cbc -salt nosh -pass "pass:$Password" -out "${Nosh_TmpDir}/$1.pem" && cat "${Nosh_TmpDir}/$1.pem"
  return 0
}

__create_pub() {
  # Creates a public key from a PEM file.
  # Usage: __create_pub "filename"
  # Returns: Public key echo'd to stdout.
  local $1 $2
  local Password="$2"
  [[ -z "$Password" ]] && Password="$(__nosh_internal_ckey)"
  openssl rsa -in "${Nosh_TmpDir}/$1.pem"  -pass "pass:$Password" -pubout -out "${Nosh_TmpDir}/$1.pub" && cat "${Nosh_TmpDir}/$1.pub"
  return 0
}

__create_permanent_pemkeys() {
  local $1 $2
  local Password="$2"
  [[ -z "$Password" ]] && Password="$(__nosh_internal_ckey)"
  __create_pem "$1.pem" "$Password" > "${Nosh_Config}/cert/priv/$1.pem"
  __create_pub "$1" "$Password" > "${Nosh_Config}/cert/pub/$1.pub"
  return 0
}

__nosh_encrypt_rsa() {
  # Encrypts a string using an RSA public key.
  # Usage: __nosh_encrypt_rsa "string" "public_key"
  # Returns: Encrypted string.
  local $1 $2
  echo "$1" | openssl rsautl -encrypt -pubin -inkey "${Nosh_Config}/cert/pub/$2.pub" | base64
  return 0
}

__nosh_decrypt_rsa() {
  # Decrypts a string using an RSA private key.
  # Usage: __nosh_decrypt_rsa "string" "private_key"
  # Returns: Decrypted string.
  local $1 $2
  echo "$1" | base64 -d | openssl rsautl -decrypt -inkey "${Nosh_Config}/cert/priv/$2.pem"
  return 0
}