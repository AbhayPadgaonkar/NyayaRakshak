from typing import List, Dict
from threading import Lock

_FIRS: List[Dict] = []
_LOCK = Lock()

def add_firs(firs: List[Dict]):
    with _LOCK:
        _FIRS.extend(firs)

def get_all_firs() -> List[Dict]:
    with _LOCK:
        return list(_FIRS)

def get_pending_count() -> int:
    with _LOCK:
        return sum(1 for f in _FIRS if f.get("status") == "pending")

ALERTS = []

def add_alert(alert: dict):
    ALERTS.insert(0, alert)  # newest first

def get_alerts(limit: int = 10):
    return ALERTS[:limit]