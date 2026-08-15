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
