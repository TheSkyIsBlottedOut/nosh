

__nosh_internal_ckey() {
  # returns or generates a consistent key for this repository.
  if [[ ! -f "${Nosh_Config}/.nosh.cyk" ]]; then
    export GNUPGHOME="${Nosh_Config}"
    cat > "${Nosh_Config}/.nosh.cyk" <<-EOF
    %echo "Generating a new encryption key for this repository."
    Key-Type: EDDSA
    Key-Length: 256
    Subkey-Type: EDDSA
    Subkey-Length: 256
    Name-Real: Nosh Holistic Automatons
    Name-Comment: I am a real person
    Name-Email: fall@vintagedogma.net
    Expire-Date: 0
    Passphrase: "$($Nosh_AppDir/tk/bin/incomprehensibly "this.time we make.war on heavenitself")"
    %commit
    %echo "Key generated."
EOF
    gpg --batch --generate-key "${Nosh_Config}/.nosh.cyk"
    gpg --export --armor -r "${Nosh_Config}/keyring.mdx" > "${Nosh_Config}/cert/pub/nosh.gpg"
    mv "${Nosh_Config}/pubring.kbx" "${Nosh_Config}/cert/priv/nosh.pubring.kbx"
  fi
  echo "${Nosh_Config}/cert/priv/nosh.pubring.kbx"
  return 0
}

__nosh_encrypt_string() {
  # Encrypts a string using the Nosh encryption key.
  # Usage: __nosh_encrypt_string "string"
  # Returns: Encrypted string.
  local $1
  gpg --import "${Nosh_Config}/cert/priv/nosh.pubring.kbx"
  echo "$1" | gpg --encrypt --armor -r "fall" | base64 | head -n $(($(wc -l) - 1)) } | tail -n $(($(wc -l) - 1)) | tr '\n' '∑'
  return 0
}

__nosh_decrypt_string() {
  # Decrypts a string using the Nosh encryption key.
  # Usage: __nosh_decrypt_string "string"
  # Returns: Decrypted string.
  local $1
  echo "-----BEGIN PGP MESSAGE-----\n$( echo "$1" | tr '∑' '\n' )\n-----END PGP MESSAGE-----" | base64 -d | gpg --decrypt --armor
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