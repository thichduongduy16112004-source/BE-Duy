import httpx
import json
import random

base_url = "http://127.0.0.1:8000/api/v1"

def run_tests():
    rand_id = random.randint(1000, 9999)
    email = f"user_{rand_id}@gmail.com"
    username = f"user_{rand_id}"
    password = f"Password123"
    
    # 1. Register user
    print("--- 1. Registering user ---")
    reg_res = httpx.post(f"{base_url}/auth/register", json={
        "email": email,
        "username": username,
        "password": password,
        "full_name": "Test User"
    })
    print(f"Register status: {reg_res.status_code}")
    assert reg_res.status_code == 200, f"Register failed: {reg_res.text}"
    reg_data = reg_res.json()
    token = reg_data["access_token"]
    user_data = reg_data["user"]
    print(f"Registered user: {json.dumps(user_data, indent=2)}")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Update profile with dob, phone, and new email
    print("\n--- 2. Updating profile with dob, phone, and new email ---")
    new_email = f"new_email_{rand_id}@gmail.com"
    update_payload = {
        "name": "Updated Test User",
        "dob": "15/11/2004",
        "phone": "0912345678",
        "email": new_email
    }
    update_res = httpx.put(f"{base_url}/users/me", json=update_payload, headers=headers)
    print(f"Update profile status: {update_res.status_code}")
    assert update_res.status_code == 200, f"Update profile failed: {update_res.text}"
    updated_user = update_res.json()
    print(f"Updated user: {json.dumps(updated_user, indent=2)}")
    assert updated_user["name"] == "Updated Test User"
    assert updated_user["dob"] == "15/11/2004"
    assert updated_user["phone"] == "0912345678"
    assert updated_user["email"] == new_email
    
    # 3. Try to change email to an already existing one (let's use a dummy registration first)
    print("\n--- 3. Testing email duplicate check ---")
    # Register another user
    other_email = f"other_{rand_id}@gmail.com"
    other_reg = httpx.post(f"{base_url}/auth/register", json={
        "email": other_email,
        "username": f"other_{rand_id}",
        "password": "Password123",
        "full_name": "Other User"
    })
    assert other_reg.status_code == 200
    
    # Try updating current user's email to other_email
    dup_res = httpx.put(f"{base_url}/users/me", json={"email": other_email}, headers=headers)
    print(f"Duplicate email update status: {dup_res.status_code}")
    print(f"Duplicate email update body: {dup_res.text}")
    assert dup_res.status_code == 400
    assert "Email đã được sử dụng" in dup_res.json()["detail"]
    
    # 4. Change password - Invalid old password
    print("\n--- 4. Changing password - Invalid old password ---")
    chg_res = httpx.post(f"{base_url}/users/me/change-password", json={
        "old_password": "WrongPassword123",
        "new_password": "NewPassword123"
    }, headers=headers)
    print(f"Wrong old password status: {chg_res.status_code}")
    print(f"Wrong old password body: {chg_res.text}")
    assert chg_res.status_code == 400
    assert "Mật khẩu cũ không chính xác" in chg_res.json()["detail"]

    # 5. Change password - Weak new password
    print("\n--- 5. Changing password - Weak new password ---")
    chg_res = httpx.post(f"{base_url}/users/me/change-password", json={
        "old_password": password,
        "new_password": "short"
    }, headers=headers)
    print(f"Weak password status: {chg_res.status_code}")
    print(f"Weak password body: {chg_res.text}")
    assert chg_res.status_code == 422 # Pydantic validation error

    # 6. Change password - New password same as old password
    print("\n--- 6. Changing password - New password same as old password ---")
    chg_res = httpx.post(f"{base_url}/users/me/change-password", json={
        "old_password": password,
        "new_password": password
    }, headers=headers)
    print(f"Same new password status: {chg_res.status_code}")
    print(f"Same new password body: {chg_res.text}")
    assert chg_res.status_code == 400
    assert "không được giống mật khẩu cũ" in chg_res.json()["detail"]

    # 7. Change password - Valid request
    print("\n--- 7. Changing password - Valid request ---")
    new_pass = "NewPassword123"
    chg_res = httpx.post(f"{base_url}/users/me/change-password", json={
        "old_password": password,
        "new_password": new_pass
    }, headers=headers)
    print(f"Valid password change status: {chg_res.status_code}")
    print(f"Valid password change body: {chg_res.text}")
    assert chg_res.status_code == 200
    
    # 8. Try login with old password (should fail)
    print("\n--- 8. Try login with old password ---")
    login_fail = httpx.post(f"{base_url}/auth/login", json={
        "identity": new_email,
        "password": password
    })
    print(f"Login old password status: {login_fail.status_code}")
    assert login_fail.status_code == 401
    
    # 9. Try login with new password (should succeed)
    print("\n--- 9. Try login with new password ---")
    login_ok = httpx.post(f"{base_url}/auth/login", json={
        "identity": new_email,
        "password": new_pass
    })
    print(f"Login new password status: {login_ok.status_code}")
    assert login_ok.status_code == 200
    print("All backend profile & change password tests passed successfully! 🚀")

if __name__ == "__main__":
    run_tests()
