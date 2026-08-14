from __future__ import annotations
from typing import Any

def _num(value: Any) -> float | None:
    try: return float(value)
    except (TypeError, ValueError): return None

def analyze_liquidity(rows: list[dict[str, Any]]) -> dict[str, Any]:
    closes=[x for r in rows if (x:=_num(r.get('close'))) is not None and x>0]
    volumes=[x for r in rows if (x:=_num(r.get('volume'))) is not None and x>=0]
    if not closes or not volumes: return {'score':50.0,'average_dollar_volume20':None,'relative_volume':None,'liquidity_signal':'unknown'}
    n=min(len(closes),len(volumes)); dollars=[closes[-n+i]*volumes[-n+i] for i in range(n)]
    avg_dollar=sum(dollars[-20:])/min(20,len(dollars)); avg_vol=sum(volumes[-20:])/min(20,len(volumes)); rel=volumes[-1]/avg_vol if avg_vol else None
    score=50.0
    if avg_dollar>=50_000_000: score+=30
    elif avg_dollar>=10_000_000: score+=20
    elif avg_dollar>=2_000_000: score+=10
    else: score-=10
    if rel is not None:
        if rel>=2: score+=15
        elif rel>=1.5: score+=10
        elif rel>=1.2: score+=5
    score=max(0,min(100,score)); signal='very_high' if score>=80 else 'high' if score>=65 else 'medium' if score>=45 else 'low'
    return {'score':round(score,2),'average_dollar_volume20':avg_dollar,'relative_volume':rel,'liquidity_signal':signal}

def analyze_momentum(rows: list[dict[str, Any]]) -> dict[str, Any]:
    closes=[x for r in rows if (x:=_num(r.get('close'))) is not None and x>0]
    if len(closes)<21: return {'score':50.0,'return_5d':None,'return_20d':None,'signal':'insufficient_data'}
    ret5=(closes[-1]/closes[-6]-1)*100; ret20=(closes[-1]/closes[-21]-1)*100
    score=max(0,min(100,50+ret5*2+ret20)); signal='strong' if score>=75 else 'positive' if score>=60 else 'weak' if score<=35 else 'neutral'
    return {'score':round(score,2),'return_5d':round(ret5,2),'return_20d':round(ret20,2),'signal':signal}
