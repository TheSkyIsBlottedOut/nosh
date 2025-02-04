# nosh - Authentic

nosh's authentication library, using the SQLRite nosh library;
as nosh gains more database functions, 

## Current Supported Cases

### Database Types

- Sqlite

### Authentication Types

- Password
- Magic Links

## Future Supported Cases

- Database types: postgres, mongo
- Cloud supported use cases: OAuth/PEM/JWT support for GCP
- SMTP mailer support
- Anonymous user 'pigeonbox' login
- Webauthn
- QR code device chain
- RBAC role-based permissions
- Multi-Factor Authentication
- Third party client stub utilities
- API Key RBAC
- One-time tokens
- One-way/One-time forward auth
- Nosh shell layer key compatibility
- Nosh-friendly user table creation



## Technical Details

Authentic uses scrypt for password hashing, stored in a standard RDBMS.

## Usage

Magic Link:

```javascript
import { Authentic } from '@nosh/authentic'
configuration_object = {
  db: "myapp.db", // goes to the app-level data folder
  auth: {
    table: "users",
    email_column: "username",
    magic_column: "login_uuid"
  }
}

const authentic = new Authentic(configuration_object)
const {generate, auth} = authentic.ators.MagicLinkAuthenticator
const magicLink = generate('user@location.com') // uuid
const user = auth(magicLink) // user or null; user for magic link
```


