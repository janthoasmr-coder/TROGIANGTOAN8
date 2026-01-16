import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { BookOpen } from 'lucide-react';

function App() {
  const [apiKey, setApiKey] = useState<string | null>(process.env.API_KEY || null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
      if (!process.env.API_KEY) {
          console.warn("API Key is missing from process.env");
          setHasError(true);
      }
  }, []);

  if (hasError && !apiKey) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
              <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-red-100">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                      <BookOpen size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Chưa cấu hình API Key</h2>
                  <p className="text-gray-600 mb-6">
                      Ứng dụng yêu cầu Gemini API Key để hoạt động. Vui lòng đảm bảo biến môi trường <code>API_KEY</code> đã được thiết lập.
                  </p>
              </div>
          </div>
      );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50">
      <ChatInterface />
    </div>
  );
}

export default App;