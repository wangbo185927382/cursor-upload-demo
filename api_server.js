const http = require('http');
const url = require('url');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 创建日志目录
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 日志文件
const logFile = path.join(logDir, `api_server_${new Date().toISOString().split('T')[0]}.log`);

// 配置
const config = {
  port: 9090,
  host: '0.0.0.0',
  apiKeys: {
    alicloud: 'your_alicloud_api_key' // 替换为您的API密钥
  },
  endpoints: {
    phoneTransfer: {
      url: 'https://slytransf.market.alicloudapi.com/mobile/check',
      method: 'GET'
    },
    phoneStatus: {
      url: 'https://lhkhjc.market.alicloudapi.com/phone/status',
      method: 'GET'
    },
    phoneOnline: {
      url: 'https://hjmstatus.market.alicloudapi.com/mobile/status',
      method: 'GET'
    }
  }
};

// 测试页面的HTML内容
const testPageHtml = `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>风险客户查询系统</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</head>
<body>
    <div class="container">
        <div class="main-content">
            <h1>风险客户查询系统</h1>
            
            <!-- 查询表单 -->
            <div class="query-section">
                <div class="query-form">
                    <h3>客户信息查询</h3>
                    <div class="input-group">
                        <div class="input-field">
                            <i class="fas fa-user"></i>
                            <input type="text" id="nameInput" placeholder="请输入姓名">
            </div>
                        <div class="input-field">
                            <i class="fas fa-id-card"></i>
                            <input type="text" id="idCardInput" placeholder="请输入身份证号">
        </div>
                        <div class="input-field">
                            <i class="fas fa-mobile-alt"></i>
                            <input type="text" id="phoneInput" placeholder="请输入手机号">
        </div>
                        <button id="queryBtn" class="submit-btn">
                            <i class="fas fa-search"></i>
                            风险查询
                        </button>
                </div>
                    </div>
                </div>
                
            <!-- 查询结果展示 -->
            <div id="resultContainer" class="result-container" style="display: none;">
                <div class="result-tabs">
                    <button class="tab-btn active" data-tab="courtTab">法院涉诉信息</button>
                    <button class="tab-btn" data-tab="phoneTab">手机号信息</button>
                    <button class="tab-btn" data-tab="riskTab">风险综合评估</button>
                </div>
                
                <!-- 法院涉诉信息 -->
                <div id="courtTab" class="tab-content active">
                    <h3>法院涉诉信息</h3>
                    <div class="court-summary">
                        <div class="status-card">
                            <h4>失信被执行人状态</h4>
                            <div class="status-value" id="courtStatus">--</div>
                    </div>
                        <div class="status-card">
                            <h4>涉诉案件数量</h4>
                            <div class="status-value" id="caseCount">--</div>
                    </div>
                </div>
                    <div class="court-details">
                        <h4>涉诉案件详情</h4>
                        <table class="detail-table">
                            <thead>
                                <tr>
                                    <th>案号</th>
                                    <th>案件类型</th>
                                    <th>立案日期</th>
                                    <th>执行状态</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody id="courtTableBody">
                                <!-- 动态填充内容 -->
                            </tbody>
                        </table>
            </div>
        </div>
        
                <!-- 手机号信息 -->
                <div id="phoneTab" class="tab-content">
                    <h3>手机号信息</h3>
                    <div class="phone-summary">
                        <div class="status-card">
                            <h4>手机在网状态</h4>
                            <div class="status-value" id="phoneStatus">--</div>
                </div>
                        <div class="status-card">
                            <h4>在网时长</h4>
                            <div class="status-value" id="onlineDuration">--</div>
                    </div>
                        <div class="status-card">
                            <h4>跨网记录</h4>
                            <div class="status-value" id="crossNetworkCount">--</div>
                </div>
                    </div>
                    <div class="phone-details">
                        <h4>跨网历史记录</h4>
                        <table class="detail-table">
                            <thead>
                                <tr>
                                    <th>变更日期</th>
                                    <th>原运营商</th>
                                    <th>新运营商</th>
                                    <th>状态</th>
                                </tr>
                            </thead>
                            <tbody id="phoneTableBody">
                                <!-- 动态填充内容 -->
                            </tbody>
                        </table>
            </div>
        </div>
        
                <!-- 风险综合评估 -->
                <div id="riskTab" class="tab-content">
                    <h3>风险综合评估</h3>
                    <div class="risk-summary">
                        <div class="risk-score">
                            <div class="score-circle">
                                <span id="riskScoreValue">--</span>
                </div>
                            <span class="score-label">风险评分</span>
                    </div>
                        <div class="risk-level">
                            <h4>风险等级</h4>
                            <div class="level-value" id="riskLevel">--</div>
                </div>
                    </div>
                    <div class="risk-analysis">
                        <h4>风险因素分析</h4>
                        <ul id="riskFactors">
                            <!-- 动态填充内容 -->
                        </ul>
                </div>
            </div>
        </div>
        
            <!-- 详情弹窗 -->
            <div id="detailModal" class="modal">
                <div class="modal-content">
                    <span class="close-btn">&times;</span>
                    <h3 id="modalTitle">案件详情</h3>
                    <div id="modalContent">
                        <!-- 动态填充内容 -->
                </div>
                </div>
            </div>
        </div>
    </div>

    <script src="app.js"></script>
</body>
</html>
`;

