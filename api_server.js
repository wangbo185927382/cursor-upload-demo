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
            max-width: 1200px;
            margin: 20px auto;
            background-color: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            padding: 30px;
            position: relative;
            overflow: hidden;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            position: relative;
        }
        .header:after {
            content: '';
            display: block;
            width: 100px;
            height: 4px;
            background: linear-gradient(90deg, #1890ff, #39bbdb);
            margin: 15px auto 0;
            border-radius: 2px;
        }
        h1 {
            color: #1890ff;
            font-size: 32px;
            margin: 0;
            font-weight: 600;
        }
        .subtitle {
            color: #888;
            margin-top: 10px;
            font-size: 16px;
        }
        .tabs {
            display: flex;
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 5px;
            margin-bottom: 30px;
            position: relative;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            border: 1px solid #eee;
        }
        .tab {
            flex: 1;
            padding: 12px 20px;
            text-align: center;
            cursor: pointer;
            border-radius: 6px;
            font-weight: 500;
            color: #666;
            transition: all 0.3s ease;
            position: relative;
            z-index: 1;
        }
        .tab.active {
            color: #1890ff;
            background-color: #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .tab:hover:not(.active) {
            background-color: rgba(24, 144, 255, 0.05);
            color: #1890ff;
        }
        .tab-content {
            display: none;
            animation: fadeIn 0.5s;
        }
        .tab-content.active {
            display: block;
        }
        .api-section {
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
            padding: 25px;
            border: 1px solid #eee;
        }
        .api-section h2 {
            margin-top: 0;
            color: #1890ff;
            font-size: 22px;
            font-weight: 600;
            margin-bottom: 20px;
            position: relative;
            padding-left: 15px;
        }
        .api-section h2:before {
            content: '';
            position: absolute;
            left: 0;
            top: 5px;
            height: 18px;
            width: 4px;
            background: linear-gradient(180deg, #1890ff, #39bbdb);
            border-radius: 2px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #555;
            font-size: 15px;
        }
        input[type="text"], textarea {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-sizing: border-box;
            font-size: 15px;
            transition: all 0.3s;
        }
        textarea {
            min-height: 120px;
            resize: vertical;
            font-family: 'Microsoft YaHei', Arial, sans-serif;
        }
        input[type="text"]:focus, textarea:focus {
            border-color: #1890ff;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
            outline: none;
        }
        input[type="text"]:hover, textarea:hover {
            border-color: #40a9ff;
        }
        button {
            background: linear-gradient(90deg, #1890ff, #39bbdb);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
        }
        button:hover {
            background: linear-gradient(90deg, #40a9ff, #5ac8e8);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(24, 144, 255, 0.25);
        }
        button:active {
            transform: translateY(1px);
        }
        .result-container {
            margin-top: 25px;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            border: 1px solid #eee;
        }
        .result-header {
            padding: 12px 15px;
            background-color: #f5f7fa;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .result-title {
            font-weight: 600;
            color: #555;
            font-size: 14px;
        }
        .status {
            font-size: 13px;
            color: #888;
            background-color: #f0f0f0;
            padding: 3px 10px;
            border-radius: 12px;
        }
        .result {
            padding: 20px;
            background-color: #fafafa;
            border-radius: 0 0 10px 10px;
            min-height: 120px;
            overflow-x: auto;
        }
        .result pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 14px;
            line-height: 1.5;
            color: #333;
        }
        .mode-switch {
            display: flex;
            margin-bottom: 20px;
            background-color: #f0f2f5;
            border-radius: 8px;
            padding: 5px;
            border: 1px solid #eee;
        }
        .mode-option {
            flex: 1;
            text-align: center;
            padding: 10px 0;
            cursor: pointer;
            border-radius: 4px;
            font-weight: 500;
            color: #666;
            transition: all 0.3s;
        }
        .mode-option.active {
            background-color: #fff;
            color: #1890ff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .mode-content {
            display: none;
        }
        .mode-content.active {
            display: block;
        }
        .batch-result-item {
            margin-bottom: 10px;
            border-left: 3px solid #1890ff;
            padding-left: 10px;
            background-color: #fff;
            border-radius: 4px;
            padding: 10px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .batch-result-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-weight: 500;
            color: #333;
            font-size: 14px;
        }
        .batch-result-content {
            font-size: 13px;
            color: #666;
        }
        .batch-summary {
            margin-top: 15px;
            background-color: #fafbfc;
            padding: 10px;
            border-radius: 4px;
            font-size: 13px;
            color: #666;
        }
        .input-mode-switch {
            display: flex;
            margin-bottom: 15px;
            background: #f5f7fa;
            border-radius: 6px;
            padding: 3px;
            width: 240px;
        }
        .input-mode {
            flex: 1;
            text-align: center;
            padding: 8px 0;
            cursor: pointer;
            border-radius: 4px;
            font-size: 14px;
            color: #666;
            transition: all 0.2s;
        }
        .input-mode.active {
            background: #fff;
            color: #1890ff;
            box-shadow: 0 2px 6px rgba(24, 144, 255, 0.1);
        }
        .batch-input {
            display: none;
        }
        .batch-input.active {
            display: block;
        }
        .single-input.active {
            display: block;
        }
        /* 美化查询结果样式 */
        .pretty-result {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            background-color: #fff;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .result-row {
            display: flex;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #f0f0f0;
        }
        .result-row:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }
        .result-label {
            width: 100px;
            color: #888;
            font-size: 14px;
        }
        .result-value {
            flex: 1;
            font-size: 14px;
            font-weight: 500;
        }
        .result-footer {
            display: flex;
            justify-content: space-between;
            color: #888;
            font-size: 12px;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px dashed #eee;
        }
        .result-code {
            color: #999;
        }
        .result-time {
            color: #999;
        }
        .error-result {
            color: #ff4d4f;
            padding: 10px;
            background-color: #fff2f0;
            border-radius: 4px;
            border-left: 3px solid #ff4d4f;
        }
        .batch-result-item {
            padding: 12px;
            background-color: #fff;
            border-radius: 6px;
            margin-bottom: 8px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.03);
            border: 1px solid #f0f0f0;
        }
        .batch-result-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-weight: 500;
        }
        .batch-time {
            font-size: 12px;
            color: #999;
            margin-top: 3px;
        }
        .batch-status {
            font-weight: bold;
        }
        .batch-error {
            background-color: #fff9f9;
            border-left: 3px solid #ff4d4f;
        }
        .error-message {
            color: #ff4d4f;
        }
        .summary-title {
            font-weight: bold;
            margin-bottom: 5px;
            color: #333;
        }
        .summary-stats {
            display: flex;
            gap: 15px;
        }
        .stat-item {
            font-size: 13px;
        }
        .stat-item span {
            font-weight: bold;
        }
        .stat-item.success span {
            color: #52c41a;
        }
        .stat-item.error span {
            color: #ff4d4f;
        }
        /* 介绍横幅样式 */
        .intro-banner {
            background-color: #f5f9ff;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
            border-left: 4px solid #1890ff;
            box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
        }
        .intro-text {
            color: #555;
            font-size: 15px;
            line-height: 1.6;
        }
        /* 订阅部分样式 */
        .subscription-container {
            max-width: 1200px;
            margin: 40px auto;
            background: linear-gradient(135deg, #f5f9ff 0%, #ecf6ff 100%);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            padding: 30px;
            text-align: center;
        }
        .subscription-content {
            max-width: 600px;
            margin: 0 auto;
        }
        .subscription-header {
            margin-bottom: 30px;
        }
        .subscription-header h2 {
            color: #1890ff;
            margin-bottom: 10px;
        }
        .subscription-header p {
            color: #666;
            font-size: 14px;
        }
        .subscription-form {
            text-align: left;
            background-color: #fff;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .subscription-form .form-group {
            margin-bottom: 20px;
        }
        .subscription-form label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #555;
        }
        .subscription-form input[type="text"] {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-sizing: border-box;
            font-size: 15px;
            transition: all 0.3s;
        }
        .subscription-form input[type="text"]:focus {
            border-color: #1890ff;
            box-shadow: 0 0 0 2px rgba(24,144,255,0.2);
            outline: none;
        }
        .subscription-form button {
            width: 100%;
            margin-top: 10px;
        }
        .subscription-result {
            margin-top: 15px;
            padding: 10px;
            border-radius: 6px;
            font-size: 14px;
            display: none;
        }
        .subscription-result.success {
            display: block;
            background-color: #f6ffed;
            color: #52c41a;
            border: 1px solid #b7eb8f;
        }
        .subscription-result.error {
            display: block;
            background-color: #fff2f0;
            color: #ff4d4f;
            border: 1px solid #ffccc7;
        }
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(5px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @media (max-width: 768px) {
            .container {
                margin: 10px;
                padding: 20px;
            }
            .tabs {
                flex-wrap: wrap;
            }
            .tab {
                padding: 10px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>查风险</h1>
            <div class="subtitle">综合风险查询平台</div>
        </div>
        
        <div class="intro-banner">
            <div class="intro-text">
                <p>一站式风险查询平台，提供手机转网查询、空号检测、在网状态以及失信人信息查询服务，帮助企业和个人规避通信和信用风险。</p>
            </div>
        </div>
        
        <div class="tabs">
            <div class="tab active" onclick="openTab('tab1')">手机号转网查询</div>
            <div class="tab" onclick="openTab('tab2')">空号检测</div>
            <div class="tab" onclick="openTab('tab3')">在网状态查询</div>
            <div class="tab" onclick="openTab('tab4')">失信人查询</div>
        </div>
        
        <div id="tab1" class="tab-content active">
            <div class="api-section">
                <h2>手机号转网查询</h2>
                
                <div class="input-mode-switch">
                    <div class="input-mode active" onclick="switchInputMode('single1', 'batch1')">单个查询</div>
                    <div class="input-mode" onclick="switchInputMode('batch1', 'single1')">批量查询</div>
                </div>
                
                <div id="single1" class="single-input active">
                    <div class="form-group">
                        <label for="mobile1">手机号码：</label>
                        <input type="text" id="mobile1" placeholder="请输入手机号码" value="13800138000">
                    </div>
                    <button onclick="checkTransfer()">查询</button>
                </div>
                
                <div id="batch1" class="batch-input">
                    <div class="form-group">
                        <label for="batch-mobile-transfer">手机号码列表（每行一个）：</label>
                        <textarea id="batch-mobile-transfer" placeholder="请输入手机号码，每行一个">13800138000
13900139000
13700137000</textarea>
                    </div>
                    <button onclick="batchCheck('transfer')">批量查询</button>
                </div>
                
                <div class="result-container">
                    <div class="result-header">
                        <div class="result-title">查询结果</div>
                        <div class="status" id="status1">等待查询...</div>
                    </div>
                    <div class="result">
                        <div id="batch-result-transfer" style="display: none;"></div>
                        <pre id="result1">查询结果将显示在这里...</pre>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="tab2" class="tab-content">
            <div class="api-section">
                <h2>空号检测</h2>
                
                <div class="input-mode-switch">
                    <div class="input-mode active" onclick="switchInputMode('single2', 'batch2')">单个查询</div>
                    <div class="input-mode" onclick="switchInputMode('batch2', 'single2')">批量查询</div>
                </div>
                
                <div id="single2" class="single-input active">
                    <div class="form-group">
                        <label for="mobile2">手机号码：</label>
                        <input type="text" id="mobile2" placeholder="请输入手机号码" value="13800138000">
                    </div>
                    <button onclick="checkStatus()">查询</button>
                </div>
                
                <div id="batch2" class="batch-input">
                    <div class="form-group">
                        <label for="batch-mobile-status">手机号码列表（每行一个）：</label>
                        <textarea id="batch-mobile-status" placeholder="请输入手机号码，每行一个">13800138000
13900139000
13700137000</textarea>
                    </div>
                    <button onclick="batchCheck('status')">批量查询</button>
                </div>
                
                <div class="result-container">
                    <div class="result-header">
                        <div class="result-title">查询结果</div>
                        <div class="status" id="status2">等待查询...</div>
                    </div>
                    <div class="result">
                        <div id="batch-result-status" style="display: none;"></div>
                        <pre id="result2">查询结果将显示在这里...</pre>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="tab3" class="tab-content">
            <div class="api-section">
                <h2>在网状态查询</h2>
                
                <div class="input-mode-switch">
                    <div class="input-mode active" onclick="switchInputMode('single3', 'batch3')">单个查询</div>
                    <div class="input-mode" onclick="switchInputMode('batch3', 'single3')">批量查询</div>
                </div>
                
                <div id="single3" class="single-input active">
                    <div class="form-group">
                        <label for="mobile3">手机号码：</label>
                        <input type="text" id="mobile3" placeholder="请输入手机号码" value="13800138000">
                    </div>
                    <button onclick="checkOnline()">查询</button>
                </div>
                
                <div id="batch3" class="batch-input">
                    <div class="form-group">
                        <label for="batch-mobile-online">手机号码列表（每行一个）：</label>
                        <textarea id="batch-mobile-online" placeholder="请输入手机号码，每行一个">13800138000
13900139000
13700137000</textarea>
                    </div>
                    <button onclick="batchCheck('online')">批量查询</button>
                </div>
                
                <div class="result-container">
                    <div class="result-header">
                        <div class="result-title">查询结果</div>
                        <div class="status" id="status3">等待查询...</div>
                    </div>
                    <div class="result">
                        <div id="batch-result-online" style="display: none;"></div>
                        <pre id="result3">查询结果将显示在这里...</pre>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="tab4" class="tab-content">
            <div class="api-section">
                <h2>失信人查询</h2>
                <div class="form-group">
                    <label for="name">姓名：</label>
                    <input type="text" id="name" placeholder="请输入姓名" value="王博">
                </div>
                <div class="form-group">
                    <label for="idcard">身份证号码：</label>
                    <input type="text" id="idcard" placeholder="请输入身份证号码" value="620102198705150317">
                </div>
                <button onclick="checkShixin()">查询</button>
                <div class="result-container">
                    <div class="result-header">
                        <div class="result-title">查询结果</div>
                        <div class="status" id="status4">等待查询...</div>
                    </div>
                    <div class="result">
                        <pre id="result4">查询结果将显示在这里...</pre>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="subscription-container">
        <div class="subscription-content">
            <div class="subscription-header">
                <h2>订阅我们的服务</h2>
                <p>留下您的联系方式，获取更多查询次数和专业服务</p>
            </div>
            <div class="subscription-form">
                <div class="form-group">
                    <label for="subscribe-name">姓名</label>
                    <input type="text" id="subscribe-name" placeholder="请输入您的姓名">
                </div>
                <div class="form-group">
                    <label for="subscribe-phone">手机号码</label>
                    <input type="text" id="subscribe-phone" placeholder="请输入您的手机号码">
                </div>
                <button onclick="submitSubscription()">立即订阅</button>
                <div class="subscription-result" id="subscription-result"></div>
            </div>
        </div>
    </div>

    <script>
        function openTab(tabId) {
            // 隐藏所有标签内容
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // 移除所有标签的活动状态
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // 显示选中的标签内容
            document.getElementById(tabId).classList.add('active');
            
            // 设置选中标签的活动状态
            event.currentTarget.classList.add('active');
        }
        
        function switchInputMode(activeId, inactiveId) {
            document.getElementById(activeId).classList.add('active');
            document.getElementById(inactiveId).classList.remove('active');
            
            // 切换结果区域显示
            if (activeId.startsWith('batch')) {
                document.getElementById('result' + activeId.charAt(5)).style.display = 'none';
                document.getElementById('batch-result-' + (activeId === 'batch1' ? 'transfer' : activeId === 'batch2' ? 'status' : 'online')).style.display = 'block';
            } else {
                document.getElementById('result' + activeId.charAt(6)).style.display = 'block';
                document.getElementById('batch-result-' + (inactiveId === 'batch1' ? 'transfer' : inactiveId === 'batch2' ? 'status' : 'online')).style.display = 'none';
            }
            
            // 切换激活状态
            const options = event.currentTarget.parentElement.querySelectorAll('.input-mode');
            options.forEach(option => option.classList.remove('active'));
            event.currentTarget.classList.add('active');
        }
        
        function formatJSON(json) {
            try {
                // 针对不同类型的API结果设计更优美的展示
                if (json && json.result) {
                    if (json.result.mobile) {
                        // 手机号相关查询结果的美化
                        const typeColor = json.result.type === '已转网' ? '#ff4d4f' : '#52c41a';
                        const statusColors = {
                            '正常': '#52c41a',
                            '空号': '#ff4d4f', 
                            '停机': '#faad14',
                            '库无': '#bfbfbf'
                        };
                        const statusColor = statusColors[json.result.status] || '#333';
                        const onlineColor = json.result.status === '在网' ? '#52c41a' : '#ff4d4f';
                        
                        // 根据查询类型构建不同的结果HTML
                        let resultHTML = '';
                        
                        // 公共头部 - 手机号
                        resultHTML += '<div class="pretty-result">';
                        resultHTML += '<div class="result-row">';
                        resultHTML += '<div class="result-label">手机号码:</div>';
                        resultHTML += '<div class="result-value">' + json.result.mobile + '</div>';
                        resultHTML += '</div>';
                        
                        // 转网查询结果
                        if (json.result.type !== undefined) {
                            resultHTML += '<div class="result-row">';
                            resultHTML += '<div class="result-label">转网状态:</div>';
                            resultHTML += '<div class="result-value" style="color: ' + typeColor + '; font-weight: bold;">' + json.result.type + '</div>';
                            resultHTML += '</div>';
                            resultHTML += '<div class="result-row">';
                            resultHTML += '<div class="result-label">运营商:</div>';
                            resultHTML += '<div class="result-value">' + (json.result.carrier || '未知') + '</div>';
                            resultHTML += '</div>';
                        }
                        
                        // 空号检测结果
                        if (json.result.status !== undefined && !json.result.type) {
                            resultHTML += '<div class="result-row">';
                            resultHTML += '<div class="result-label">号码状态:</div>';
                            resultHTML += '<div class="result-value" style="color: ' + statusColor + '; font-weight: bold;">' + json.result.status + '</div>';
                            resultHTML += '</div>';
                        }
                        
                        // 在线状态结果
                        if (json.result.status === '在网' || json.result.status === '不在网') {
                            resultHTML += '<div class="result-row">';
                            resultHTML += '<div class="result-label">在网状态:</div>';
                            resultHTML += '<div class="result-value" style="color: ' + onlineColor + '; font-weight: bold;">' + json.result.status + '</div>';
                            resultHTML += '</div>';
                        }
                        
                        // 底部状态信息
                        resultHTML += '<div class="result-row result-footer">';
                        resultHTML += '<div class="result-code">状态码: ' + json.code + '</div>';
                        resultHTML += '<div class="result-time">' + new Date().toLocaleTimeString() + '</div>';
                        resultHTML += '</div>';
                        resultHTML += '</div>';
                        
                        return resultHTML;
                    } else if (json.result.name && json.result.idcard) {
                        // 失信人查询结果的美化
                        const isShixinColor = json.result.isShixin ? '#ff4d4f' : '#52c41a';
                        const isShixinText = json.result.isShixin ? '是' : '否';
                        
                        let resultHTML = '';
                        resultHTML += '<div class="pretty-result">';
                        resultHTML += '<div class="result-row">';
                        resultHTML += '<div class="result-label">姓名:</div>';
                        resultHTML += '<div class="result-value">' + json.result.name + '</div>';
                        resultHTML += '</div>';
                        resultHTML += '<div class="result-row">';
                        resultHTML += '<div class="result-label">身份证:</div>';
                        resultHTML += '<div class="result-value">' + json.result.idcard + '</div>';
                        resultHTML += '</div>';
                        resultHTML += '<div class="result-row">';
                        resultHTML += '<div class="result-label">是否失信:</div>';
                        resultHTML += '<div class="result-value" style="color: ' + isShixinColor + '; font-weight: bold;">' + isShixinText + '</div>';
                        resultHTML += '</div>';
                        resultHTML += '<div class="result-row">';
                        resultHTML += '<div class="result-label">失信次数:</div>';
                        resultHTML += '<div class="result-value">' + (json.result.count || 0) + '</div>';
                        resultHTML += '</div>';
                        resultHTML += '<div class="result-row result-footer">';
                        resultHTML += '<div class="result-code">状态码: ' + json.code + '</div>';
                        resultHTML += '<div class="result-time">' + new Date().toLocaleTimeString() + '</div>';
                        resultHTML += '</div>';
                        resultHTML += '</div>';
                        
                        return resultHTML;
                    }
                }
                
                // 如果不是特定格式的结果，则返回格式化的JSON
                return '<pre>' + JSON.stringify(json, null, 2) + '</pre>';
            } catch (e) {
                return '<pre>' + JSON.stringify(json, null, 2) + '</pre>';
            }
        }
        
        async function makeAPICall(url, statusElement, resultElement) {
            statusElement.textContent = "正在查询...";
            statusElement.style.backgroundColor = "#e6f7ff";
            statusElement.style.color = "#1890ff";
            
            try {
                const startTime = new Date().getTime();
                const response = await fetch(url);
                const endTime = new Date().getTime();
                const data = await response.json();
                
                // 使用HTML方式设置结果
                resultElement.innerHTML = formatJSON(data);
                statusElement.textContent = `查询完成，耗时 ${endTime - startTime} 毫秒`;
                statusElement.style.backgroundColor = "#f6ffed";
                statusElement.style.color = "#52c41a";
                
                return data;
            } catch (error) {
                resultElement.innerHTML = `<div class="error-result">查询出错: ${error.message}</div>`;
                statusElement.textContent = "查询失败";
                statusElement.style.backgroundColor = "#fff2f0";
                statusElement.style.color = "#f5222d";
                return null;
            }
        }
        
        async function checkTransfer() {
            const mobile = document.getElementById('mobile1').value;
            if (!mobile) {
                document.getElementById('result1').textContent = "请输入手机号码";
                document.getElementById('status1').textContent = "未输入手机号";
                document.getElementById('status1').style.backgroundColor = "#fff2e8";
                document.getElementById('status1').style.color = "#fa8c16";
                return;
            }
            
            const url = `http://localhost:9090/api/phone/transfer?mobile=${encodeURIComponent(mobile)}`;
            await makeAPICall(url, document.getElementById('status1'), document.getElementById('result1'));
        }
        
        async function checkStatus() {
            const mobile = document.getElementById('mobile2').value;
            if (!mobile) {
                document.getElementById('result2').textContent = "请输入手机号码";
                document.getElementById('status2').textContent = "未输入手机号";
                document.getElementById('status2').style.backgroundColor = "#fff2e8";
                document.getElementById('status2').style.color = "#fa8c16";
                return;
            }
            
            const url = `http://localhost:9090/api/phone/status?mobile=${encodeURIComponent(mobile)}`;
            await makeAPICall(url, document.getElementById('status2'), document.getElementById('result2'));
        }
        
        async function checkOnline() {
            const mobile = document.getElementById('mobile3').value;
            if (!mobile) {
                document.getElementById('result3').textContent = "请输入手机号码";
                document.getElementById('status3').textContent = "未输入手机号";
                document.getElementById('status3').style.backgroundColor = "#fff2e8";
                document.getElementById('status3').style.color = "#fa8c16";
                return;
            }
            
            const url = `http://localhost:9090/api/phone/online?mobile=${encodeURIComponent(mobile)}`;
            await makeAPICall(url, document.getElementById('status3'), document.getElementById('result3'));
        }
        
        async function checkShixin() {
            const name = document.getElementById('name').value;
            const idcard = document.getElementById('idcard').value;
            
            if (!name || !idcard) {
                document.getElementById('result4').textContent = "请输入姓名和身份证号码";
                document.getElementById('status4').textContent = "信息不完整";
                document.getElementById('status4').style.backgroundColor = "#fff2e8";
                document.getElementById('status4').style.color = "#fa8c16";
                return;
            }
            
            const url = `http://localhost:9090/api/shixin?name=${encodeURIComponent(name)}&idcard=${encodeURIComponent(idcard)}`;
            await makeAPICall(url, document.getElementById('status4'), document.getElementById('result4'));
        }
        
        async function batchCheck(type) {
            const textarea = document.getElementById(`batch-mobile-${type}`);
            const resultDiv = document.getElementById(`batch-result-${type}`);
            const statusElement = document.getElementById(`status${type === 'transfer' ? '1' : type === 'status' ? '2' : '3'}`);
            
            // 获取手机号列表
            const mobilesText = textarea.value.trim();
            if (!mobilesText) {
                resultDiv.innerHTML = "<div class='error-result'>请输入至少一个手机号码</div>";
                statusElement.textContent = "未输入手机号";
                statusElement.style.backgroundColor = "#fff2e8";
                statusElement.style.color = "#fa8c16";
                return;
            }
            
            const mobiles = mobilesText.split('\n').filter(mobile => mobile.trim());
            if (mobiles.length === 0) {
                resultDiv.innerHTML = "<div class='error-result'>请输入至少一个有效的手机号码</div>";
                statusElement.textContent = "无有效手机号";
                statusElement.style.backgroundColor = "#fff2e8";
                statusElement.style.color = "#fa8c16";
                return;
            }
            
            // 更新状态
            statusElement.textContent = `批量查询中 (0/${mobiles.length})`;
            statusElement.style.backgroundColor = "#e6f7ff";
            statusElement.style.color = "#1890ff";
            
            // 清空结果区域
            resultDiv.innerHTML = "";
            
            // 创建结果容器
            const results = [];
            let successCount = 0;
            
            // 依次查询每个手机号
            for (let i = 0; i < mobiles.length; i++) {
                const mobile = mobiles[i].trim();
                if (!mobile) continue;
                
                statusElement.textContent = `批量查询中 (${i + 1}/${mobiles.length})`;
                
                // 构建API URL
                const apiUrl = `http://localhost:9090/api/phone/${type}?mobile=${encodeURIComponent(mobile)}`;
                
                try {
                    const startTime = new Date().getTime();
                    const response = await fetch(apiUrl);
                    const endTime = new Date().getTime();
                    const data = await response.json();
                    
                    successCount++;
                    
                    // 添加结果
                    results.push({
                        mobile,
                        success: true,
                        data,
                        time: endTime - startTime
                    });
                    
                    // 添加到结果显示区域
                    let statusDisplay = '';
                    let statusColor = '#333';
                    
                    if (type === 'transfer') {
                        statusDisplay = data.result.type || '未知';
                        statusColor = data.result.type === '已转网' ? '#ff4d4f' : '#52c41a';
                    } else if (type === 'status') {
                        statusDisplay = data.result.status || '未知';
                        statusColor = data.result.status === '正常' ? '#52c41a' : 
                                      data.result.status === '空号' ? '#ff4d4f' : 
                                      data.result.status === '停机' ? '#faad14' : '#bfbfbf';
                    } else if (type === 'online') {
                        statusDisplay = data.result.status || '未知';
                        statusColor = data.result.status === '在网' ? '#52c41a' : '#ff4d4f';
                    }
                    
                    // 创建更简洁的结果项
                    const resultItem = document.createElement('div');
                    resultItem.className = 'batch-result-item';
                    resultItem.innerHTML = `
                        <div class="batch-result-header">
                            <div>${mobile}</div>
                            <div class="batch-status" style="color: ${statusColor};">${statusDisplay}</div>
                        </div>
                        <div class="batch-time">${endTime - startTime}ms</div>
                    `;
                    resultDiv.appendChild(resultItem);
                } catch (error) {
                    // 添加错误结果
                    results.push({
                        mobile,
                        success: false,
                        error: error.message
                    });
                    
                    // 添加到结果显示区域
                    const resultItem = document.createElement('div');
                    resultItem.className = 'batch-result-item batch-error';
                    resultItem.innerHTML = `
                        <div class="batch-result-header">
                            <div>${mobile}</div>
                            <div style="color: #f5222d;">查询失败</div>
                        </div>
                        <div class="batch-time error-message">错误: ${error.message}</div>
                    `;
                    resultDiv.appendChild(resultItem);
                }
            }
            
            // 添加汇总信息
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'batch-summary';
            summaryDiv.innerHTML = `
                <div class="summary-title">批量查询完成</div>
                <div class="summary-stats">
                    <div class="stat-item">总计: <span>${mobiles.length}</span></div>
                    <div class="stat-item success">成功: <span>${successCount}</span></div>
                    <div class="stat-item error">失败: <span>${mobiles.length - successCount}</span></div>
                </div>
            `;
            resultDiv.appendChild(summaryDiv);
            
            // 更新状态
            statusElement.textContent = `查询完成，成功 ${successCount}，失败 ${mobiles.length - successCount}`;
            if (successCount === mobiles.length) {
                statusElement.style.backgroundColor = "#f6ffed";
                statusElement.style.color = "#52c41a";
            } else if (successCount === 0) {
                statusElement.style.backgroundColor = "#fff2f0";
                statusElement.style.color = "#f5222d";
            } else {
                statusElement.style.backgroundColor = "#fff7e6";
                statusElement.style.color = "#fa8c16";
            }
        }
        
        // 初始化时自动执行一次查询
        window.onload = function() {
            // 自动执行转网查询
            checkTransfer();
        };
        
        // 订阅功能
        function submitSubscription() {
            const name = document.getElementById('subscribe-name').value.trim();
            const phone = document.getElementById('subscribe-phone').value.trim();
            const resultElement = document.getElementById('subscription-result');
            
            // 验证输入
            if (!name) {
                resultElement.textContent = "请输入您的姓名";
                resultElement.className = "subscription-result error";
                return;
            }
            
            if (!phone) {
                resultElement.textContent = "请输入您的手机号码";
                resultElement.className = "subscription-result error";
                return;
            }
            
            // 简单的手机号验证
            const phoneRegex = /^1[3-9]\d{9}$/;
            if (!phoneRegex.test(phone)) {
                resultElement.textContent = "请输入有效的手机号码";
                resultElement.className = "subscription-result error";
                return;
            }
            
            // 发送订阅请求
            fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, phone })
            })
            .then(response => response.json())
            .then(data => {
                if (data.code === 200) {
                    resultElement.textContent = "订阅成功！我们会尽快与您联系";
                    resultElement.className = "subscription-result success";
                    // 清空输入
                    document.getElementById('subscribe-name').value = '';
                    document.getElementById('subscribe-phone').value = '';
                } else {
                    resultElement.textContent = data.msg || "订阅失败，请稍后再试";
                    resultElement.className = "subscription-result error";
                }
            })
            .catch(error => {
                resultElement.textContent = "网络错误，请稍后再试";
                resultElement.className = "subscription-result error";
                console.error('订阅错误:', error);
            });
        }
    </script>
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