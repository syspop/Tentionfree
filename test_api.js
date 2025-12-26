// using http module
// Using http module to be safe and dependency-free script
const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/orders',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Body Preview:', data.substring(0, 500));
        try {
            const json = JSON.parse(data);
            console.log(`JSON Parsed: Array Length = ${json.length}`);
            if (json.length > 0) {
                console.log('Sample ID:', json[0].id);
            }
        } catch (e) {
            console.log('Invalid JSON');
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
