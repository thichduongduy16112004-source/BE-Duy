"""
Environment Setup Verification Script
Run: python backend/scripts/verify_env.py
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
import httpx

# Colors for output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"

async def test_mongodb():
    """Test MongoDB connection"""
    print("\n🔍 Testing MongoDB Connection...")
    
    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        print(f"{RED}❌ MONGODB_URI not found in environment{RESET}")
        return False
    
    try:
        client = AsyncIOMotorClient(mongodb_uri)
        # Test connection
        await client.admin.command('ping')
        
        # List databases
        db_list = await client.list_database_names()
        print(f"{GREEN}✅ MongoDB Connected Successfully{RESET}")
        print(f"   Available databases: {db_list}")
        
        # Check historyalive database
        db = client["historyalive"]
        collections = await db.list_collection_names()
        print(f"   Collections in 'historyalive': {collections if collections else 'None (empty)'}")
        
        return True
    except Exception as e:
        print(f"{RED}❌ MongoDB Connection Failed: {e}{RESET}")
        return False

async def test_gemini_api():
    """Test Gemini API key"""
    print("\n🔍 Testing Gemini API Key...")
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "mock-key":
        print(f"{RED}❌ Valid GEMINI_API_KEY not found{RESET}")
        print(f"   Current value: {api_key[:20]}..." if api_key else "None")
        return False
    
    try:
        # Test API call to Gemini
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://generativelanguage.googleapis.com/v1/models?key={api_key}",
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                models = [m.get("name", "unknown") for m in data.get("models", [])[:3]]
                print(f"{GREEN}✅ Gemini API Key Valid{RESET}")
                print(f"   Available models: {models}")
                return True
            else:
                print(f"{RED}❌ Gemini API Error: {response.status_code}{RESET}")
                print(f"   Response: {response.text[:200]}")
                return False
                
    except Exception as e:
        print(f"{RED}❌ Gemini API Test Failed: {e}{RESET}")
        return False

async def check_services():
    """Check if required services are running"""
    print("\n🔍 Checking Running Services...")
    
    services = {
        "Backend API": "http://localhost:8000/api/health",
        "Frontend": "http://localhost:5173",
        "Admin Portal": "http://localhost:5178"
    }
    
    async with httpx.AsyncClient() as client:
        for name, url in services.items():
            try:
                response = await client.get(url, timeout=2.0)
                if response.status_code < 400:
                    print(f"{GREEN}✅ {name} running on {url}{RESET}")
                else:
                    print(f"{YELLOW}⚠️  {name} returned {response.status_code}{RESET}")
            except:
                print(f"{RED}❌ {name} not reachable at {url}{RESET}")

async def main():
    print("=" * 60)
    print("🚀 History Alive - Environment Verification")
    print("=" * 60)
    
    # Load .env
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run tests
    mongo_ok = await test_mongodb()
    gemini_ok = await test_gemini_api()
    await check_services()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    print(f"MongoDB: {GREEN + '✅ Ready' + RESET if mongo_ok else RED + '❌ Not Ready' + RESET}")
    print(f"Gemini API: {GREEN + '✅ Ready' + RESET if gemini_ok else RED + '❌ Not Ready' + RESET}")
    
    if mongo_ok and gemini_ok:
        print(f"\n{GREEN}🎉 All checks passed! Ready to start implementation.{RESET}")
        return 0
    else:
        print(f"\n{RED}⚠️  Some checks failed. Please fix before continuing.{RESET}")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)
