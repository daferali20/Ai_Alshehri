export interface Signal {
  id?: string | number;
  symbol: string;
  type: 'BUY' | 'SELL' | string;
  timestamp: string | number | Date;
  confidence: number;
  currentPrice?: number;
  analysis?: string;
  recommendedQuantity?: number;
}

export interface Order {
  id?: string | number;
  symbol: string;
  side: 'BUY' | 'SELL' | string;
  quantity: number;
  type?: string;
  price?: number;
  status?: string;
  timestamp?: string | number | Date;
}

export interface Position {
  id?: string | number;
  symbol: string;
  quantity: number;
  averagePrice?: number;
  currentPrice?: number;
  pnl?: number;
}

export interface TradingState {
  signals: Signal[];
  orders: Order[];
  positions: Position[];
  loading: boolean;
  error: string | null;
}
