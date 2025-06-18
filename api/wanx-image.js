// Vercel API路由 - 通义万相图像生成代理
// 解决前端CORS限制问题

export default async function handler(req, res) {
  // 设置CORS头，允许跨域访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-DashScope-Async');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只允许POST请求
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // 从请求头中获取API Key
    const { authorization } = req.headers;
    const apiKey = authorization?.replace('Bearer ', '');

    if (!apiKey) {
      res.status(401).json({ error: 'Missing API key' });
      return;
    }

    // 验证请求体中的必需字段
    const { model, input, parameters } = req.body;
    if (!model || !input) {
      res.status(400).json({ error: 'Missing required fields: model, input' });
      return;
    }

    // 构造通义万相API请求
    const wanxUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';
    
    const requestHeaders = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable'
    };

    console.log('代理通义万相请求:', {
      url: wanxUrl,
      headers: requestHeaders,
      body: req.body
    });

    // 发送请求到通义万相API
    const response = await fetch(wanxUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(req.body)
    });

    console.log('通义万相响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('通义万相API错误:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      res.status(response.status).json({
        error: 'Wanx API error',
        details: errorText,
        status: response.status
      });
      return;
    }

    const data = await response.json();
    console.log('通义万相响应数据:', data);

    // 转发响应数据
    res.status(200).json(data);

  } catch (error) {
    console.error('代理服务器错误:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
} 