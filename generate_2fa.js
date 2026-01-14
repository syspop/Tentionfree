const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { writeLocalJSON, readLocalJSON } = require('./data/db'); // Assuming this helper exists or we implement a simple one

// Simple fallback if db.js doesn't export read/write exactly as needed or to avoid side effects
const SYSTEM_DATA_PATH = path.join(__dirname, 'data/system_data.json');

async function getSystemData() {
    if (!fs.existsSync(SYSTEM_DATA_PATH)) return {};
    return JSON.parse(fs.readFileSync(SYSTEM_DATA_PATH, 'utf8'));
}

async function saveSystemData(data) {
    fs.writeFileSync(SYSTEM_DATA_PATH, JSON.stringify(data, null, 2));
}

async function generate() {
    console.log("🔐 Generating 2FA Secrets...");

    const adminSecret = speakeasy.generateSecret({ length: 20, name: "TentionFree Admin" });
    const backupSecret = speakeasy.generateSecret({ length: 20, name: "TentionFree Backup" });

    // Save to System Data
    const systemData = await getSystemData();
    systemData.admin2faSecret = adminSecret.base32;
    systemData.backup2faSecret = backupSecret.base32;
    await saveSystemData(systemData);

    console.log("✅ Secrets Saved to system_data.json");

    // Generate QR Codes
    const adminQr = await QRCode.toDataURL(adminSecret.otpauth_url);
    const backupQr = await QRCode.toDataURL(backupSecret.otpauth_url);

    // Create HTML File
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>2FA Setup - Do Not Distribute</title>
        <style>
            body { font-family: sans-serif; padding: 40px; text-align: center; background: #f0f2f5; }
            .card { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto 30px; }
            h2 { margin-top: 0; color: #333; }
            .code { background: #eee; padding: 10px; font-family: monospace; font-size: 18px; border-radius: 5px; margin: 20px 0; word-break: break-all; }
            .warning { color: red; font-weight: bold; margin-bottom: 20px; }
            img { width: 250px; height: 250px; }
        </style>
    </head>
    <body>
        <h1>🔐 2FA Setup Keys</h1>
        <p class="warning">⚠️ IMPORTANT: Scan these codes immediately and then DELETE this file permanently.</p>
        
        <div class="card">
            <h2>👮 Admin Panel Login</h2>
            <p>Scan with Google Authenticator</p>
            <img src="${adminQr}" alt="Admin QR">
            <p>Secret Key (Manual Entry):</p>
            <div class="code">${adminSecret.base32}</div>
        </div>

        <div class="card">
            <h2>💾 Backup System Login</h2>
            <p>Scan with Google Authenticator</p>
            <img src="${backupQr}" alt="Backup QR">
            <p>Secret Key (Manual Entry):</p>
            <div class="code">${backupSecret.base32}</div>
        </div>
    </body>
    </html>
    `;

    // Save to Desktop
    const desktopPath = path.join(require('os').homedir(), 'OneDrive - hlwz', 'Desktop', '2FA_QR_CODES.html');
    // NOTE: Hardcoding based on User context found in path properties, or using dynamic homedir.
    // The user's metadata shows: c:\Users\Kazi Emdadul Haque\OneDrive - hlwz\Desktop...
    // Let's rely on the absolute path constructed from known user structure if possible, or just os.homedir() + OneDrive... 
    // Given the CWD is inside the project folder on Desktop, we can try to find Desktop relative to it or absolute.

    // Safer to write to project root then move? Or just write absolute.
    const targetFile = 'c:\\Users\\Kazi Emdadul Haque\\OneDrive - hlwz\\Desktop\\2FA_QR_CODES.html';

    fs.writeFileSync(targetFile, htmlContent);
    console.log(`✅ QR Code HTML file created at: ${targetFile}`);
    console.log("👉 Please open this file, scan the codes, and then delete the file.");
}

generate();
