import re

def search_in_binary(file_path, search_terms):
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
        
        for term in search_terms:
            print(f"\n--- Searching for: {term} ---")
            options = [
                term.encode('ascii'),
                term.encode('utf-16le'),
                b'\x00'.join([c.encode('ascii') for c in term])
            ]
            
            for opt in options:
                indices = [m.start() for m in re.finditer(opt, content)]
                for idx in indices:
                    print(f"Found match at index {idx}")
                    # Show decoded context
                    start = max(0, idx - 100)
                    end = min(len(content), idx + 200)
                    ctx_raw = content[start:end]
                    
                    print("Context (UTF-16LE):", ctx_raw.decode('utf-16le', errors='ignore'))
                    print("Context (ASCII):", ctx_raw.decode('ascii', errors='ignore'))
                    
                    # Look for phone numbers in the decoded strings
                    matches = re.findall(r'08\d{8,12}', ctx_raw.decode('ascii', errors='ignore') + ctx_raw.decode('utf-16le', errors='ignore'))
                    for m in set(matches):
                        print(f"PHONE MATCH: {m}")

    except Exception as e:
        print(f"Error: {e}")

search_in_binary(r'c:\Users\USER\Documents\antigrafity\aqilla\PURI E BILLING.xls', ['Moh Amin', 'Siti Nur Laila', 'Moh', 'Siti', 'Laila'])
