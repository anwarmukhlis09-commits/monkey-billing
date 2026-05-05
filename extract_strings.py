import re

def extract_strings(file_path):
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
            
        print(f"File size: {len(content)} bytes")
        
        # Search for ASCII strings (min length 4)
        ascii_strings = re.findall(br'[ -~]{4,}', content)
        print(f"Found {len(ascii_strings)} ASCII strings")
        
        # Search for UTF-16LE strings (min length 4)
        utf16_strings = []
        # UTF-16LE is every other byte null usually for ASCII chars
        # We can find sequences of (char, null)
        utf16_matches = re.findall(br'(?:[ -~]\x00){4,}', content)
        for m in utf16_matches:
            utf16_strings.append(m.decode('utf-16le', errors='ignore'))
            
        print(f"Found {len(utf16_strings)} UTF-16LE strings")
        
        # Look for search terms in extracted strings
        search_terms = ['amin', 'siti', 'laila', 'moh', 'puri']
        for term in search_terms:
            print(f"\nSearching for '{term}':")
            for s in ascii_strings:
                if term.lower() in s.decode('ascii', errors='ignore').lower():
                    print(f"ASCII Match: {s.decode('ascii', errors='ignore')}")
                    # Find nearby digits
                    idx = content.find(s)
                    context = content[max(0, idx-100):min(len(content), idx+500)]
                    phones = re.findall(br'08[0-9]{8,12}', context)
                    if phones:
                        print(f"  Phones nearby: {[p.decode('ascii') for p in phones]}")
            
            for s in utf16_strings:
                if term.lower() in s.lower():
                    print(f"UTF-16 Match: {s}")
                    # Find nearby digits
                    # This is harder since we don't have the index easily, but we can search again
                    idx = content.find(s.encode('utf-16le'))
                    context = content[max(0, idx-100):min(len(content), idx+500)]
                    # Search digits in both ASCII and UTF-16 in context
                    phones = re.findall(br'08[0-9]{8,12}', context)
                    # Also try finding digits in decompressed context if needed, but usually phones are ASCII
                    if phones:
                        print(f"  Phones nearby (ASCII): {[p.decode('ascii') for p in phones]}")
                    
                    # Try finding digits in UTF-16
                    phones_u16 = re.findall(br'(?:[0-9]\x00){8,13}', context)
                    if phones_u16:
                        print(f"  Phones nearby (UTF-16): {[p.decode('utf-16le') for p in phones_u16]}")

    except Exception as e:
        print(f"Error: {e}")

extract_strings(r'c:\Users\USER\Documents\antigrafity\aqilla\PURI E BILLING.xls')
