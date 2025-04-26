/**
 * API服务器配置文件
 */
module.exports = {
  // 服务器配置
  server: {
    port: 9090,
    host: '0.0.0.0'
  },
  
  // API密钥
  apiKeys: {
    alicloud: 'your_alicloud_api_key' // 替换为您的实际API密钥
  },
  
  // 日志配置
  logging: {
    level: 'info', // 日志级别: debug, info, warn, error
    directory: 'logs',
    maxFiles: 10, // 最大日志文件数
    maxSize: '10m' // 单个日志文件最大大小
  },
  
  // API端点配置
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
    },
    shixin: {
      url: 'https://api.example.com/shixin/query',
      method: 'GET'
    }
  }
}; 