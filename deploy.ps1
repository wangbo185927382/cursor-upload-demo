param (
    [string]$serverIp = "212.64.81.159",
    [string]$remoteUser = "root",
    [string]$deployPath = "/var/www/risk-query-api",
    [string]$sshKeyPath = "$env:USERPROFILE\.ssh\id_rsa"
)

Write-Host "开始部署到服务器 $serverIp..." -ForegroundColor Green

# 检查所需文件
$requiredFiles = @(
    "simple_api_server.js",
    "package.json",
    "README.md"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "错误: 缺少必要文件 $file" -ForegroundColor Red
        exit 1
    }
}

# 创建package.json文件(如果不存在)
if (-not (Test-Path "package.json")) {
    Write-Host "创建package.json文件..." -ForegroundColor Yellow
    @"
{
  "name": "risk-query-api",
  "version": "1.0.0",
  "description": "风险查询API服务",
  "main": "simple_api_server.js",
  "scripts": {
    "start": "node simple_api_server.js",
    "pm2-start": "pm2 start simple_api_server.js --name risk-api"
  },
  "dependencies": {
    "nodemailer": "^6.9.7"
  }
}
"@ | Out-File -FilePath "package.json" -Encoding utf8
}

# 创建README文件(如果不存在)
if (-not (Test-Path "README.md")) {
    Write-Host "创建README.md文件..." -ForegroundColor Yellow
    @"
# 风险查询API服务

提供失信人查询与手机号风险查询API服务。

## 使用方法

```bash
# 安装依赖
npm install

# 启动服务
npm start

# 或使用PM2启动
npm run pm2-start
```

## 可用API

- 转网查询: \`http://[服务器地址]:9090/api/phone/transfer?mobile=13800138000\`
- 空号检测: \`http://[服务器地址]:9090/api/phone/status?mobile=13800138000\`
- 在网状态: \`http://[服务器地址]:9090/api/phone/online?mobile=13800138000\`
- 失信查询: \`http://[服务器地址]:9090/api/shixin?name=李明&idcard=110101199003075432\`
- 订阅接口: \`POST http://[服务器地址]:9090/api/subscribe\`

"@ | Out-File -FilePath "README.md" -Encoding utf8
}

# 创建部署配置文件
$deployConfig = @"
{
  "serverIp": "$serverIp",
  "remoteUser": "$remoteUser",
  "deployPath": "$deployPath",
  "sshKeyPath": "$sshKeyPath",
  "lastDeployTime": "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}
"@
$deployConfig | Out-File -FilePath "deploy-config.json" -Encoding utf8

# 创建临时部署目录
$tempDir = "deploy-temp"
if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -Path $tempDir -ItemType Directory | Out-Null

# 复制所需文件到临时目录
Write-Host "准备部署文件..." -ForegroundColor Yellow
Copy-Item -Path "simple_api_server.js" -Destination $tempDir
Copy-Item -Path "package.json" -Destination $tempDir
Copy-Item -Path "README.md" -Destination $tempDir

# 创建启动脚本
@"
#!/bin/bash
cd \$( dirname "\$0" )
echo "安装依赖..."
npm install
echo "启动服务..."
# 检查PM2是否安装
if command -v pm2 &> /dev/null; then
    # 检查服务是否已经在运行
    if pm2 list | grep -q "risk-api"; then
        echo "更新服务..."
        pm2 reload risk-api
    else
        echo "使用PM2启动服务..."
        pm2 start simple_api_server.js --name risk-api
    fi
else
    echo "PM2未安装，使用nohup启动..."
    nohup node simple_api_server.js > server.log 2>&1 &
fi
echo "服务启动成功！"
"@ | Out-File -FilePath "$tempDir\start.sh" -Encoding utf8 -NoNewline

# Windows换行符转换为Linux换行符
((Get-Content -Path "$tempDir\start.sh" -Raw) -replace "`r`n","`n") | Set-Content -Path "$tempDir\start.sh" -NoNewline

# 检查是否能使用SSH命令
if (Get-Command "ssh" -ErrorAction SilentlyContinue) {
    Write-Host "使用SSH部署..." -ForegroundColor Yellow
    
    # 创建压缩文件
    Compress-Archive -Path "$tempDir\*" -DestinationPath "deploy.zip" -Force
    
    # 执行部署命令
    try {
        # 1. 创建目录(如果不存在)
        ssh -i $sshKeyPath "$remoteUser@$serverIp" "mkdir -p $deployPath"
        
        # 2. 上传文件
        scp -i $sshKeyPath "deploy.zip" "$remoteUser@$serverIp`:$deployPath/deploy.zip"
        
        # 3. 解压文件并配置权限
        ssh -i $sshKeyPath "$remoteUser@$serverIp" "cd $deployPath && unzip -o deploy.zip && chmod +x start.sh && ./start.sh"
        
        Write-Host "部署成功！服务已在$serverIp上启动" -ForegroundColor Green
        Write-Host "可通过以下地址访问：http://$serverIp:9090/" -ForegroundColor Cyan
    }
    catch {
        Write-Host "部署过程出错: $_" -ForegroundColor Red
    }
}
else {
    Write-Host "SSH命令不可用，请手动部署:" -ForegroundColor Yellow
    Write-Host "1. 将'$tempDir'目录中的文件上传到服务器" -ForegroundColor White
    Write-Host "2. 在服务器上运行: chmod +x start.sh && ./start.sh" -ForegroundColor White
}

# 清理临时文件
Remove-Item -Path $tempDir -Recurse -Force
Remove-Item -Path "deploy.zip" -Force -ErrorAction SilentlyContinue

Write-Host "部署脚本执行完成" -ForegroundColor Green 