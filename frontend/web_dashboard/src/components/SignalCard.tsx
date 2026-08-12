// frontend/web_dashboard/src/components/SignalCard.tsx
import React from 'react';
import { Signal } from '../types';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { executeOrder } from '../store/slices/tradingSlice';

interface SignalCardProps {
  signal: Signal;
}

const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  const dispatch = useAppDispatch();
  
  const handleExecute = (action: 'buy' | 'sell') => {
    dispatch(executeOrder({
      symbol: signal.symbol,
      action: action,
      quantity: signal.recommendedQuantity || 100,
      orderType: 'market',
      signalId: signal.id,
    }));
  };

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'BUY':
        return 'text-green-500';
      case 'SELL':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white">{signal.symbol}</h3>
          <p className="text-sm text-gray-400">{new Date(signal.timestamp).toLocaleString()}</p>
        </div>
        <div className={`text-lg font-bold ${getSignalColor(signal.type)}`}>
          {signal.type}
        </div>
      </div>
      
      <div className="mt-2">
        <div className="flex justify-between text-sm text-gray-300">
          <span>Confidence: {signal.confidence}%</span>
          <span>Price: ${signal.currentPrice?.toFixed(2) || 'N/A'}</span>
        </div>
        <div className="mt-2 text-gray-400 text-sm">
          {signal.analysis}
        </div>
      </div>
      
      <div className="mt-3 flex gap-2">
        <button 
          onClick={() => handleExecute('buy')}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors"
          disabled={signal.type !== 'BUY'}
        >
          Execute Buy
        </button>
        <button 
          onClick={() => handleExecute('sell')}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors"
          disabled={signal.type !== 'SELL'}
        >
          Execute Sell
        </button>
      </div>
    </div>
  );
};

export default SignalCard;
