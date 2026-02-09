# EVE OAuth2 Token Management CLI

> ⚠️ This package is currently in an experimental stage, and it likely still contains some bugs.

> Efficiently manage your EVE Online OAuth2 tokens directly from the command line. Interactively handle token generation, refresh, and revocation through a series of prompts.

> ### 📋 Features

- **Interactive Prompts:** Manage your OAuth2 tokens through easy-to-follow CLI prompts.
- **Token Generation:** Securely generate new OAuth2 tokens for your EVE Online account.
- **Token Refresh:** Seamlessly refresh your tokens to ensure continuous access without interruptions.
- **Token Revocation:** Easily revoke tokens that are no longer needed or potentially compromised.
- **User-friendly Interface:** Intuitive and straightforward, designed for both novice and experienced users.

> ### 🚀 Getting Started

1. **Installation:**
   ```sh
   npm install eve-oauth-cli
   ```
2. **Usage:** Start the interactive CLI prompt with:
   ```sh
   eve-oauth [-p password]
   ```

   - Option `-p`: If you do not specify a `password`, you will be asked to enter the `password` at the prompt.

> ### ⚙️ Configuration

- **Application Settings**, (`Client ID`, `Client Secret`, `Callback URL`, `Enabled Scopes`): Obtain these from your [`EVE Online developer`](https://developers.eveonline.com/applications) account.

  #### ❓ How to Create OAuth Token Data Initially
  - Run `eve-oauth` without the `-p` option.

  - On the top page, select `Manage credentials`.

  - On the next page, choose `Select / New Credential`.

  - Enter the details for the new EVE Application Credential.

  - Confirm your entries by selecting `Yes` or cancel by selecting `No`.

  - You will be prompted to enter a password. Enter your desired password.
    - You can also choose an empty password by pressing `[Enter]` without typing anything.

  - You are now ready to manage your OAuth tokens!

> ### 🚀 Run The CLI

Here's a quick overview of what the CLI prompts might look like:

#### Top Page

```sh
$ yarn start
[EVE OAuth2 CLI Tool]: Welcome to EVE OAuth2 CLI Tool
│
◆  📝 Please select a task:
│  ● ⚙️  Manage credentials (Manage EVE App credentials.)
│  ○ 🔒 Manage tokens
│  ○ 🔀 Clear prompt
│  ○ 🔙 Quit prompt
└
```

#### Manage Credentials

<details>

```sh
[EVE OAuth2 CLI Tool]: Welcome to EVE OAuth2 CLI Tool
│
◇  📝 Please select a task:
│  ⚙️  Manage credentials
│
◆  ❓ What would you like to do with EVE App credentials?
│  ● 🏷️  Select / New Credential
│  ○ ℹ️  View Credential by selection
│  ○ 🖌️  Edit Credential by selection
│  ○ ❌ Remove Credential by selection
```

</details>

#### Select / New Credential

<details>

```sh
[EVE OAuth2 CLI Tool]: Welcome to EVE OAuth2 CLI Tool
│
◇  📝 Please select a task:
│  ⚙️  Manage credentials
│
◇  ❓ What would you like to do with EVE App credentials?
│  🏷️  Select / New Credential
│
◆  Which EVE App credential would you like to select?
│  ○ 🖌️  Register new App credential
│  ● 🔒  "eve-oauth-prompt", characters: 3
│  ○ 🔒  "eve-oauth-webApp", characters: 5
│  ○ 🔒  "## Keyset for general purpose use ##", characters: 2
└
```

</details>

#### Here, we selected "eve-oauth-prompt".

<details>

```sh
[EVE OAuth2 CLI Tool]: ℹ️  Selected App Credential Name: eve-oauth-prompt ✅ storage
│
◆  📝 Please select a task:
│  ● ⚙️  Manage credentials (Manage EVE App credentials.)
│  ○ 🔒 Manage tokens
│  ○ 🔀 Clear prompt
│  ○ 🔙 Quit prompt
└
```

</details>

> ### ✍️ Obtain Access Token API

#### getAccessToken

The `getAccessToken` function retrieves and refreshes the access token for a specified character in the EVE Online OAuth system.  
This function is particularly useful for ensuring that your application always has a valid access token for making authenticated requests to the EVE Online API.

#### Parameters

- `credentialNickname` (string): The nickname of the credential set to use.
- `charNameOrId` (string): The name or ID of the character for which to retrieve the access token.
- `pass` (string, optional): The password for decrypting the stored credentials.

#### Throws

- `Error`: If the `credentialNickname` is invalid or if the character record does not exist.

#### Example

```javascript
import { getAccessToken } from "eve-oauth-cli/get-token.mjs";

(async () => {
  try {
    // Force refresh the access token
    const token = await getAccessToken(
      "eve-oauth-prompt",
      "tonny andre",
      "1234", // stored credentials password
    );
    console.log("Access Token:", token);
  } catch (error) {
    console.error("Error retrieving access token:", error);
  }
})();
```

This example demonstrates how to import the `getAccessToken` function and use it to retrieve and refresh an access token for a specific character.  
The function will throw an error if the provided `credentialNickname` is invalid or if the character record does not exist.

> ### 🔗 EVE Reference Links

- [EVE Online (Official)](https://www.eveonline.com/)
- [EVE Developers Portal](https://developers.eveonline.com/)
- [EVE Developer Applications](https://developers.eveonline.com/applications)
- [SSO Documentation](https://developers.eveonline.com/docs/services/sso/)
- [OAuth Authorization Server Metadata (`.well-known`)](https://login.eveonline.com/.well-known/oauth-authorization-server)
- [ESI Overview](https://developers.eveonline.com/docs/services/esi/overview/)
- [ESI API Explorer (Swagger UI)](https://esi.evetech.net/ui/)
- [Image Server Documentation](https://developers.eveonline.com/docs/services/image-server/)
- [Static Data Documentation](https://developers.eveonline.com/docs/services/static-data/)
- [Static Data Downloads](https://developers.eveonline.com/static-data/)
- [ESI Issues (GitHub)](https://github.com/esi/esi-issues)
- [EVE Online Discord](https://www.eveonline.com/discord)

> ### ❓ Contributing

We welcome contributions! If you have suggestions or improvements, feel free to submit a pull request.

> ### 📝 License

This project is licensed under the MIT License.

**Note:** For more detailed documentation and troubleshooting, visit our [GitHub repository](https://github.com/jeffy-g/eve-oauth-cli).

> ### 📄 Copyright

© [jeffy-g](https://github.com/jeffy-g)

> ### [`CCP`](https://www.ccpgames.com/) Copyright Notice

EVE Online and the EVE logo are the registered trademarks of CCP hf. All rights are reserved worldwide.

All other trademarks are the property of their respective owners.  
EVE Online, the EVE logo, EVE and all associated logos and designs are the intellectual property of CCP hf. All artwork,  
screenshots, characters, vehicles, storylines, world facts or other recognizable features of the intellectual property  
relating to these trademarks are likewise the intellectual property of CCP hf.

CCP hf. has granted permission to `EVE OAuth2 Token Management CLI` to use EVE Online and all associated logos  
and designs for promotional and information purposes on its website but does not endorse,  
and is not in any way affiliated with, `EVE OAuth2 Token Management CLI`.

CCP is in no way responsible for the content on or functioning of this website,  
nor can it be liable for any damage arising from the use of this website.

---
