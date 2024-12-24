# nosh - Keyring

This is the "configuration secret" manager for nosh.
It handles two specific use cases:

* Application/codebase secrets:

- Encrypts secrets securely and allows decoded read during runtime. Only useful to obscure secrets configured in a repository; the app can decode and display secrets during runtime.

* User secrets:

- Keeps user encryption keys, themselves encrypted, in an LMDB database. This allows for pubkey sharing and encrypted user data storage.
- Access to the pubkey is not explicit; we can use challenges or predetermined grants/friendships/subscribers to inherently enable pubkey decryption.

## Technical Details

This repo uses NaCl for encryption and LMDB for storage. It is designed for use in nosh-based monorepos, but could be converted to a standalone library.

Node-RSA is used for RSA key generation and encryption.

