const http = require('http');

const BASE_URL = 'http://localhost:3000';
let token = '';
let userId = '';
let branchId = '';
let tableId = '';

// Helper function để gửi request
function makeRequest(method, path, body = null, withAuth = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (withAuth && token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Log helper
function log(title, result) {
  console.log('\n' + '='.repeat(60));
  console.log(`📌 ${title}`);
  console.log('='.repeat(60));
  console.log(`Status: ${result.status}`);
  console.log('Response:', JSON.stringify(result.data, null, 2));
}

async function runTests() {
  try {
    // 1️⃣ Test GET branches (không cần auth)
    console.log('\n🚀 BƯỚC 1: Lấy danh sách chi nhánh (không cần auth)');
    let result = await makeRequest('GET', '/api/branches');
    log('GET /api/branches', result);

    // 2️⃣ Register user
    console.log('\n🚀 BƯỚC 2: Đăng ký user');
    result = await makeRequest('POST', '/api/auth/register', {
      fullName: 'Admin User',
      email: 'admin@test.com',
      password: '123456',
      phone: '0912345678'
    });
    log('POST /api/auth/register', result);

    // 3️⃣ Login
    console.log('\n🚀 BƯỚC 3: Đăng nhập');
    result = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@test.com',
      password: '123456'
    });
    log('POST /api/auth/login', result);

    if (result.data && result.data.data && result.data.data.token) {
      token = result.data.data.token;
      console.log(`✅ Token: ${token}`);
    } else {
      console.log('❌ Không lấy được token!');
      return;
    }

    // 4️⃣ Lấy thông tin user hiện tại
    console.log('\n🚀 BƯỚC 4: Lấy thông tin user (dùng token)');
    result = await makeRequest('GET', '/api/auth/me', null, true);
    log('GET /api/auth/me', result);

    if (result.data && result.data.data && result.data.data._id) {
      userId = result.data.data._id;
      console.log(`✅ User ID: ${userId}`);
    } else {
      console.log('❌ Không lấy được user ID!');
      return;
    }

    // 5️⃣ Tạo chi nhánh
    console.log('\n🚀 BƯỚC 5: Tạo chi nhánh');
    result = await makeRequest('POST', '/api/branches', {
      name: 'Chi nhánh Hà Nội',
      address: '123 Nguyễn Trãi, Hà Nội',
      phone: '0912345678',
      openTime: '07:00',
      closeTime: '23:00',
      manager: userId
    }, true);
    log('POST /api/branches', result);

    if (result.data && result.data.data && result.data.data._id) {
      branchId = result.data.data._id;
      console.log(`✅ Branch ID: ${branchId}`);
    } else {
      console.log('❌ Không tạo được chi nhánh!');
      return;
    }

    // 6️⃣ Lấy chi nhánh theo ID
    console.log('\n🚀 BƯỚC 6: Lấy chi nhánh theo ID');
    result = await makeRequest('GET', `/api/branches/${branchId}`, null, false);
    log(`GET /api/branches/${branchId}`, result);

    // 7️⃣ Cập nhật chi nhánh
    console.log('\n🚀 BƯỚC 7: Cập nhật chi nhánh');
    result = await makeRequest('PUT', `/api/branches/${branchId}`, {
      name: 'Chi nhánh Hà Nội - Updated',
      address: '456 Phạm Văn Đồng, Hà Nội',
      phone: '0987654321'
    }, true);
    log(`PUT /api/branches/${branchId}`, result);

    // 8️⃣ Tạo bàn 1
    console.log('\n🚀 BƯỚC 8: Tạo bàn số 1');
    result = await makeRequest('POST', '/api/tables', {
      tableNumber: 1,
      branch: branchId,
      capacity: 4,
      status: 'available',
      floor: 1,
      description: 'Bàn gần cửa sổ'
    }, true);
    log('POST /api/tables', result);

    if (result.data && result.data.data && result.data.data._id) {
      tableId = result.data.data._id;
      console.log(`✅ Table ID: ${tableId}`);
    } else {
      console.log('❌ Không tạo được bàn!');
      return;
    }

    // 9️⃣ Tạo bàn 2
    console.log('\n🚀 BƯỚC 9: Tạo bàn số 2');
    result = await makeRequest('POST', '/api/tables', {
      tableNumber: 2,
      branch: branchId,
      capacity: 6,
      status: 'available',
      floor: 1
    }, true);
    log('POST /api/tables (bàn 2)', result);

    // 🔟 Lấy danh sách bàn
    console.log('\n🚀 BƯỚC 10: Lấy danh sách bàn');
    result = await makeRequest('GET', `/api/tables?branch=${branchId}`, null, true);
    log(`GET /api/tables?branch=${branchId}`, result);

    // 1️⃣1️⃣ Lấy bàn theo ID
    console.log('\n🚀 BƯỚC 11: Lấy bàn theo ID');
    result = await makeRequest('GET', `/api/tables/${tableId}`, null, true);
    log(`GET /api/tables/${tableId}`, result);

    // 1️⃣2️⃣ Cập nhật trạng thái bàn
    console.log('\n🚀 BƯỚC 12: Cập nhật trạng thái bàn (occupied)');
    result = await makeRequest('PATCH', `/api/tables/${tableId}/status`, {
      status: 'occupied'
    }, true);
    log(`PATCH /api/tables/${tableId}/status`, result);

    // 1️⃣3️⃣ Cập nhật bàn
    console.log('\n🚀 BƯỚC 13: Cập nhật bàn');
    result = await makeRequest('PUT', `/api/tables/${tableId}`, {
      capacity: 8,
      floor: 2,
      description: 'Bàn VIP'
    }, true);
    log(`PUT /api/tables/${tableId}`, result);

    // 1️⃣4️⃣ Xóa bàn (soft delete)
    console.log('\n🚀 BƯỚC 14: Xóa bàn (soft delete)');
    result = await makeRequest('DELETE', `/api/tables/${tableId}`, null, true);
    log(`DELETE /api/tables/${tableId}`, result);

    // 1️⃣5️⃣ Xóa chi nhánh (soft delete)
    console.log('\n🚀 BƯỚC 15: Xóa chi nhánh (soft delete)');
    result = await makeRequest('DELETE', `/api/branches/${branchId}`, null, true);
    log(`DELETE /api/branches/${branchId}`, result);

    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST HOÀN THÀNH!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  }

  process.exit(0);
}

// Chạy tests
runTests();
