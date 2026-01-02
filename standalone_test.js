const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Railway Platform Test: OK (Zero Dependencies)');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Standalone Server running at http://0.0.0.0:${PORT}`);
});
