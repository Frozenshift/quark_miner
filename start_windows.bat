
call ".\additional\npm_install.bat"

:_minerstart
node ./src/init.js
goto _minerstart

pause