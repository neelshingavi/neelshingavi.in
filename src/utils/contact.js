// Simple rot13 obfuscation — good enough against dumb scrapers
// Does NOT protect against determined humans looking at source
function rot13(str) {
  return str.replace(/[a-zA-Z]/g, (c) => {
    const base = c < 'a' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

// Store obfuscated values (run rot13 on the real values to get these)
// shingavineel@gmail.com → fuvatnivarry@tznvy.pbz
const ENCODED_EMAIL = 'fuvatnivarry@tznvy.pbz';
const ENCODED_PHONE = '+91 9284466546'; // numbers are fine in plain text

export const getEmail = () => rot13(ENCODED_EMAIL);
export const getPhone = () => ENCODED_PHONE;
