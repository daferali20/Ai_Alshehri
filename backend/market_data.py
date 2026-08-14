from __future__ import annotations
from datetime import datetime, timezone
from typing import Any
import httpx
from .config import settings

class MarketDataError(RuntimeError): pass

def _quote(data: dict[str, Any], symbol: str) -> dict[str, Any]:
    return {'symbol':symbol,'price':float(data.get('c',0)),'change':float(data.get('d',0)),'change_percent':float(data.get('dp',0)),'high':float(data.get('h',0)),'low':float(data.get('l',0)),'open':float(data.get('o',0)),'previous_close':float(data.get('pc',0)),'timestamp':datetime.now(timezone.utc).isoformat(),'source':'finnhub'}

async def get_quote(symbol: str) -> dict[str, Any]:
    symbol=symbol.strip().upper()
    if not symbol: raise ValueError('Symbol is required')
    if not settings.FINNHUB_API_KEY: return {'symbol':symbol,'price':None,'change':None,'change_percent':None,'high':None,'low':None,'open':None,'previous_close':None,'timestamp':datetime.now(timezone.utc).isoformat(),'source':'unconfigured','message':'Set FINNHUB_API_KEY to enable live quotes.'}
    try:
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
            r=await client.get('https://finnhub.io/api/v1/quote',params={'symbol':symbol,'token':settings.FINNHUB_API_KEY}); r.raise_for_status(); data=r.json()
        if data.get('c') is None: raise MarketDataError(f'No quote data for {symbol}')
        return _quote(data,symbol)
    except (httpx.HTTPError,ValueError) as exc: raise MarketDataError(f'Market data provider error: {exc}') from exc

async def get_history(symbol: str, days: int = 260) -> list[dict[str, Any]]:
    if not settings.FINNHUB_API_KEY: return []
    symbol=symbol.strip().upper(); days=max(60,min(days,1000)); now=int(datetime.now(timezone.utc).timestamp()); start=now-days*86400
    try:
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
            r=await client.get('https://finnhub.io/api/v1/stock/candle',params={'symbol':symbol,'resolution':'D','from':start,'to':now,'token':settings.FINNHUB_API_KEY}); r.raise_for_status(); data=r.json()
        if data.get('s')!='ok': return []
        return [{'timestamp':t,'open':o,'high':h,'low':l,'close':c,'volume':v} for t,o,h,l,c,v in zip(data.get('t',[]),data.get('o',[]),data.get('h',[]),data.get('l',[]),data.get('c',[]),data.get('v',[]))][-days:]
    except httpx.HTTPError as exc: raise MarketDataError(f'History provider error: {exc}') from exc
