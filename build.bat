@echo off
echo Building frontend...
npm run build

if %errorlevel% neq 0 (
    echo Build failed!
    exit /b %errorlevel%
)

echo Copying backend files to dist...
xcopy /E /I /Y server\*.py dist\server\
xcopy /E /I /Y server\.env dist\server\
xcopy /E /I /Y server\.env.example dist\server\

echo Build completed successfully!
echo Run with: python dist/server/app.py