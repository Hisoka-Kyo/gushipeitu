// Vercel API路由 - 通义万相任务查询代理
// 解决前端查询任务状态时的CORS限制问题

export default async function handler(req, res) {
  // 设置CORS头，允许跨域访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只允许GET请求
  if (req.method !== 'GET') {
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

    // 从查询参数中获取任务ID
    const { taskId } = req.query;
    if (!taskId) {
      res.status(400).json({ error: 'Missing taskId parameter' });
      return;
    }

    // 构造通义万相任务查询API请求
    const queryUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
    
    const requestHeaders = {
      'Authorization': `Bearer ${apiKey}`
    };

    console.log('代理任务查询请求:', {
      url: queryUrl,
      headers: requestHeaders,
      taskId: taskId
    });

    // 发送请求到通义万相任务查询API
    const response = await fetch(queryUrl, {
      method: 'GET',
      headers: requestHeaders
    });

    console.log('任务查询响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('任务查询API错误:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      res.status(response.status).json({
        error: 'Task query API error',
        details: errorText,
        status: response.status
      });
      return;
    }

    const data = await response.json();
    console.log('任务查询响应数据:', data);

    // 转发响应数据
    res.status(200).json(data);

  } catch (error) {
    console.error('任务查询代理服务器错误:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
} 