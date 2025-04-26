// 手机在网查询代理函数
exports.handler = async function(event, context) {
  try {
    // 只允许POST方法
    if (event.httpMethod !== "POST") {
      return { 
        statusCode: 405, 
        body: JSON.stringify({ error: "只支持POST请求" }) 
      };
    }

    // 解析请求体
    const requestBody = JSON.parse(event.body);
    const { phone } = requestBody;
    
    if (!phone) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "请提供手机号码" }) 
      };
    }

    // 设置API密钥和URL
    const API_KEY = "您的API密钥"; // 需要替换为真实的API密钥
    const API_URL = "https://api.example.com/phone"; // 需要替换为真实的API URL

    // 设置请求头
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    };

    // 构建请求体
    const apiRequestBody = {
      phoneNumber: phone
    };

    // 发送请求到真实API
    const response = await fetch(API_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(apiRequestBody)
    });

    // 获取API响应
    const data = await response.json();

    // 返回响应给前端
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.log("手机在网查询出错:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "服务器内部错误", details: error.message })
    };
  }
}; 