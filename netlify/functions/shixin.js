const fetch = require("node-fetch"); // 添加在文件顶部

exports.handler = async function(event, context) {
  try {
    const phoneNumber = event.queryStringParameters.phoneNumber;
    
    // 简单测试响应，确认函数工作
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: "success",
        message: `测试成功，手机号: ${phoneNumber}`,
        phoneStatus: "测试数据",
        onlineDuration: 24
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// 手机在网查询
async function checkPhoneStatus(phoneNumber) {
  try {
    // 设置API密钥和URL
    const API_KEY = "您的API密钥"; // 需要替换为真实的API密钥
    const API_URL = "https://api.example.com/phone"; // 需要替换为真实的API URL
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone: phoneNumber })
    });
    
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('手机查询失败:', error);
    return { error: '查询失败' };
  }
} 