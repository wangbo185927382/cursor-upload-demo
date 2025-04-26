@echo off
echo API服务器启动脚本
echo ====================

echo 检查npm和node...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未安装Node.js! 请先安装Node.js.
    pause
    exit /b
)

echo 检查axios包...
if not exist "node_modules\axios" (
    echo 安装axios包...
    npm install axios
    if %errorlevel% neq 0 (
        echo 警告: 安装axios失败，将使用模拟数据。
    ) else (
        echo axios安装成功。
    )
)

echo 检查端口...
netstat -ano | findstr :9090 >nul
if %errorlevel% equ 0 (
    echo 警告: 端口9090已被占用，尝试关闭现有进程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :9090') do (
        taskkill /f /pid %%a
        if %errorlevel% equ 0 (
            echo 成功关闭PID为%%a的进程。
        )
    )
)

echo 创建日志目录...
if not exist "logs" mkdir logs

echo 启动API服务器...
start "API服务器" /min cmd /c "node api_server.js > logs\server_%date:~0,4%%date:~5,2%%date:~8,2%.log 2>&1"

echo API服务器已在后台启动，端口9090
echo 可用接口:
echo - 健康检查: http://localhost:9090/
echo - 失信查询: http://localhost:9090/api/shixin?name=王博^&idcard=620102198705150317
echo - 转网查询: http://localhost:9090/api/phone/transfer?mobile=13800138000
echo - 空号检测: http://localhost:9090/api/phone/status?mobile=13800138000
echo - 在网状态: http://localhost:9090/api/phone/online?mobile=13800138000

echo ====================
echo 服务器日志将保存在logs目录中
echo 按任意键退出此窗口，服务器将继续在后台运行...
pause > nul 