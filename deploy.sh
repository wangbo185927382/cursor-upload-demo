#!/bin/bash

# 默认配置
SERVER_IP="212.64.81.159"
REMOTE_USER="root"
DEPLOY_PATH="/var/www/risk-query-api"
SSH_KEY_PATH="$HOME/.ssh/id_rsa"

# 显示帮助信息
function show_help {
    echo "风险查询API服务部署脚本"
    echo "用法: ./deploy.sh [选项]"
    echo "选项:"
    echo "  -h, --help          显示帮助信息"
    echo "  -i, --ip IP         设置服务器IP地址 (默认: $SERVER_IP)"
    echo "  -u, --user USER     设置远程用户名 (默认: $REMOTE_USER)"
    echo "  -p, --path PATH     设置部署路径 (默认: $DEPLOY_PATH)"
    echo "  -k, --key PATH      设置SSH密钥路径 (默认: $SSH_KEY_PATH)"
    exit 0
}

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            show_help
            ;;
        -i|--ip)
            SERVER_IP="$2"
            shift 2
            ;;
        -u|--user)
            REMOTE_USER="$2"
            shift 2
            ;;
        -p|--path)
            DEPLOY_PATH="$2"
            shift 2
            ;;
        -k|--key)
            SSH_KEY_PATH="$2"
            shift 2
            ;;
        *)
            echo "未知选项: $1"
            show_help
            ;;
    esac
done

echo "开始部署到服务器 $SERVER_IP..."

# 检查所需文件
REQUIRED_FILES=("simple_api_server.js" "package.json" "README.md")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "错误: 缺少必要文件 $file"
        exit 1
    fi
done

# 创建package.json文件(如果不存在)
if [ ! -f "package.json" ]; then
    echo "创建package.json文件..."
    cat > package.json << EOF
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
EOF
fi

# 创建README文件(如果不存在)
if [ ! -f "README.md" ]; then
    echo "创建README.md文件..."
    cat > README.md << EOF
# 风险查询API服务

提供失信人查询与手机号风险查询API服务。

## 使用方法

\`\`\`bash
# 安装依赖
npm install

# 启动服务
npm start

# 或使用PM2启动
npm run pm2-start
\`\`\`

## 可用API

- 转网查询: \`http://[服务器地址]:9090/api/phone/transfer?mobile=13800138000\`
- 空号检测: \`http://[服务器地址]:9090/api/phone/status?mobile=13800138000\`
- 在网状态: \`http://[服务器地址]:9090/api/phone/online?mobile=13800138000\`
- 失信查询: \`http://[服务器地址]:9090/api/shixin?name=李明&idcard=110101199003075432\`
- 订阅接口: \`POST http://[服务器地址]:9090/api/subscribe\`
EOF
fi

# 创建部署配置文件
cat > deploy-config.json << EOF
{
  "serverIp": "$SERVER_IP",
  "remoteUser": "$REMOTE_USER",
  "deployPath": "$DEPLOY_PATH",
  "sshKeyPath": "$SSH_KEY_PATH",
  "lastDeployTime": "$(date '+%Y-%m-%d %H:%M:%S')"
}
EOF

# 创建临时部署目录
TEMP_DIR="deploy-temp"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# 复制所需文件到临时目录
echo "准备部署文件..."
cp simple_api_server.js package.json README.md "$TEMP_DIR/"

# 创建启动脚本
cat > "$TEMP_DIR/start.sh" << EOF
#!/bin/bash
cd \$(dirname "\$0")
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
EOF

chmod +x "$TEMP_DIR/start.sh"

# 检查是否能使用SSH命令
if command -v ssh &> /dev/null; then
    echo "使用SSH部署..."
    
    # 创建压缩文件
    tar -czf deploy.tar.gz -C "$TEMP_DIR" .
    
    # 执行部署命令
    # 1. 创建目录(如果不存在)
    ssh -i "$SSH_KEY_PATH" "$REMOTE_USER@$SERVER_IP" "mkdir -p $DEPLOY_PATH"
    
    # 2. 上传文件
    scp -i "$SSH_KEY_PATH" deploy.tar.gz "$REMOTE_USER@$SERVER_IP:$DEPLOY_PATH/"
    
    # 3. 解压文件并配置权限
    ssh -i "$SSH_KEY_PATH" "$REMOTE_USER@$SERVER_IP" "cd $DEPLOY_PATH && tar -xzf deploy.tar.gz && chmod +x start.sh && ./start.sh"
    
    if [ $? -eq 0 ]; then
        echo "部署成功！服务已在$SERVER_IP上启动"
        echo "可通过以下地址访问：http://$SERVER_IP:9090/"
    else
        echo "部署过程出错"
    fi
else
    echo "SSH命令不可用，请手动部署:"
    echo "1. 将'$TEMP_DIR'目录中的文件上传到服务器"
    echo "2. 在服务器上运行: chmod +x start.sh && ./start.sh"
fi

# 清理临时文件
rm -rf "$TEMP_DIR"
rm -f deploy.tar.gz

echo "部署脚本执行完成" 