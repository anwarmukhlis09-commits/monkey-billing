import re

def search_in_binary(file_path, search_terms):
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
        
        # Try finding the terms as ASCII and UTF-16
        for term in search_terms:
            print(f"\nSearching for: {term}")
            
            # ASCII search
            indices = [m.start() for m in re.finditer(term.encode('ascii'), content)]
            # UTF-16 search (common in Excel)
            indices += [m.start() for m in re.finditer(term.encode('utf-16le'), content)]
            
            for idx in set(indices):
                # Look around the found index for phone-number-like strings (10-14 digits)
                start = max(0, idx - 200)
                end = min(len(content), idx + 200)
                context = content[start:end]
                
                # Extract anything that looks like a phone number: 08... or +62...
                # We'll look for digits in the context
                # Clean context for better visibility
                # Try to decode what we can
                try:
                    decoded = context.decode('utf-16le', errors='ignore')
                    numbers = re.findall(r'08\d{8,12}', decoded)
                    for num in numbers:
                        print(f"Found match near {term} (UTF-16): {num}")
                except:
                    pass
                
                try:
                    decoded_ascii = context.decode('ascii', errors='ignore')
                    numbers_ascii = re.findall(r'08\d{8,12}', decoded_ascii)
                    for num in numbers_ascii:
                        print(f"Found match near {term} (ASCII): {num}")
                except:
                    pass

    except Exception as e:
        print(f"Error: {e}")

search_in_binary(r'c:\Users\USER\Documents\antigrafity\aqilla\PURI E BILLING.xls', ['Moh Amin', 'Siti Nur Laila'])
