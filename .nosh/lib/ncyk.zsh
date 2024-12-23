
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
  openssl enc -aes-256-cbc -salt nosh -pass pass:$(__nosh_internal_ckey) -out "${Nosh_TmpDir}/$1.pem" && cat "${Nosh_TmpDir}/$1.pem"
  return 0
}

__create_pub() {
  # Creates a public key from a PEM file.
  # Usage: __create_pub "filename"
  # Returns: Public key echo'd to stdout.
  local $1
  openssl rsa -in "$1" -pubout -out "${Nosh_TmpDir}/$1.pub" && cat "${Nosh_TmpDir}/$1.pub"
  return 0
}
