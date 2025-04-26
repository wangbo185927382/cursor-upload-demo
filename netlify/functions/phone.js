exports.handler = async function(event, context) {
  try {
    // 获取参数
    const phoneNumber = event.queryStringParameters.phoneNumber;
    console.log("调用手机查询API:", phoneNumber);
    
    // 这里替换为您的真实API调用
    const response = await fetch(`https://您的真实API地址?phoneNumber=${phoneNumber}`, {
      headers: {
        "Authorization": "您的API密钥",
        "Content-Type": "application/json"
      }
    });
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.log("API错误:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: "error", message: error.toString() })
    };
  }
}; 