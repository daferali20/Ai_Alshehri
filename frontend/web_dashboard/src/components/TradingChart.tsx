// frontend/web_dashboard/src/components/TradingChart.tsx
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import { useWebSocket } from '../hooks/useWebSocket';

interface TradingChartProps {
  symbol: string;
  interval: string;
}

const TradingChart: React.FC<TradingChartProps> = ({ symbol, interval }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { lastMessage } = useWebSocket(`/ws/chart/${symbol}`);

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 500,
        layout: {
          backgroundColor: '#1e222d',
          textColor: '#d1d4dc',
        },
        grid: {
          vertLines: { color: '#2a2e39' },
          horzLines: { color: '#2a2e39' },
        },
        crosshair: {
          mode: 1,
        },
        rightPriceScale: {
          borderColor: '#2a2e39',
        },
        timeScale: {
          borderColor: '#2a2e39',
        },
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      chartRef.current = chart;

      // Load initial data
      fetchInitialData(symbol, interval).then(data => {
        candlestickSeries.setData(data);
      });

      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [symbol, interval]);

  useEffect(() => {
    if (lastMessage && chartRef.current) {
      const data = JSON.parse(lastMessage);
      const candlestickSeries = chartRef.current.series()[0];
      if (candlestickSeries) {
        candlestickSeries.update(data);
      }
    }
  }, [lastMessage]);

  const fetchInitialData = async (symbol: string, interval: string) => {
    const response = await fetch(`/api/historical/${symbol}?interval=${interval}&limit=100`);
    return response.json();
  };

  return <div ref={chartContainerRef} className="trading-chart" />;
};

export default TradingChart;
