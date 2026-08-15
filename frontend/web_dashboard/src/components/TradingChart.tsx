import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { useWebSocket } from '../hooks/useWebSocket';

interface TradingChartProps {
  symbol: string;
  interval: string;
}

interface ChartUpdate extends CandlestickData {
  time: Time;
}

const API_BASE = (process.env.REACT_APP_API_URL || 'https://ai-alshehri.onrender.com').replace(/\/$/, '');

const TradingChart: React.FC<TradingChartProps> = ({ symbol, interval }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const wsUrl = `${API_BASE.replace(/^http/, 'ws')}/ws/chart/${encodeURIComponent(symbol)}`;
  const { lastMessage } = useWebSocket<ChartUpdate>(wsUrl);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#1e222d' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2a2e39' },
        horzLines: { color: '#2a2e39' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#2a2e39' },
      timeScale: { borderColor: '#2a2e39' },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    const fetchInitialData = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/historical/${encodeURIComponent(symbol)}?interval=${encodeURIComponent(interval)}&limit=100`
        );
        if (!response.ok) throw new Error(`Historical data request failed: ${response.status}`);
        const data = (await response.json()) as CandlestickData[];
        candlestickSeries.setData(data);
      } catch (error) {
        console.error('Failed to load chart data:', error);
      }
    };

    fetchInitialData();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      seriesRef.current = null;
      chartRef.current = null;
      chart.remove();
    };
  }, [symbol, interval]);

  useEffect(() => {
    if (lastMessage && seriesRef.current) {
      try {
        seriesRef.current.update(lastMessage);
      } catch (error) {
        console.error('Invalid chart update:', error);
      }
    }
  }, [lastMessage]);

  return <div ref={chartContainerRef} className="trading-chart" />;
};

export default TradingChart;
