import httpx

base_url = "http://127.0.0.1:8000/api/v1"

def test_characters(grade=None):
    url = f"{base_url}/characters/"
    params = {}
    if grade:
        params["grade"] = grade
    
    r = httpx.get(url, params=params)
    data = r.json()
    print(f"Testing GET /characters/ with params: {params}")
    print(f"Total: {data.get('total')}")
    print(f"Sample characters: {[c['id'] for c in data.get('characters', [])]}\n")

test_characters()
test_characters(grade="cap2")
test_characters(grade="cap3")
