// API Testing utilities for Syosetu API

class APITester {
  constructor() {
    this.baseURL = window.location.origin;
    this.resultContainer = null;
    this.isLoading = false;
  }

  // Initialize the API tester
  init() {
    this.resultContainer = document.getElementById('testResult');
    this.setupEventListeners();
    
    // Auto-test health endpoint on load
    setTimeout(() => {
      this.testEndpoint('/api/health');
    }, 1000);
  }

  // Setup event listeners for test buttons
  setupEventListeners() {
    // Add click handlers for test buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('test-btn')) {
        const endpoint = e.target.dataset.endpoint;
        if (endpoint) {
          this.testEndpoint(endpoint);
        }
      }
    });
  }

  // Test an API endpoint
  async testEndpoint(endpoint) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.showLoading(endpoint);
    
    try {
      const startTime = performance.now();
      const response = await fetch(`${this.baseURL}${endpoint}`);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      const data = await response.json();
      
      this.showResult({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        endpoint: endpoint,
        responseTime: responseTime,
        data: data,
        headers: Object.fromEntries(response.headers.entries())
      });
      
    } catch (error) {
      this.showError(endpoint, error);
    } finally {
      this.isLoading = false;
    }
  }

  // Show loading state
  showLoading(endpoint) {
    if (!this.resultContainer) return;
    
    this.resultContainer.classList.remove('hidden');
    this.resultContainer.innerHTML = `
      <div class="flex items-center text-yellow-400 mb-4">
        <div class="spinner mr-3"></div>
        <span class="font-semibold">Đang gọi API...</span>
      </div>
      <div class="text-gray-300">
        <span class="font-mono text-sm">📡 ${endpoint}</span>
      </div>
    `;
  }

  // Show successful result
  showResult(result) {
    if (!this.resultContainer) return;
    
    const statusColor = result.success ? 'text-green-400' : 'text-red-400';
    const statusIcon = result.success ? '✅' : '❌';
    
    this.resultContainer.innerHTML = `
      <div class="mb-4">
        <div class="${statusColor} font-semibold mb-2">
          ${statusIcon} ${result.status} ${result.statusText}
        </div>
        <div class="text-gray-300 text-sm space-y-1">
          <div>📡 <span class="font-mono">${result.endpoint}</span></div>
          <div>⏱️ Response time: <span class="text-yellow-400">${result.responseTime}ms</span></div>
          <div>📅 <span class="text-gray-400">${new Date().toLocaleString('vi-VN')}</span></div>
        </div>
      </div>
      
      <div class="mb-4">
        <div class="text-gray-300 font-semibold mb-2">📋 Response Data:</div>
        <pre class="code-block custom-scrollbar text-green-300 text-sm overflow-x-auto">${JSON.stringify(result.data, null, 2)}</pre>
      </div>
      
      <div class="mb-4">
        <details class="text-gray-300">
          <summary class="cursor-pointer hover:text-white font-semibold mb-2">📄 Response Headers</summary>
          <pre class="code-block text-blue-300 text-xs mt-2">${JSON.stringify(result.headers, null, 2)}</pre>
        </details>
      </div>
      
      <div class="flex flex-wrap gap-2 mt-4">
        <button onclick="apiTester.copyToClipboard('${result.endpoint}')" 
                class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors">
          📋 Copy URL
        </button>
        <button onclick="apiTester.copyToClipboard('${JSON.stringify(result.data, null, 2)}')" 
                class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors">
          📄 Copy Response
        </button>
        <button onclick="apiTester.testEndpoint('${result.endpoint}')" 
                class="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-colors">
          🔄 Test Again
        </button>
      </div>
    `;
  }

  // Show error result
  showError(endpoint, error) {
    if (!this.resultContainer) return;
    
    this.resultContainer.innerHTML = `
      <div class="text-red-400 font-semibold mb-4">
        ❌ Request Failed
      </div>
      <div class="text-gray-300 text-sm space-y-1 mb-4">
        <div>📡 <span class="font-mono">${endpoint}</span></div>
        <div>📅 <span class="text-gray-400">${new Date().toLocaleString('vi-VN')}</span></div>
      </div>
      <div class="mb-4">
        <div class="text-gray-300 font-semibold mb-2">💥 Error Details:</div>
        <pre class="code-block text-red-300 text-sm">${error.message}</pre>
      </div>
      <button onclick="apiTester.testEndpoint('${endpoint}')" 
              class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors">
        🔄 Retry
      </button>
    `;
  }

  // Copy text to clipboard
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('📋 Copied to clipboard!', 'success');
    } catch (error) {
      console.error('Failed to copy:', error);
      this.showToast('❌ Failed to copy', 'error');
    }
  }

  // Show toast notification
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  // Get sample endpoints for testing
  getSampleEndpoints() {
    return [
      {
        name: 'Health Check',
        endpoint: '/api/health',
        description: 'Kiểm tra trạng thái API',
        icon: '📊'
      },
      {
        name: 'Metadata Sample',
        endpoint: '/api/syosetu/metadata/n4754kf',
        description: 'Lấy metadata tiểu thuyết mẫu',
        icon: '📚'
      },
      {
        name: 'Content Sample',
        endpoint: '/api/syosetu/content/n4754kf/1',
        description: 'Lấy nội dung chapter 1',
        icon: '📖'
      },
      {
        name: 'Search Sample',
        endpoint: '/api/syosetu/search?keyword=異世界&limit=5',
        description: 'Tìm kiếm với từ khóa "異世界"',
        icon: '🔍'
      },
      {
        name: 'Ranking Sample',
        endpoint: '/api/syosetu/ranking?type=daily&limit=10',
        description: 'Top 10 ranking hàng ngày',
        icon: '🏆'
      }
    ];
  }

  // Generate test buttons HTML
  generateTestButtons() {
    const endpoints = this.getSampleEndpoints();
    return endpoints.map(ep => `
      <button data-endpoint="${ep.endpoint}" 
              class="test-btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg">
        <div class="flex items-center justify-center">
          <span class="text-lg mr-2">${ep.icon}</span>
          <div class="text-left">
            <div class="font-semibold">${ep.name}</div>
            <div class="text-xs opacity-90">${ep.description}</div>
          </div>
        </div>
      </button>
    `).join('');
  }
}

// Initialize API tester when DOM is loaded
let apiTester;

document.addEventListener('DOMContentLoaded', () => {
  apiTester = new APITester();
  apiTester.init();
  
  // Update test buttons container if it exists
  const testButtonsContainer = document.getElementById('testButtons');
  if (testButtonsContainer) {
    testButtonsContainer.innerHTML = apiTester.generateTestButtons();
  }
});

// Export for global use
window.apiTester = apiTester;
