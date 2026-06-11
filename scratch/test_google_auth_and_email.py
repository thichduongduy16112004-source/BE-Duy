import httpx
import json
import random

base_url = "http://127.0.0.1:8000/api/v1"

def run_tests():
    rand_id = random.randint(1000, 9999)
    normal_email = f"normal_{rand_id}@gmail.com"
    normal_username = f"normal_{rand_id}"
    normal_password = "Password123"

    print("--- 1. Testing Normal Registration (triggers Welcome Email) ---")
    reg_res = httpx.post(f"{base_url}/auth/register", json={
        "email": normal_email,
        "username": normal_username,
        "password": normal_password,
        "full_name": "Normal User"
    })
    print(f"Register status: {reg_res.status_code}")
    assert reg_res.status_code == 200, f"Register failed: {reg_res.text}"
    print("Welcome email should be printed in backend console logs! ✅\n")

    print("--- 2. Testing Google Auto-registration (first time SSO) ---")
    google_token = f"mock-token-oauth-{rand_id}"
    g_login_res = httpx.post(f"{base_url}/auth/google", json={"credential": google_token})
    print(f"Google first login status: {g_login_res.status_code}")
    assert g_login_res.status_code == 200, f"Google login failed: {g_login_res.text}"
    g_data = g_login_res.json()
    assert g_data["is_new"] is True, "User should be marked as newly registered"
    user_token = g_data["access_token"]
    user_email = g_data["user"]["email"]
    print(f"Created Google user: {user_email}")
    print("Welcome email should be printed in backend console logs for Google registration! ✅\n")

    headers = {"Authorization": f"Bearer {user_token}"}

    print("--- 3. Testing Google Subsequent Login (second time SSO) ---")
    g_login_res_2 = httpx.post(f"{base_url}/auth/google", json={"credential": google_token})
    print(f"Google second login status: {g_login_res_2.status_code}")
    assert g_login_res_2.status_code == 200
    g_data_2 = g_login_res_2.json()
    assert g_data_2["is_new"] is False, "User should not be marked as new"
    print("Subsequent login successful. No welcome email should be triggered. ✅\n")

    print("--- 4. Testing Password Setup for Google User (no password exists) ---")
    # Old password is empty because this is first time setting password
    new_pw = "NewSecuredPass123"
    chg_res = httpx.post(f"{base_url}/users/me/change-password", json={
        "old_password": "",
        "new_password": new_pw
    }, headers=headers)
    print(f"Set password status: {chg_res.status_code}")
    assert chg_res.status_code == 200, f"Failed to set password: {chg_res.text}"
    print("Password set successful. Password change warning email should be printed in backend console! ✅\n")

    print("--- 5. Testing Password Change (now password exists!) - Invalid old password ---")
    chg_res_fail = httpx.post(f"{base_url}/users/me/change-password", json={
        "old_password": "WrongPassword123",
        "new_password": "AnotherNewPass123"
    }, headers=headers)
    print(f"Change password with wrong old password status: {chg_res_fail.status_code}")
    assert chg_res_fail.status_code == 400
    print("Bypassing old password check was blocked because a password hash now exists. Correct! ✅\n")

    print("--- 6. Testing Password Change - Valid old password ---")
    next_pw = "AnotherNewPass123"
    chg_res_ok = httpx.post(f"{base_url}/users/me/change-password", json={
        "old_password": new_pw,
        "new_password": next_pw
    }, headers=headers)
    print(f"Change password status: {chg_res_ok.status_code}")
    assert chg_res_ok.status_code == 200
    print("Password successfully updated. Warning email should be printed. ✅\n")

    print("--- 7. Verify login with the new password ---")
    login_res = httpx.post(f"{base_url}/auth/login", json={
        "identity": user_email,
        "password": next_pw
    })
    print(f"Login with new password status: {login_res.status_code}")
    assert login_res.status_code == 200
    print("Successfully logged in with the set password. All tests passed! 🚀")

if __name__ == "__main__":
    run_tests()
