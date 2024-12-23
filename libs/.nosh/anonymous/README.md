# nosh - Anonymous

This is the authentication library for nosh. It is designed to manage several use cases:

* Anonymous users
* User accounts with -
  * Magic link logins
  * Secure password logins
  * Webauthn logins
  * OAuth logins
  * Slug token storage
  * MFA (?)
  * Device-to-device QR code authentication
* Additionally, externally-exposed APIs are accessible via:
  * JWT
  * Custom client tokens
  * One-time tokens
  * Session tokens
  * API keys


## Technical Details

Anonymous uses scrypt for password hashing, stored in a standard RDBMS.
