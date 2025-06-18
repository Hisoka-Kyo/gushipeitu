// Vercel API路由 - 火山引擎图像生成代理
// 解决前端CORS限制问题

export default async function handler(req, res) {
  // 设置CORS头，允许跨域访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
    const { model, prompt, response_format, size } = req.body;
    if (!model || !prompt || !response_format || !size) {
      res.status(400).json({ 
        error: 'Missing required fields: model, prompt, response_format, size' 
      });
      return;
    }

    console.log('代理图像生成请求:', {
      model,
      prompt: prompt.substring(0, 50) + '...',
      size,
      seed: req.body.seed,
      guidance_scale: req.body.guidance_scale
    });

    // 向火山引擎API发送请求
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('火山引擎API错误:', {
        status: response.status,
        data
      });
      res.status(response.status).json(data);
      return;
    }

    console.log('图像生成成功:', data.data?.[0]?.url ? '已生成' : '生成失败');
    res.status(200).json(data);

  } catch (error) {
    console.error('代理服务器错误:', error);
    res.status(500).json({ 
      error: {
        message: `代理服务器错误: ${error.message}`
      }
    });
  }
} 