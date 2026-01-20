const { generateRegistrationOptions } = require('@simplewebauthn/server');
const fs = require('fs');
const path = require('path');

// Mock specific environment
const RP_ID = 'tentionfree.store';

async function run() {
    console.log("--- START DEBUG ---");

    try {
        const systemDataPath = path.join(__dirname, 'data', 'system_data.json');
        let systemData = {};
        if (fs.existsSync(systemDataPath)) {
            systemData = JSON.parse(fs.readFileSync(systemDataPath, 'utf8'));
        }
        console.log("System Data:", JSON.stringify(systemData, null, 2));

        const adminPasskeys = Array.isArray(systemData.adminPasskeys) ? systemData.adminPasskeys : [];
        console.log("Admin Passkeys:", adminPasskeys);

        // Mimic logic from authRoutes.js
        const excludeCredentials = adminPasskeys.map(passkey => {
            let id = passkey.id;
            console.log(`Processing passkey id: ${id} (${typeof id})`);

            if (id && id.type === 'Buffer' && Array.isArray(id.data)) {
                id = new Uint8Array(id.data);
            } else if (typeof id === 'string') {
                id = base64urlToBuffer(id);
            } else {
                console.warn("Unknown ID format:", id);
            }

            return {
                id: id,
                transports: passkey.transports,
            };
        });

        console.log("Exclude Credentials:", excludeCredentials);

        console.log("Calling generateRegistrationOptions...");
        const options = await generateRegistrationOptions({
            rpName: 'Tention Free Admin',
            rpID: RP_ID,
            userID: new Uint8Array(Buffer.from('admin-user-id')),
            userName: 'admin@tentionfree.store',
            attestationType: 'none',
            excludeCredentials: excludeCredentials,
            authenticatorSelection: {
                residentKey: 'required',
                userVerification: 'preferred',
            },
        });

        console.log("Options generated successfully:", options);

    } catch (e) {
        console.error("CRASHED:", e);
        if (e.stack) console.error(e.stack);
    }
}

function base64urlToBuffer(base64url) {
    if (typeof base64url !== 'string') {
        console.error("base64urlToBuffer received non-string:", base64url);
        return Buffer.from([]); // safe fallback for debug
    }
    const padding = '='.repeat((4 - base64url.length % 4) % 4);
    const base64 = (base64url + padding).replace(/\-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, 'base64');
}

run();
