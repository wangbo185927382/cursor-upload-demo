// 失信人查询代理函数
exports.handler = async function(event, context) {
  // 记录函数调用
  console.log('失信人查询函数被调用', event.httpMethod);
  
  // 处理OPTIONS请求(CORS预检)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  // 只允许POST请求
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "只支持POST请求" }) 
    };
  }

  try {
    // 解析请求体
    const requestBody = JSON.parse(event.body);
    const { name, idCard } = requestBody;
    
    console.log('接收到失信查询请求:', { name, idCard });
    
    if (!name || !idCard) {
      return { 
        statusCode: 400, 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "请提供姓名和身份证号" }) 
      };
    }

    // 基于身份证尾号判断是否失信
    const lastDigit = idCard.slice(-1);
    const isShixin = ["1", "3", "5", "7", "9"].includes(lastDigit);
    
    const responseData = {
      code: 200,
      message: "success",
      data: isShixin ? {
        name: name,
        idNumber: idCard,
        court: "某法院",
        filingDate: "2023-05-15",
        duty: "失信记录"
      } : null
    };
    
    console.log('失信查询结果:', responseData);
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(responseData)
    };
  } catch (error) {
    console.error('失信查询出错:', error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "服务器内部错误", details: error.message })
    };
  }
}; 