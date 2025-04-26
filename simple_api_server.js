const http = require('http');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

// 邮件发送配置
const EMAIL_TO = '185927382@qq.com'; // 接收订阅信息的邮箱

// 创建日志目录
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 日志函数
function log(message) {
  const logMessage = `[${new Date().toISOString()}] [INFO] ${message}`;
  console.log(logMessage);
  
  // 同时写入日志文件
  const logFile = path.join(logDir, `api_server_${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logMessage + '\n');
}

// 发送邮件函数
function sendEmail(subject, content) {
  log(`准备发送邮件到 ${EMAIL_TO}`);
  log(`邮件主题: ${subject}`);
  log(`邮件内容: ${content}`);
  
  try {
    // 由于PowerShell执行策略限制，无法安装nodemailer
    // 这里使用模拟方式，记录详细日志
    log('环境限制：由于PowerShell执行策略限制，无法安装nodemailer模块');
    log('邮件发送说明：要启用实际邮件发送功能，请按以下步骤操作：');
    log('1. 以管理员身份运行PowerShell');
    log('2. 执行命令：Set-ExecutionPolicy RemoteSigned');
    log('3. 执行命令：npm install nodemailer');
    log('4. 配置正确的邮箱信息（SMTP服务器、用户名和授权码）');
    
    // 将订阅信息写入专门的日志文件，便于查看
    const subscribeLogFile = path.join(logDir, `subscriptions_${new Date().toISOString().split('T')[0]}.log`);
    const subscribeLog = `
==== 新订阅信息 ====
时间: ${new Date().toLocaleString()}
主题: ${subject}
内容: 
${content}
====================
`;
    fs.appendFileSync(subscribeLogFile, subscribeLog);
    log(`订阅信息已保存到日志文件: ${subscribeLogFile}`);
    
    log(`邮件模拟发送完成。实际邮件未能发送，请检查上述配置说明`);
  } catch (error) {
    log(`邮件处理过程中发生错误: ${error.message}`);
    log(`错误堆栈: ${error.stack}`);
  }
}

// 创建服务器
const server = http.createServer((req, res) => {
  // 设置CORS头信息
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 解析URL
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const params = parsedUrl.query;
  
  log(`请求: ${req.method} ${pathname}, 参数: ${JSON.stringify(params)}`);
  
  // 主页 - 提供简单的HTML测试页面
  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>查风险</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            background-color: #f0f2f5;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .container {
            max-width: 700px;
            margin: 20px auto;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
        }
        h1 {
            color: #1890ff;
            text-align: center;
            margin-bottom: 5px;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 20px;
        }
        .form-section {
            border: 1px solid #eee;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .form-title {
            font-size: 18px;
            font-weight: bold;
            color: #1890ff;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px dashed #eee;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        input[type="text"] {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        button {
            background-color: #1890ff;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            width: 100%;
        }
        button:hover {
            background-color: #40a9ff;
        }
        .result {
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 4px;
            border-left: 4px solid #1890ff;
            min-height: 100px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #999;
            font-size: 12px;
        }
        .tabs {
            display: flex;
            margin-bottom: 20px;
        }
        .tab-link {
            flex: 1;
            text-align: center;
            padding: 10px;
            background-color: #f5f7fa;
            color: #666;
            text-decoration: none;
            margin: 0 5px;
            border-radius: 4px;
            font-size: 14px;
            transition: all 0.3s;
        }
        .tab-link:hover {
            background-color: #e6f7ff;
            color: #1890ff;
        }
        .tab-link.active {
            background-color: #1890ff;
            color: white;
        }
        .tab-link:first-child {
            margin-left: 0;
        }
        .tab-link:last-child {
            margin-right: 0;
        }
        .success-message {
            padding: 15px;
            background-color: #f6ffed;
            border: 1px solid #b7eb8f;
            border-radius: 4px;
            color: #52c41a;
            margin-top: 15px;
            text-align: center;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>查风险</h1>
        <div class="subtitle">提供失信人查询与手机号风险查询</div>
        
        <div class="tabs">
            <a href="/?tab=shixin" class="tab-link ${pathname === '/' && (!params.tab || params.tab === 'shixin') ? 'active' : ''}">失信人查询</a>
            <a href="/?tab=transfer" class="tab-link ${params.tab === 'transfer' ? 'active' : ''}">转网查询</a>
            <a href="/?tab=status" class="tab-link ${params.tab === 'status' ? 'active' : ''}">空号检测</a>
            <a href="/?tab=online" class="tab-link ${params.tab === 'online' ? 'active' : ''}">在网状态</a>
            <a href="/?tab=subscribe" class="tab-link ${params.tab === 'subscribe' ? 'active' : ''}">订阅服务</a>
        </div>
        
        <!-- 失信人查询表单 -->
        ${(!params.tab || params.tab === 'shixin') ? `
        <div class="form-section">
            <div class="form-title">失信人查询</div>
            <form action="/api/shixin" method="get" target="result-frame">
                <div class="form-group">
                    <label for="name">姓名</label>
                    <input type="text" id="name" name="name" value="李明" required>
                </div>
                <div class="form-group">
                    <label for="idcard">身份证号</label>
                    <input type="text" id="idcard" name="idcard" value="110101199003075431" required>
                </div>
                <button type="submit">查询</button>
            </form>
        </div>
        ` : ''}
        
        <!-- 转网查询表单 -->
        ${params.tab === 'transfer' ? `
        <div class="form-section">
            <div class="form-title">转网查询</div>
            <form action="/api/phone/transfer" method="get" target="result-frame">
                <div class="form-group">
                    <label for="mobile-transfer">手机号码</label>
                    <input type="text" id="mobile-transfer" name="mobile" value="13800138000" required>
                </div>
                <button type="submit">查询</button>
            </form>
        </div>
        ` : ''}
        
        <!-- 空号检测表单 -->
        ${params.tab === 'status' ? `
        <div class="form-section">
            <div class="form-title">空号检测</div>
            <form action="/api/phone/status" method="get" target="result-frame">
                <div class="form-group">
                    <label for="mobile-status">手机号码</label>
                    <input type="text" id="mobile-status" name="mobile" value="13800138000" required>
                </div>
                <button type="submit">查询</button>
            </form>
        </div>
        ` : ''}
        
        <!-- 在网状态表单 -->
        ${params.tab === 'online' ? `
        <div class="form-section">
            <div class="form-title">在网状态查询</div>
            <form action="/api/phone/online" method="get" target="result-frame">
                <div class="form-group">
                    <label for="mobile-online">手机号码</label>
                    <input type="text" id="mobile-online" name="mobile" value="13800138000" required>
                </div>
                <button type="submit">查询</button>
            </form>
        </div>
        ` : ''}
        
        <!-- 订阅服务表单 -->
        ${params.tab === 'subscribe' ? `
        <div class="form-section">
            <div class="form-title">订阅风险查询服务</div>
            <div style="margin-bottom: 15px; color: #666;">订阅后将获得更多查询次数及优先查询权限</div>
            <form id="subscribe-form">
                <div class="form-group">
                    <label for="subscribe-name">姓名</label>
                    <input type="text" id="subscribe-name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="subscribe-phone">手机号码</label>
                    <input type="text" id="subscribe-phone" name="phone" required>
                </div>
                <div class="form-group">
                    <label for="subscribe-email">邮箱地址</label>
                    <input type="text" id="subscribe-email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="subscribe-company">公司名称（选填）</label>
                    <input type="text" id="subscribe-company" name="company">
                </div>
                <button type="button" onclick="submitSubscription()">立即订阅</button>
            </form>
            <div id="subscribe-success" class="success-message">
                订阅成功！我们将尽快与您联系
            </div>
        </div>
        ` : ''}
        
        ${params.tab !== 'subscribe' ? `
        <div class="result">
            <iframe name="result-frame" style="width:100%; height:250px; border:none; overflow:auto;"></iframe>
        </div>
        ` : ''}
        
        <div class="footer">© 2025 查风险平台 - 仅供演示使用</div>
    </div>

    <script>
        ${params.tab === 'subscribe' ? `
        // 订阅函数
        function submitSubscription() {
            const name = document.getElementById('subscribe-name').value.trim();
            const phone = document.getElementById('subscribe-phone').value.trim();
            const email = document.getElementById('subscribe-email').value.trim();
            const company = document.getElementById('subscribe-company').value.trim();
            
            // 简单验证
            if (!name) {
                alert('请输入姓名');
                return;
            }
            
            if (!phone || !/^1[3-9]\\d{9}$/.test(phone)) {
                alert('请输入有效的手机号码');
                return;
            }
            
            if (!email || !email.includes('@')) {
                alert('请输入有效的邮箱地址');
                return;
            }
            
            // 发送订阅请求
            fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    phone,
                    email,
                    company
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.code === 200) {
                    // 显示成功消息
                    document.getElementById('subscribe-success').style.display = 'block';
                    
                    // 清空表单
                    document.getElementById('subscribe-form').reset();
                    
                    // 3秒后隐藏成功消息
                    setTimeout(() => {
                        document.getElementById('subscribe-success').style.display = 'none';
                    }, 3000);
                } else {
                    alert('订阅失败: ' + data.msg);
                }
            })
            .catch(error => {
                alert('请求错误: ' + error.message);
            });
        }
        ` : ''}
    </script>
</body>
</html>
    `);
    return;
  }
  
  // 修改失信人查询的API以显示HTML格式的结果，并添加详情
  if (pathname === '/api/shixin') {
    if (!params.name || !params.idcard) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<div style="color:red">错误：缺少姓名或身份证号参数</div>');
      return;
    }
    
    log('失信人查询: 姓名=' + params.name + ', 身份证=' + params.idcard);
    
    // 根据输入的身份证号最后一位来确定是否失信，便于测试
    const lastDigit = params.idcard.charAt(params.idcard.length - 1);
    const isShixin = ['1', '3', '5', '7', '9'].includes(lastDigit);
    const count = isShixin ? Math.floor(Math.random() * 3) + 1 : 0;
    
    // 生成JSON格式的结果
    const result = {
      code: 200,
      msg: '查询成功',
      result: {
        name: params.name,
        idcard: params.idcard,
        isShixin: isShixin,
        count: count
      }
    };
    
    // 返回HTML格式的结果
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    
    let html = `
      <div style="padding: 15px; background-color: #f9f9f9; border-radius: 4px; border-left: 4px solid #1890ff;">
        <div style="margin-bottom: 10px;"><span style="font-weight: 500; display: inline-block; width: 100px;">姓名:</span> ${params.name}</div>
        <div style="margin-bottom: 10px;"><span style="font-weight: 500; display: inline-block; width: 100px;">身份证:</span> ${params.idcard}</div>
        <div style="margin-bottom: 10px;"><span style="font-weight: 500; display: inline-block; width: 100px;">是否失信:</span> <span style="color: ${isShixin ? '#f5222d' : '#52c41a'}; font-weight: bold;">${isShixin ? '是' : '否'}</span></div>
        <div style="margin-bottom: 10px;"><span style="font-weight: 500; display: inline-block; width: 100px;">失信次数:</span> ${count}</div>
      </div>
    `;
    
    // 如果是失信人，显示详情
    if (isShixin) {
      html += `
        <div style="margin-top: 15px; padding: 15px; background-color: #f0f8ff; border-radius: 4px; border: 1px solid #d6e4ff;">
          <div style="font-weight: bold; margin-bottom: 10px; color: #1890ff;">案件 #1: 民间借贷纠纷</div>
          <div style="margin-bottom: 8px;">案号: (2023)京0105执1234号</div>
          <div style="margin-bottom: 8px;">法院: 北京市朝阳区人民法院</div>
          <div style="margin-bottom: 8px;">立案时间: 2023-06-15</div>
          <div style="margin-bottom: 8px;">案件金额: ¥125,000.00</div>
          <div style="margin-bottom: 8px;">执行状态: 执行中</div>
          <div style="margin-bottom: 8px;">案件原因: 拒不履行法院判决确定的给付义务</div>
          <div style="margin-bottom: 8px;">
            <span style="display: inline-block; padding: 2px 8px; font-size: 12px; border-radius: 4px; margin-right: 5px; margin-top: 5px; background-color: #fff1f0; border: 1px solid #ffccc7; color: #f5222d;">未履行</span>
            <span style="display: inline-block; padding: 2px 8px; font-size: 12px; border-radius: 4px; margin-right: 5px; margin-top: 5px; background-color: #fffbe6; border: 1px solid #ffe58f; color: #faad14;">高额欠款</span>
          </div>
        </div>
      `;
      
      if (count > 1) {
        html += `
          <div style="margin-top: 15px; padding: 15px; background-color: #f0f8ff; border-radius: 4px; border: 1px solid #d6e4ff;">
            <div style="font-weight: bold; margin-bottom: 10px; color: #1890ff;">案件 #2: 信用卡纠纷</div>
            <div style="margin-bottom: 8px;">案号: (2022)京0102执5678号</div>
            <div style="margin-bottom: 8px;">法院: 北京市西城区人民法院</div>
            <div style="margin-bottom: 8px;">立案时间: 2022-11-20</div>
            <div style="margin-bottom: 8px;">案件金额: ¥43,500.00</div>
            <div style="margin-bottom: 8px;">执行状态: 已结案</div>
            <div style="margin-bottom: 8px;">案件原因: 长期拖欠信用卡欠款未还</div>
            <div style="margin-bottom: 8px;">
              <span style="display: inline-block; padding: 2px 8px; font-size: 12px; border-radius: 4px; margin-right: 5px; margin-top: 5px; background-color: #fffbe6; border: 1px solid #ffe58f; color: #faad14;">已结案</span>
              <span style="display: inline-block; padding: 2px 8px; font-size: 12px; border-radius: 4px; margin-right: 5px; margin-top: 5px; background-color: #fff1f0; border: 1px solid #ffccc7; color: #f5222d;">个人信用</span>
            </div>
          </div>
        `;
      }
    }
    
    res.end(html);
    return;
  }
  
  // 手机号转网查询的API
  if (pathname === '/api/phone/transfer') {
    if (!params.mobile) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<div style="color:red">错误：缺少手机号参数</div>');
      return;
    }
    
    log('转网查询: ' + params.mobile);
    
    // 随机生成模拟数据
    const isTransferred = Math.random() > 0.5;
    const carrier = ['移动', '联通', '电信'][Math.floor(Math.random() * 3)];
    
    // 生成JSON格式的结果
    const result = {
      code: 200,
      msg: '查询成功',
      result: {
        mobile: params.mobile,
        type: isTransferred ? '已转网' : '未转网',
        carrier: carrier
      }
    };
    
    // 返回HTML格式的结果
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <div style="padding: 15px; background-color: #f9f9f9; border-radius: 4px; border-left: 4px solid #1890ff;">
        <div style="margin-bottom: 10px;"><span style="font-weight: 500; display: inline-block; width: 100px;">手机号码:</span> ${params.mobile}</div>
        <div style="margin-bottom: 10px;"><span style="font-weight: 500; display: inline-block; width: 100px;">转网状态:</span> <span style="color:${isTransferred ? '#f5222d' : '#52c41a'}">${isTransferred ? '已转网' : '未转网'}</span></div>
        <div style="margin-bottom: 10px;"><span style="font-weight: 500; display: inline-block; width: 100px;">运营商:</span> ${carrier}</div>
      </div>
    `);
    return;
  }
  
  // 空号检测的API
  if (pathname === '/api/phone/status') {
    if (!params.mobile) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<div style="color:red">错误：缺少手机号参数</div>');
      return;
    }
    
    log('空号检测: ' + params.mobile);
    
    const statuses = ['正常', '空号', '停机', '库无'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    let statusColor = '#666';
    
    if (status === '正常') statusColor = '#52c41a';
    else if (status === '空号') statusColor = '#f5222d';
    else if (status === '停机') statusColor = '#faad14';
    
    // 生成JSON格式的结果
    const result = {
      code: 200,
      msg: '查询成功',
      result: {
        mobile: params.mobile,
        status: status
      }
    };
    
    // 返回HTML格式的结果
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <div style="padding: 15px; background-color: #f9f9f9; border-radius: 4px; border-left: 4px solid #1890ff;">
        <div style="margin-bottom: 10px;"><span style="font-weight: 500; display: inline-block; width: 100px;">手机号码:</span> ${params.mobile}</div>
        <div style="margin-bottom: 10px;"><span style="font-weight: 500; display: inline-block; width: 100px;">号码状态:</span> <span style="color:${statusColor}">${status}</span></div>
      </div>
    `);
    return;
  }
  
  // 在网状态查询的API
  if (pathname === '/api/phone/online') {
    if (!params.mobile) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<div style="color:red">错误：缺少手机号参数</div>');
      return;
    }
    
    log('在网状态查询: ' + params.mobile);
    
    const isOnline = Math.random() > 0.3;
    
    // 生成JSON格式的结果
    const result = {
      code: 200,
      msg: '查询成功',
      result: {
        mobile: params.mobile,
        status: isOnline ? '在网' : '不在网'
      }
    };
    
    // 返回HTML格式的结果
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <div style="padding: 15px; background-color: #f9f9f9; border-radius: 4px; border-left: 4px solid #1890ff;">
        <div style="margin-bottom: 10px;"><span style="font-weight: 500; display: inline-block; width: 100px;">手机号码:</span> ${params.mobile}</div>
        <div style="margin-bottom: 10px;"><span style="font-weight: 500; display: inline-block; width: 100px;">在网状态:</span> <span style="color:${isOnline ? '#52c41a' : '#f5222d'}">${isOnline ? '在网' : '不在网'}</span></div>
      </div>
    `);
    return;
  }
  
  // 处理订阅请求
  if (pathname === '/api/subscribe' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      let data;
      
      try {
        data = JSON.parse(body);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 400, msg: '无效的JSON数据' }));
        return;
      }
      
      if (!data.name || !data.phone || !data.email) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 400, msg: '缺少必要参数' }));
        return;
      }
      
      log('订阅请求: 姓名=' + data.name + ', 手机=' + data.phone + ', 邮箱=' + data.email);
      
      // 保存订阅数据到文件
      const subscriptionData = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        company: data.company || '',
        time: new Date().toISOString()
      };
      
      const subscriptionsFile = path.join(__dirname, 'subscriptions.json');
      let subscriptions = [];
      
      // 尝试读取现有订阅数据
      try {
        if (fs.existsSync(subscriptionsFile)) {
          const fileContent = fs.readFileSync(subscriptionsFile, 'utf8');
          subscriptions = JSON.parse(fileContent);
        }
      } catch (error) {
        log('读取订阅文件失败: ' + error.message);
      }
      
      // 添加新订阅数据
      subscriptions.push(subscriptionData);
      
      // 保存到文件
      try {
        fs.writeFileSync(subscriptionsFile, JSON.stringify(subscriptions, null, 2), 'utf8');
        log('订阅保存成功: 已写入 ' + subscriptionsFile);
        
        // 发送订阅信息到邮箱
        const subject = `新订阅通知: ${data.name}`;
        const content = `
          <h2>新订阅用户信息</h2>
          <p><strong>姓名:</strong> ${data.name}</p>
          <p><strong>手机号:</strong> ${data.phone}</p>
          <p><strong>邮箱:</strong> ${data.email}</p>
          <p><strong>公司:</strong> ${data.company || '未提供'}</p>
          <p><strong>订阅时间:</strong> ${new Date().toLocaleString()}</p>
        `;
        
        sendEmail(subject, content);
        
      } catch (error) {
        log('保存订阅文件失败: ' + error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 500, msg: '服务器内部错误' }));
        return;
      }
      
      // 返回成功
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        code: 200, 
        msg: '订阅成功', 
        result: { 
          name: data.name,
          phone: data.phone,
          email: data.email,
          time: subscriptionData.time
        } 
      }));
    });
    
    return;
  }
  
  // 处理其它请求
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<div style="color:red">404 Not Found</div>');
});

// 服务器端口
const PORT = 9090;
const HOST = '0.0.0.0';

// 启动服务器
server.listen(PORT, HOST, () => {
  log(`风险查询API服务器运行在 http://${HOST}:${PORT}/`);
  log(`可用API:`);
  log(`- 转网查询: http://localhost:${PORT}/api/phone/transfer?mobile=13800138000`);
  log(`- 空号检测: http://localhost:${PORT}/api/phone/status?mobile=13800138000`);
  log(`- 在网状态: http://localhost:${PORT}/api/phone/online?mobile=13800138000`);
  log(`- 失信查询: http://localhost:${PORT}/api/shixin?name=李明&idcard=110101199003075432`);
  log(`- 订阅接口: POST http://localhost:${PORT}/api/subscribe`);
}); 