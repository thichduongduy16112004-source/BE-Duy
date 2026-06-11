import httpx
import json

base_url = "http://127.0.0.1:8000/api/v1"

def test_register(email, username, password, full_name=None):
    payload = {
        "email": email,
        "username": username,
        "password": password
    }
    if full_name:
        payload["full_name"] = full_name
        
    print(f"Testing registration with payload: {json.dumps(payload)}")
    try:
        r = httpx.post(f"{base_url}/auth/register", json=payload)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text}\n")
        return r
    except Exception as e:
        print(f"Error: {e}\n")

# 1. Test short password (< 8 chars)
test_register("test1@gmail.com", "test1", "Short1")

# 2. Test password without uppercase
test_register("test2@gmail.com", "test2", "password123")

# 3. Test password without digit
# Note: we use "Password" which is 8 chars, has uppercase, but no digit
test_register("test3@gmail.com", "test3", "Password")

# 4. Test valid password
import random
rand_id = random.randint(1000, 9999)
test_register(f"test_ok_{rand_id}@gmail.com", f"user_{rand_id}", f"SecurePass{rand_id}")
