const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HEALTH_URL = `http://127.0.0.1:${PORT}/`;

// Gọi health endpoint để kiểm tra server đã chạy và trả dữ liệu đúng chưa.
function checkHealth() {
  return new Promise((resolve, reject) => {
    const req = http.get(HEALTH_URL, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ statusCode: res.statusCode, body: json });
        } catch (error) {
          reject(new Error(`Phản hồi không hợp lệ từ server: ${body}`));
        }
      });
    });

    req.on('error', reject);
  });
}

// Chờ server khởi động xong rồi mới kết luận test pass/fail.
async function waitForServer(maxRetries = 20, delayMs = 1500) {
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const result = await checkHealth();
      if (result.statusCode === 200 && result.body.status === 'OK') {
        return result;
      }
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error('Server không sẵn sàng trong thời gian cho phép');
}

async function run() {
  const server = spawn(process.execPath, ['server.js'], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'test' },
    stdio: 'inherit',
  });

  try {
    const health = await waitForServer();
    console.log('✅ Smoke test passed:', health.body);
    server.kill();
    process.exit(0);
  } catch (error) {
    console.error('❌ Smoke test failed:', error.message);
    server.kill();
    process.exit(1);
  }
}

run();
