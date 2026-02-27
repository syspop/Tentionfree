const speakeasy = require('speakeasy');
const secret = 'HY7WWLCDOUYSG42KJ43UMJC5O5ZT4JKX';

const token = speakeasy.totp({
    secret: secret,
    encoding: 'base32'
});

console.log("Current Time:", new Date().toISOString());
console.log("Valid Token:", token);

// Check verification window
const verify = speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 10
});
console.log("Self-Verification Result:", verify);
