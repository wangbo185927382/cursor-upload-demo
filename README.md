# 风险查询API服务

提供失信人查询与手机号风险查询API服务，包括转网查询、空号检测、在线状态查询等功能。

## 功能特点

- **多种查询功能**：支持转网查询、空号检测、在线状态、失信人信息查询
- **友好的用户界面**：提供便捷的Web界面进行查询测试
- **稳定可靠**：服务器自动处理异常情况，确保服务稳定运行
- **灵活部署**：提供一键部署脚本，支持快速部署和更新

## 快速部署

### Windows环境

在Windows环境下，使用PowerShell脚本进行部署：

```powershell
# 使用默认配置部署
./deploy.ps1

# 自定义部署参数
./deploy.ps1 -serverIp "212.64.81.159" -remoteUser "admin" -deployPath "/opt/api"
```

### Linux/Mac环境

在Linux或Mac环境下，使用Bash脚本进行部署：

```bash
# 赋予脚本执行权限
chmod +x deploy.sh

# 使用默认配置部署
./deploy.sh

# 自定义部署参数
./deploy.sh -i 212.64.81.159 -u admin -p /opt/api
```

## 手动部署方法

如果自动部署脚本无法使用，可以按以下步骤手动部署：

1. 确保服务器已安装Node.js（v12+）
2. 将以下文件上传到服务器：
   - simple_api_server.js
   - package.json
   - start.sh（如不存在可从deploy-temp目录获取）
3. 在服务器上执行以下命令：
   ```bash
   cd /path/to/uploaded/files
   chmod +x start.sh
   ./start.sh
   ```
4. 服务将在后台启动，可通过访问http://服务器IP:9090/检查服务是否正常运行

## 可用API

服务启动后，以下API将可用：

- **健康检查**：`http://服务器IP:9090/`
- **转网查询**：`http://服务器IP:9090/api/phone/transfer?mobile=13800138000`
- **空号检测**：`http://服务器IP:9090/api/phone/status?mobile=13800138000`
- **在网状态**：`http://服务器IP:9090/api/phone/online?mobile=13800138000`
- **失信查询**：`http://服务器IP:9090/api/shixin?name=张三&idcard=110101199001011234`
- **订阅服务**：`POST http://服务器IP:9090/api/subscribe`
  - 请求体格式：`{"name":"姓名","phone":"13800138000","email":"example@example.com","company":"公司名称"}`

## 订阅功能配置

如需启用邮件发送功能，请修改simple_api_server.js文件中的邮箱配置：

1. 安装nodemailer：`npm install nodemailer`
2. 修改simple_api_server.js中的邮箱配置（约在第20-50行）：
   ```javascript
   const transporter = nodemailer.createTransport({
     host: 'smtp.example.com',    // 修改为您的SMTP服务器
     port: 465,                   // 修改为正确的端口
     secure: true,
     auth: {
       user: 'your-email@example.com', // 修改为您的邮箱地址
       pass: 'your-password-or-app-password', // 修改为您的密码或应用密码
     },
   });
   ```

## 服务管理

### 使用PM2管理服务（推荐）

PM2是Node.js应用的进程管理工具，可以保证服务稳定运行：

```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm2 start simple_api_server.js --name risk-api

# 查看运行状态
pm2 status

# 查看日志
pm2 logs risk-api

# 重启服务
pm2 restart risk-api

# 停止服务
pm2 stop risk-api
```

### 不使用PM2的管理方法

```bash
# 启动服务（后台运行）
nohup node simple_api_server.js > server.log 2>&1 &

# 查看运行状态
ps aux | grep node

# 停止服务
pkill -f "node simple_api_server.js"
```

## 常见问题

1. **服务无法启动**
   - 检查Node.js是否正确安装：`node -v`
   - 检查是否已安装依赖：`npm install`
   - 检查9090端口是否被占用：`netstat -an | grep 9090`

2. **无法访问服务**
   - 检查服务器防火墙是否开放9090端口
   - 检查服务是否正在运行：`ps aux | grep node`

3. **邮件通知功能不工作**
   - 确认已安装nodemailer：`npm list nodemailer`
   - 检查邮箱配置是否正确
   - 查看日志文件中的错误信息

## 更新记录

- **1.0.0** (2023-11-18) - 初始版本发布
- **1.0.1** (2023-11-20) - 增加订阅功能和邮件通知
- **1.0.2** (2023-11-25) - 优化界面设计，增加部署脚本 