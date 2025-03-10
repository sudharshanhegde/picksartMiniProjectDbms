from decimal import Decimal
try:
    # For Flask 2.0+
    from flask.json.provider import JSONEncoder
except ImportError:
    # For older Flask versions
    from flask.json import JSONEncoder
from datetime import datetime

class CustomJSONEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj) 