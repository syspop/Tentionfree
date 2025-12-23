@echo off
echo Starting TentionFree Local Server...
echo.
echo Server will run at http://localhost:3000
echo.
echo Opening Admin Panel...
start http://localhost:3000/secure-admin.html
echo.
echo DO NOT CLOSE THIS WINDOW while using the admin panel.
echo.
node server.js
pause
