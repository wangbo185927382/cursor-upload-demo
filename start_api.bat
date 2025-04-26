@echo off
echo 正在启动API服务器...

:: 检查是否安装了axios
if not exist "node_modules\axios" (
    echo 正在安装axios...
    npm install axios
)

:: 启动服务器进程
start "API Server" /min cmd /k "node api_server.js > api_server_log.txt 2>&1"

echo API服务器已启动，端口9090
echo 可用接口:
echo - 健康检查: http://localhost:9090/
echo - 失信查询: http://localhost:9090/api/shixin?name=王博^&idcard=620102198705150317
echo - 转网查询: http://localhost:9090/api/phone/transfer?mobile=13800138000
echo - 空号检测: http://localhost:9090/api/phone/status?mobile=13800138000
echo - 在网状态: http://localhost:9090/api/phone/online?mobile=13800138000 