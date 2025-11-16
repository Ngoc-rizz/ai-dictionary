import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Undo2, Upload } from "lucide-react";

export function DrawingCanvas({ onRecognize }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [history, setHistory] = useState([]);

  const saveHistory = useCallback(() => {
    if (context && canvasRef.current) {
      const { width, height } = canvasRef.current;
      const imgData = context.getImageData(0, 0, width, height);
      setHistory((prevHistory) => [...prevHistory, imgData]);
    }
  }, [context]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = window.innerWidth < 640 ? 200 : 250;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      setContext(ctx);

      // --- LƯU LẠI "ẢNH CHỤP" TRẠNG THÁI TRỐNG BAN ĐẦU ---
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([imgData]);
    }
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !context) return;

    context.lineWidth = 8;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !context || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    let x, y;
    if ("touches" in e) {
      e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (context) {
      context.closePath();
    }
    if (isDrawing) {
      saveHistory();
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // --- RESET LỊCH SỬ KHI XÓA ---
    const blankState = context.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    setHistory([blankState]);
  };
  const undo = () => {
    // Chỉ undo khi có nhiều hơn 1 "ảnh chụp" (ảnh 0 là ảnh trống)
    if (history.length > 1 && context) {
      // 1. Xóa "ảnh chụp" cuối cùng (nét vẽ vừa xong)
      const newHistory = history.slice(0, -1);

      // 2. Lấy "ảnh chụp" ngay trước đó
      const lastState = newHistory[newHistory.length - 1];

      // 3. "Dán" ảnh chụp đó đè lên canvas
      context.putImageData(lastState, 0, 0);

      // 4. Cập nhật state
      setHistory(newHistory);
    }
  };
  const submitDrawing = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      onRecognize(dataUrl);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="border-2 border-dashed border-border rounded-lg overflow-hidden bg-white w-fit">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair block"
        />
      </div>

      <div className="flex gap-2 w-full sm:w-auto justify-center">
        <Button
          variant="outline"
          onClick={clearCanvas}
          className="gap-2 text-xs sm:text-sm flex-1 sm:flex-none"
        >
          <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
          <span className="hidden sm:inline">Clear</span>
          <span className="sm:hidden">Clear</span>
        </Button>
        <Button
          onClick={submitDrawing}
          className="gap-2 text-xs sm:text-sm flex-1 sm:flex-none"
        >
          <Upload className="w-3 sm:w-4 h-3 sm:h-4" />
          <span className="hidden sm:inline">Recognize</span>
          <span className="sm:hidden">Recognize</span>
        </Button>
        <Button
          variant="outline"
          onClick={undo}
          disabled={history.length <= 1}
          className="gap-2 text-xs sm:text-sm flex-1 sm:flex-none"
        >
          <Undo2 className="w-3 sm:w-4 h-3 sm:h-4" />
          <span className="hidden sm:inline">Undo</span>
          <span className="sm:hidden">Undo</span>
        </Button>
      </div>
    </div>
  );
}
