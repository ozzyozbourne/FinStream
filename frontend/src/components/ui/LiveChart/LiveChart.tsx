import React, { useEffect, useRef, useState } from "react";
import { connectLiveFinnhub } from "../../../services/finnhubLive";
import "./LiveChart.css";

interface Props {
  symbol: string;
  onRemove?: (symbol: string) => void;
}

const LiveChart: React.FC<Props> = ({ symbol, onRemove }) => {
  const [dataPoints, setDataPoints] = useState<
    { price: number; time: number }[]
  >([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  //
  // 🔌 Connect to Finnhub WebSocket
  //
  useEffect(() => {
    const ws = connectLiveFinnhub(symbol, (trade) => {
      if (trade.s === symbol) {
        setDataPoints((prev) => [
          ...prev.slice(-250),
          { price: trade.p, time: trade.t },
        ]);
      }
    });

    return () => ws.close();
  }, [symbol]);

  //
  // 🎨 Draw Chart (WITH AXIS)
  //
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dataPoints.length < 2) return;

    // Auto-resize canvas width to fill card
    const parent = canvas.parentElement as HTMLElement | null;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = 300;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Extract arrays
    const prices = dataPoints.map((d) => d.price);
    const times = dataPoints.map((d) => d.time);

    const max = Math.max(...prices);
    const min = Math.min(...prices);
    const latest = prices[prices.length - 1];

    //
    // --- CHART MARGINS (for axis labels)
    //
    const leftMargin = 60;
    const bottomMargin = 30;
    const topMargin = 20;
    const chartW = width - leftMargin - 10;
    const chartH = height - bottomMargin - topMargin;

    //
    // --- BACKGROUND ---
    //
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#0e0e0e");
    bg.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    //
    // --- Y-AXIS PRICE LABELS + GRID ---
    //
    ctx.fillStyle = "#00ffbf";
    ctx.font = "13px Arial";
    ctx.textAlign = "right";

    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const t = i / yTicks;
      const value = max - (max - min) * t;
      const y = topMargin + chartH * t;

      // Price label
      ctx.fillText(value.toFixed(2), leftMargin - 8, y + 4);

      // Grid line
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath();
      ctx.moveTo(leftMargin, y);
      ctx.lineTo(width - 10, y);
      ctx.stroke();
    }

    //
    // --- X-AXIS TIME LABELS ---
    //
    ctx.textAlign = "center";
    const xSteps = 4;
    const stepIndex = Math.floor(dataPoints.length / xSteps);

    for (let i = 0; i <= xSteps; i++) {
      const index = i * stepIndex;
      if (index >= dataPoints.length) continue;

      const time = new Date(times[index]);
      const label = time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const x = leftMargin + (chartW * (index / (dataPoints.length - 1)));

      ctx.fillText(label, x, height - 10);
    }

    //
    // --- Chart Line Gradient ---
    //
    const grad = ctx.createLinearGradient(leftMargin, 0, width, 0);
    grad.addColorStop(0, "#00ffbf");
    grad.addColorStop(1, "#00b49c");

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.4;
    ctx.beginPath();

    //
    // --- SMOOTH CURVED LINE ---
    //
    for (let i = 0; i < dataPoints.length; i++) {
      const price = prices[i];

      const x = leftMargin + (chartW * (i / (dataPoints.length - 1)));
      const y =
        topMargin + ((max - price) / (max - min || 1)) * chartH;

      if (i === 0) ctx.moveTo(x, y);
      else {
        const prevX =
          leftMargin + (chartW * ((i - 1) / (dataPoints.length - 1)));
        const prevY =
          topMargin +
          ((max - prices[i - 1]) / (max - min || 1)) * chartH;

        const midX = (prevX + x) / 2;
        const midY = (prevY + y) / 2;

        ctx.quadraticCurveTo(prevX, prevY, midX, midY);
      }
    }

    ctx.stroke();
  }, [dataPoints]);

  //
  // --- COMPONENT RENDER ---
  //
  return (
    <div className="live-chart-container">
      <div className="chart-header">
        <span className="chart-symbol">{symbol} Live</span>

        <div className="chart-actions">
          <span className="chart-price">
            {dataPoints.length > 0
              ? dataPoints[dataPoints.length - 1].price.toFixed(2)
              : "--"}
          </span>

          {onRemove && (
            <button
              className="remove-btn"
              onClick={() => onRemove(symbol)}
              title="Remove"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="live-chart-canvas" />
    </div>
  );
};

export default LiveChart;
