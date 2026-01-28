from pydantic import BaseModel
from typing import Optional, List, Dict

class FIR(BaseModel):
    fir_id: str
    source_file: str

    raw_text: str
    complaint_text: str

    crime_type: Optional[str]
    sections: Optional[str]

    date: Optional[str]
    time: Optional[str]

    location_text: Optional[str]
    geo: Optional[Dict]  # {lat, lon}

    department_tags: List[str]
    status: str = "pending"  # pending | investigating | closed