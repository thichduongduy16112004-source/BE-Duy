from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
import time
from datetime import datetime
from core.security import get_current_user
from core.database import get_database
from core.config import settings
from bson import ObjectId

payos_init_error = None
try:
    from payos import AsyncPayOS, WebhookError
    from payos.types import CreatePaymentLinkRequest
    
    payos_client = AsyncPayOS(
        client_id=settings.PAYOS_CLIENT_ID,
        api_key=settings.PAYOS_API_KEY,
        checksum_key=settings.PAYOS_CHECKSUM_KEY
    )
except Exception as e:
    payos_client = None
    payos_init_error = str(e)

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.get("/debug-payos")
def debug_payos():
    return {
        "payos_client_is_none": payos_client is None,
        "payos_init_error": payos_init_error,
        "client_id_len": len(settings.PAYOS_CLIENT_ID) if settings.PAYOS_CLIENT_ID else 0,
        "is_mock": (
            not settings.PAYOS_CLIENT_ID 
            or settings.PAYOS_CLIENT_ID.startswith("mock-") 
            or payos_client is None
        ),
        "frontend_url": settings.FRONTEND_URL
    }

class CreatePaymentRequest(BaseModel):
    amount: int = 59000

@router.post("/create-payment-link")
async def create_payment_link(body: CreatePaymentRequest, current_user: dict = Depends(get_current_user)):
    db = get_database()
    order_code = int(time.time() * 100) % 9007199254740991 # Keep it in JS safe integer limit
    
    payment_id = f"pay_{str(ObjectId())}"
    
    # Store payment details in the database
    payment_doc = {
        "_id": payment_id,
        "user_id": current_user["_id"],
        "order_code": order_code,
        "amount": body.amount,
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    await db["payments"].insert_one(payment_doc)
    
    is_mock = (
        not settings.PAYOS_CLIENT_ID 
        or settings.PAYOS_CLIENT_ID.startswith("mock-") 
        or payos_client is None
    )
    
    if is_mock:
        # Dev Mock URL
        checkout_url = f"{settings.FRONTEND_URL}/premium?payment_status=success&order_code={order_code}"
        return {
            "checkoutUrl": checkout_url,
            "orderCode": order_code,
            "paymentId": payment_id,
            "isMock": True
        }
        
    try:
        payment_request = CreatePaymentLinkRequest(
            order_code=order_code,
            amount=body.amount,
            description="Upgrade Pro History Alive",
            cancel_url=f"{settings.FRONTEND_URL.rstrip('/')}/premium",
            return_url=f"{settings.FRONTEND_URL.rstrip('/')}/premium?payment_status=success&order_code={order_code}"
        )
        response = await payos_client.payment_requests.create(payment_data=payment_request)
        
        # Save checkOutUrl inside database
        await db["payments"].update_one(
            {"_id": payment_id}, 
            {"$set": {"checkout_url": response.checkout_url}}
        )
        
        return {
            "checkoutUrl": response.checkout_url,
            "orderCode": order_code,
            "paymentId": payment_id,
            "isMock": False
        }
    except Exception as e:
        # Log error and raise exception
        print(f"[PayOS Error] Failed to create payment link: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khởi tạo cổng thanh toán PayOS: {str(e)}"
        )

@router.post("/webhook")
async def payos_webhook(request: Request):
    db = get_database()
    body_data = await request.body()
    
    is_mock = (
        not settings.PAYOS_CLIENT_ID 
        or settings.PAYOS_CLIENT_ID.startswith("mock-") 
        or payos_client is None
    )
    
    if is_mock:
        # For testing we can accept simulated webhook calls
        try:
            import json
            payload = json.loads(body_data.decode("utf-8"))
            data = payload.get("data", {})
            order_code = data.get("orderCode")
            
            if order_code:
                # Upgrade user
                payment = await db["payments"].find_one({"order_code": int(order_code)})
                if payment and payment["status"] == "pending":
                    from datetime import timedelta
                    await db["payments"].update_one(
                        {"_id": payment["_id"]}, 
                        {"$set": {"status": "completed", "completed_at": datetime.utcnow()}}
                    )
                    premium_end = datetime.utcnow() + timedelta(days=30)
                    await db["users"].update_one(
                        {"_id": payment["user_id"]}, 
                        {"$set": {
                            "subscription_type": "premium", 
                            "isPremium": True,
                            "premium_end_date": premium_end
                        }}
                    )
                    return {"status": "success", "message": "Mock payment processed successfully"}
            return {"status": "error", "message": "Invalid mock webhook data"}
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Mock webhook error: {str(e)}")
            
    try:
        webhook_data = await payos_client.webhooks.verify(body_data)
        order_code = webhook_data.order_code
        
        # Find transaction
        payment = await db["payments"].find_one({"order_code": order_code})
        if not payment:
            raise HTTPException(status_code=404, detail="Không tìm thấy hóa đơn giao dịch")
            
        if payment["status"] == "pending":
            from datetime import timedelta
            # Update payment status
            await db["payments"].update_one(
                {"_id": payment["_id"]}, 
                {"$set": {"status": "completed", "completed_at": datetime.utcnow()}}
            )
            # Upgrade user to premium for 30 days
            premium_end = datetime.utcnow() + timedelta(days=30)
            await db["users"].update_one(
                {"_id": payment["user_id"]}, 
                {"$set": {
                    "subscription_type": "premium", 
                    "isPremium": True,
                    "premium_end_date": premium_end
                }}
            )
            
        return {"status": "success", "data": webhook_data.model_dump()}
    except WebhookError as e:
        raise HTTPException(status_code=400, detail=f"Chữ ký PayOS không hợp lệ: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/verify/{order_code}")
async def verify_payment(order_code: int):
    db = get_database()
    payment = await db["payments"].find_one({"order_code": order_code})
    if not payment:
        raise HTTPException(status_code=404, detail="Không tìm thấy hóa đơn giao dịch")
        
    is_mock = (
        not settings.PAYOS_CLIENT_ID 
        or settings.PAYOS_CLIENT_ID.startswith("mock-") 
        or payos_client is None
    )
    
    if is_mock:
        # Mock logic already upgrades in webhook but if we verify manually we simulate success
        if payment["status"] == "pending":
            from datetime import timedelta
            await db["payments"].update_one(
                {"_id": payment["_id"]}, 
                {"$set": {"status": "completed", "completed_at": datetime.utcnow()}}
            )
            premium_end = datetime.utcnow() + timedelta(days=30)
            await db["users"].update_one(
                {"_id": payment["user_id"]}, 
                {"$set": {
                    "subscription_type": "premium", 
                    "isPremium": True,
                    "premium_end_date": premium_end
                }}
            )
        return {"status": "success", "message": "Giao dịch mô phỏng thành công"}
        
    try:
        payment_info = await payos_client.payment_requests.get(order_code)
        if payment_info.status == "PAID" and payment["status"] == "pending":
            from datetime import timedelta
            await db["payments"].update_one(
                {"_id": payment["_id"]}, 
                {"$set": {"status": "completed", "completed_at": datetime.utcnow()}}
            )
            premium_end = datetime.utcnow() + timedelta(days=30)
            await db["users"].update_one(
                {"_id": payment["user_id"]}, 
                {"$set": {
                    "subscription_type": "premium", 
                    "isPremium": True,
                    "premium_end_date": premium_end
                }}
            )
            return {"status": "success", "message": "Đã xác nhận thanh toán và nâng cấp tài khoản"}
        elif payment_info.status == "PAID":
            return {"status": "success", "message": "Giao dịch đã được xác nhận trước đó"}
        else:
            return {"status": "pending", "message": f"Trạng thái giao dịch: {payment_info.status}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