// 日志函数
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  console.log(logMessage.trim());
  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (err) {
    console.error(`无法写入日志文件: ${err.message}`);
  }
}

// 创建HTTP服务器
const server = http.createServer(async (req, res) => {
  // 设置CORS头，允许跨域请求
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 解析请求URL
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const params = parsedUrl.query;
  
  log(`请求: ${req.method} ${pathname}, 参数: ${JSON.stringify(params)}`);

  try {
    // 处理根路径请求和API测试页面，直接返回HTML内容
    if (pathname === '/' || pathname === '/index.html' || pathname === '/api_test.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(testPageHtml);
      return;
    }
    
    // 健康检查端点
    if (pathname === '/api') {
      res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
      res.end(JSON.stringify({
        code: 200,
        msg: 'API服务器正常运行',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }));
      return;
    }
    
    // 手机号转网查询
    if (pathname === '/api/phone/transfer') {
      if (!params.mobile) {
        res.writeHead(400, { 'Content-Type': 'application/json;charset=utf-8' });
        res.end(JSON.stringify({ code: 400, msg: '缺少手机号参数', result: null }));
        return;
      }
      
      log(`转网查询: ${params.mobile}`);
      
      // 直接返回模拟数据
      res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
      res.end(JSON.stringify({
        code: 200,
        msg: '成功（模拟数据）',
        result: {
          mobile: params.mobile,
          type: Math.random() > 0.5 ? '已转网' : '未转网',
          mnp: Math.random() > 0.5 ? 1 : 0,
          carrier: ['移动', '联通', '电信'][Math.floor(Math.random() * 3)]
        }
      }));
      return;
    }
    
    // 手机号空号检测
    if (pathname === '/api/phone/status') {
      if (!params.mobile) {
        res.writeHead(400, { 'Content-Type': 'application/json;charset=utf-8' });
        res.end(JSON.stringify({ code: 400, msg: '缺少手机号参数', result: null }));
        return;
      }
      
      log(`空号检测: ${params.mobile}`);
      
      // 直接返回模拟数据
      res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
      res.end(JSON.stringify({
        code: 200,
        msg: '成功（模拟数据）',
        result: {
          mobile: params.mobile,
          status: ['正常', '空号', '停机', '库无'][Math.floor(Math.random() * 4)],
          message: '查询成功'
        }
      }));
      return;
    }
    
    // 手机号在网状态查询
    if (pathname === '/api/phone/online') {
      if (!params.mobile) {
        res.writeHead(400, { 'Content-Type': 'application/json;charset=utf-8' });
        res.end(JSON.stringify({ code: 400, msg: '缺少手机号参数', result: null }));
        return;
      }
      
      log(`在网状态查询: ${params.mobile}`);
      
      // 直接返回模拟数据
      res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
      res.end(JSON.stringify({
        code: 200,
        msg: '成功（模拟数据）',
        result: {
          mobile: params.mobile,
          status: Math.random() > 0.3 ? '在网' : '不在网',
          message: '查询成功'
        }
      }));
      return;
    }
    
    // 失信人查询
    if (pathname === '/api/shixin') {
      if (!params.name || !params.idcard) {
        res.writeHead(400, { 'Content-Type': 'application/json;charset=utf-8' });
        res.end(JSON.stringify({ 
          code: 400, 
          msg: '缺少必要参数', 
          result: null,
          requiredParams: {name: '姓名', idcard: '身份证号码'}
        }));
        return;
      }
      
      log(`失信人查询: 姓名=${params.name}, 身份证=${params.idcard}`);
      
      // 直接返回模拟数据
      res.writeHead(200, { 'Content-Type': 'application/json;charset=utf-8' });
      res.end(JSON.stringify({
        code: 200,
        msg: '成功（模拟数据）',
        result: {
          name: params.name,
          idcard: params.idcard,
          isShixin: Math.random() > 0.8,
          count: Math.floor(Math.random() * 3),
          details: []
        }
      }));
      return;
    }
    
    // 订阅API端点
    if (pathname === '/api/subscribe') {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            console.log(`[${new Date().toISOString()}] [INFO] 订阅请求: 姓名=${data.name}, 手机=${data.phone}`);
            
            // 将订阅信息保存到文件
            const subscribeData = {
              name: data.name,
              phone: data.phone,
              time: new Date().toISOString()
            };
            
            const subscriptionsFile = path.join(__dirname, 'subscriptions.json');
            let subscriptions = [];
            
            // 尝试读取现有数据
            try {
              if (fs.existsSync(subscriptionsFile)) {
                const fileContent = fs.readFileSync(subscriptionsFile, 'utf8');
                subscriptions = JSON.parse(fileContent);
              }
            } catch (err) {
              console.error(`[${new Date().toISOString()}] [ERROR] 读取订阅文件失败:`, err);
            }
            
            // 添加新订阅
            subscriptions.push(subscribeData);
            
            // 保存到文件
            fs.writeFileSync(subscriptionsFile, JSON.stringify(subscriptions, null, 2), 'utf8');
            
            // 返回成功
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
              code: 200,
              msg: '订阅成功',
              data: { time: subscribeData.time }
            }));
          } catch (error) {
            console.error(`[${new Date().toISOString()}] [ERROR] 订阅处理失败:`, error);
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ code: 400, msg: '订阅请求格式错误' }));
          }
        });
      } else {
        res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ code: 405, msg: '方法不允许' }));
      }
    } else {
      // 404 - 未找到的端点
      res.writeHead(404, { 'Content-Type': 'application/json;charset=utf-8' });
      res.end(JSON.stringify({ code: 404, msg: '接口不存在', result: null }));
    }
    
  } catch (error) {
    // 全局错误处理
    log(`服务器错误: ${error.message}`, 'error');
    log(`错误堆栈: ${error.stack}`, 'error');
    res.writeHead(500, { 'Content-Type': 'application/json;charset=utf-8' });
    res.end(JSON.stringify({ code: 500, msg: '服务器内部错误', error: error.message }));
  }
});

// 启动服务器
server.listen(config.port, config.host, () => {
  log(`API服务器运行在 http://${config.host}:${config.port}/`, 'info');
  log('可用地址:', 'info');
  log(`- 测试界面: http://localhost:${config.port}/`, 'info');
  log('可用API:', 'info');
  log(`- 健康检查: http://localhost:${config.port}/api`, 'info');
  log(`- 失信查询: http://localhost:${config.port}/api/shixin?name=王博&idcard=620102198705150317`, 'info');
  log(`- 转网查询: http://localhost:${config.port}/api/phone/transfer?mobile=13800138000`, 'info');
  log(`- 空号检测: http://localhost:${config.port}/api/phone/status?mobile=13800138000`, 'info');
  log(`- 在网状态: http://localhost:${config.port}/api/phone/online?mobile=13800138000`, 'info');
  
  log('服务器启动成功！', 'info');
}); 