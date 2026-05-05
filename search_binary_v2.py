import re

def search_in_binary(file_path, search_terms):
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
        
        # Indonesia phone number regex
        phone_regex = re.compile(br'(?:08|\+62|62)[0-9]{8,12}')
        
        for term in search_terms:
            print(f"\n--- Searching for: {term} ---")
            # Try multiple encodings
            options = [
                term.encode('ascii'),
                term.encode('utf-16le'),
                term.encode('utf-16be'),
                # Some XLS files might have characters separated by nulls but not strictly UTF-16
                b'\x00'.join([c.encode('ascii') for c in term])
            ]
            
            found = False
            for opt in options:
                indices = [m.start() for m in re.finditer(opt, content)]
                for idx in indices:
                    found = True
                    print(f"Found match at index {idx}")
                    # Look around 500 bytes for anything that looks like a phone number
                    context = content[max(0, idx - 500):min(len(content), idx + 1000)]
                    
                    # Try to find sequences of digits (8-13 chars)
                    # Phones in Indo: 0812..., 0852..., etc.
                    # We'll look for any digit sequence
                    digit_sequences = re.findall(br'[0-9]{10,13}', context)
                    for seq in digit_sequences:
                        print(f"Potential number found: {seq.decode('ascii')}")
            
            if not found:
                print(f"No direct match for {term}")

    except Exception as e:
        print(f"Error: {e}")

search_in_binary(r'c:\Users\USER\Documents\antigrafity\aqilla\PURI E BILLING.xls', ['Moh Amin', 'Siti Nur Laila', 'Amin', 'Laila'])
