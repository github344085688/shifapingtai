import React, { useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const PhotoUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // 这里添加上传到服务器的逻辑
      const formData = new FormData();
      formData.append('photo', file);
      
      try {
        const response = await fetch('YOUR_UPLOAD_API_ENDPOINT', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        console.log('上传成功：', data);
      } catch (error) {
        console.error('上传失败：', error);
      }
    }
  };

  const handleCameraCapture = () => {
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      (decodedText, decodedResult) => {
        // 处理扫描结果
        console.log(decodedText, decodedResult);
      },
      (errorMessage) => {
        // 处理错误
        console.log(errorMessage);
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4">
      <div id="reader" className="w-full max-w-md"></div>
      
      {/* 拍照按钮 */}
      <button
        onClick={handleCameraCapture}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full w-full max-w-md"
      >
        打开相机拍照
      </button>

      {/* 选择照片按钮 */}
      <label className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full w-full max-w-md text-center cursor-pointer">
        从相册选择
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </label>

      {/* 预览区域 */}
      {selectedFile && (
        <div className="mt-4">
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="预览"
            className="max-w-md rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;