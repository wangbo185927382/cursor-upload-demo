# API服务器启动脚本
Write-Host "正在启动API服务器..."

# 检查是否安装了axios
$hasAxios = Test-Path -Path ".\node_modules\axios"
if (-not $hasAxios) {
    Write-Host "正在安装axios..."
    npm install axios
}

# 启动服务器进程
Start-Process node -ArgumentList "api_server.js" -NoNewWindow

Write-Host "API服务器已启动，端口9090"
Write-Host "可用接口:"
Write-Host "- 健康检查: http://localhost:9090/"
Write-Host "- 失信查询: http://localhost:9090/api/shixin?name=王博&idcard=620102198705150317"
Write-Host "- 转网查询: http://localhost:9090/api/phone/transfer?mobile=13800138000"
Write-Host "- 空号检测: http://localhost:9090/api/phone/status?mobile=13800138000"
Write-Host "- 在网状态: http://localhost:9090/api/phone/online?mobile=13800138000" 