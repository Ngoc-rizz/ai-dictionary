/**
 * Resize ảnh và trả về chuỗi Base64
 * @param {File} file - File ảnh gốc từ input
 * @param {number} maxWidth - Chiều rộng tối đa mong muốn (ví dụ: 800px)
 * @returns {Promise<string>} - Chuỗi Base64 của ảnh đã resize
 */
export const resizeImageToBase64 = (file, maxWidth = 800) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = img.width * scale;
        const h = img.height * scale;

        const canvas = Object.assign(document.createElement("canvas"), {
          width: w,
          height: h,
        });

        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
