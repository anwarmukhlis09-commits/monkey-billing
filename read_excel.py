import pandas as pd
import sys

try:
    # Try reading as xlsx first, then xls
    try:
        df = pd.read_excel(r'c:\Users\USER\Documents\antigrafity\aqilla\PURI E BILLING.xls')
    except Exception:
        df = pd.read_excel(r'c:\Users\USER\Documents\antigrafity\aqilla\PURI E BILLING.xls', engine='xlrd')
    
    # Search for Moh Amin and Siti Nur Laila
    results = df[df.apply(lambda row: row.astype(str).str.contains('Moh Amin|Siti Nur Laila', case=False).any(), axis=1)]
    print(results.to_string())
except Exception as e:
    print(f"Error: {e}")
