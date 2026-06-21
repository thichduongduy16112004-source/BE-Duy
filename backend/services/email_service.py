import resend
from core.config import settings
import logging

logger = logging.getLogger("email_service")

class EmailService:
    @staticmethod
    def _send_email(to_email: str, subject: str, html_content: str):
        if not settings.RESEND_API_KEY:
            logger.warning("RESEND_API_KEY is not set. Email is in MOCK MODE.")
            try:
                safe_subject = subject.encode('utf-8', errors='replace').decode('utf-8')
                print("\n" + "="*80)
                print(f"[MOCK EMAIL SENT]")
                print(f"To: {to_email}")
                print(f"Subject: {safe_subject}")
                print(f"Content (HTML) length: {len(html_content)} bytes")
                print("="*80 + "\n")
            except Exception as pe:
                logger.warning(f"Could not print email to console: {pe}")
            return

        try:
            resend.api_key = settings.RESEND_API_KEY
            params = {
                "from": settings.EMAIL_FROM,
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }
            email_response = resend.Emails.send(params)
            logger.info(f"Email sent successfully to {to_email}. ID: {email_response.get('id')}")
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            print(f"[EMAIL ERROR] Failed to send email to {to_email}: {e}")

    @classmethod
    def send_welcome_email(cls, to_email: str, username: str):
        subject = "Chào mừng bạn đến với History Alive! 🏛️✨"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #faf5e8;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 30px auto;
                    background-color: #ffffff;
                    border: 2px solid #eab308;
                    border-radius: 24px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    overflow: hidden;
                }}
                .header {{
                    background: linear-gradient(135deg, #1c0a00, #2d1400);
                    color: #fbce03;
                    padding: 30px;
                    text-align: center;
                    border-bottom: 3px solid #fbce03;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 26px;
                    font-weight: 900;
                    letter-spacing: 2px;
                }}
                .content {{
                    padding: 40px 30px;
                    color: #1c1209;
                    line-height: 1.6;
                }}
                .content h2 {{
                    color: #d97706;
                    font-size: 20px;
                    font-weight: 800;
                    margin-top: 0;
                }}
                .button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: #ffffff !important;
                    text-decoration: none;
                    padding: 12px 30px;
                    border-radius: 16px;
                    font-weight: 900;
                    box-shadow: 0 4px 0 #b45309;
                    margin: 20px 0;
                    text-align: center;
                }}
                .footer {{
                    background-color: #f9f4e3;
                    color: #9a8060;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    border-top: 1px solid rgba(240,180,41,0.15);
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>HISTORY ALIVE</h1>
                </div>
                <div class="content">
                    <h2>Xin chào, {username}! 👋</h2>
                    <p>Chúc mừng bạn đã đăng ký tài khoản thành công tại <strong>History Alive</strong> - cổng thông tin học tập lịch sử Việt Nam sinh động và trực quan!</p>
                    <p>Hãy bắt đầu hành trình học tập, vượt qua các thử thách lịch sử hào hùng của tổ tiên, trả lời các câu đố trắc nghiệm và trò chuyện cùng trợ lý nhân vật lịch sử AI thông thái nhé!</p>
                    <div style="text-align: center;">
                        <a href="http://localhost:5173/login?verified=true" class="button">Bắt Đầu Học Ngay 🚀</a>
                    </div>
                    <p>Nếu bạn gặp bất kỳ câu hỏi nào, xin vui lòng liên hệ với phụ huynh hoặc gửi phản hồi cho chúng tôi.</p>
                    <p>Thân ái,<br><strong>Đội ngũ History Alive 🏛️</strong></p>
                </div>
                <div class="footer">
                    <p>© 2026 History Alive. Tất cả các quyền được bảo lưu.</p>
                </div>
            </div>
        </body>
        </html>
        """
        cls._send_email(to_email, subject, html_content)

    @classmethod
    def send_verification_email(cls, to_email: str, username: str, token: str):
        subject = "Xác nhận tài khoản History Alive 🏛️"
        verify_url = f"{settings.BACKEND_URL}/api/v1/auth/verify-email?token={token}"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #faf5e8; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 30px auto; background-color: #ffffff; border: 2px solid #3b82f6; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden; }}
                .header {{ background: linear-gradient(135deg, #1e3a8a, #172554); color: #bfdbfe; padding: 30px; text-align: center; border-bottom: 3px solid #3b82f6; }}
                .header h1 {{ margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 2px; }}
                .content {{ padding: 40px 30px; color: #1e293b; line-height: 1.6; }}
                .content h2 {{ color: #2563eb; font-size: 20px; font-weight: 800; margin-top: 0; }}
                .button {{ display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #ffffff !important; text-decoration: none; padding: 12px 30px; border-radius: 16px; font-weight: 900; box-shadow: 0 4px 0 #1d4ed8; margin: 20px 0; text-align: center; }}
                .footer {{ background-color: #eff6ff; color: #64748b; padding: 20px; text-align: center; font-size: 12px; border-top: 1px solid rgba(59,130,246,0.15); }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header"><h1>HISTORY ALIVE</h1></div>
                <div class="content">
                    <h2>Xin chào, {username}! 👋</h2>
                    <p>Cảm ơn bạn đã đăng ký tài khoản tại History Alive. Để hoàn tất việc đăng ký và bảo vệ tài khoản của bạn, vui lòng xác nhận địa chỉ email này.</p>
                    <div style="text-align: center;">
                        <a href="{verify_url}" class="button">Xác nhận Email</a>
                    </div>
                    <p>Hoặc sao chép và dán liên kết sau vào trình duyệt của bạn:</p>
                    <p style="word-break: break-all; font-size: 12px; color: #64748b;">{verify_url}</p>
                    <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
                </div>
                <div class="footer"><p>© 2026 History Alive. Tất cả các quyền được bảo lưu.</p></div>
            </div>
        </body>
        </html>
        """
        cls._send_email(to_email, subject, html_content)

    @classmethod
    def send_password_reset_email(cls, to_email: str, token: str):
        subject = "Yêu cầu khôi phục mật khẩu - History Alive 🏛️"
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #faf5e8; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 30px auto; background-color: #ffffff; border: 2px solid #8b5cf6; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden; }}
                .header {{ background: linear-gradient(135deg, #4c1d95, #2e1065); color: #ddd6fe; padding: 30px; text-align: center; border-bottom: 3px solid #8b5cf6; }}
                .header h1 {{ margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 2px; }}
                .content {{ padding: 40px 30px; color: #1e293b; line-height: 1.6; }}
                .content h2 {{ color: #7c3aed; font-size: 20px; font-weight: 800; margin-top: 0; }}
                .button {{ display: inline-block; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: #ffffff !important; text-decoration: none; padding: 12px 30px; border-radius: 16px; font-weight: 900; box-shadow: 0 4px 0 #5b21b6; margin: 20px 0; text-align: center; }}
                .footer {{ background-color: #f5f3ff; color: #64748b; padding: 20px; text-align: center; font-size: 12px; border-top: 1px solid rgba(139,92,246,0.15); }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header"><h1>HISTORY ALIVE</h1></div>
                <div class="content">
                    <h2>Yêu cầu khôi phục mật khẩu 🔑</h2>
                    <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản liên kết với địa chỉ email này.</p>
                    <p>Để đặt lại mật khẩu mới, vui lòng nhấn vào nút bên dưới (liên kết này có hiệu lực trong vòng 24 giờ):</p>
                    <div style="text-align: center;">
                        <a href="{reset_url}" class="button">Đặt lại mật khẩu</a>
                    </div>
                    <p>Hoặc sao chép và dán liên kết sau vào trình duyệt của bạn:</p>
                    <p style="word-break: break-all; font-size: 12px; color: #64748b;">{reset_url}</p>
                    <p>Nếu bạn không thực hiện yêu cầu này, hãy phớt lờ email này và tài khoản của bạn sẽ an toàn.</p>
                </div>
                <div class="footer"><p>© 2026 History Alive. Tất cả các quyền được bảo lưu.</p></div>
            </div>
        </body>
        </html>
        """
        cls._send_email(to_email, subject, html_content)

    @classmethod
    def send_password_change_email(cls, to_email: str, username: str):
        subject = "Cảnh báo bảo mật: Mật khẩu đã được thay đổi! 🛡️"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #faf5e8;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 30px auto;
                    background-color: #ffffff;
                    border: 2px solid #ef4444;
                    border-radius: 24px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    overflow: hidden;
                }}
                .header {{
                    background: linear-gradient(135deg, #7f1d1d, #450a0a);
                    color: #fca5a5;
                    padding: 30px;
                    text-align: center;
                    border-bottom: 3px solid #ef4444;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 26px;
                    font-weight: 900;
                    letter-spacing: 2px;
                }}
                .content {{
                    padding: 40px 30px;
                    color: #1c1209;
                    line-height: 1.6;
                }}
                .content h2 {{
                    color: #dc2626;
                    font-size: 20px;
                    font-weight: 800;
                    margin-top: 0;
                }}
                .warning-box {{
                    background-color: #fef2f2;
                    border-left: 4px solid #ef4444;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 8px;
                    font-size: 14px;
                    color: #991b1b;
                    font-weight: 600;
                }}
                .footer {{
                    background-color: #f9f4e3;
                    color: #9a8060;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    border-top: 1px solid rgba(240,180,41,0.15);
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>HISTORY ALIVE</h1>
                </div>
                <div class="content">
                    <h2>Mật khẩu của bạn đã được thay đổi! 🛡️</h2>
                    <p>Xin chào, <strong>{username}</strong>,</p>
                    <p>Thư này dùng để xác nhận rằng mật khẩu cho tài khoản học viên History Alive của bạn đã được thay đổi thành công vào lúc này.</p>
                    <div class="warning-box">
                        Nếu bạn KHÔNG thực hiện thay đổi này, tài khoản của bạn có thể đang bị xâm nhập. Vui lòng liên hệ với phụ huynh hoặc quản trị viên hệ thống của chúng tôi ngay lập tức để khoá tài khoản và khôi phục dữ liệu học tập của bạn!
                    </div>
                    <p>Nếu bạn là người thực hiện hành động này, bạn có thể bỏ qua thư cảnh báo này.</p>
                    <p>Thân ái,<br><strong>Đội ngũ Bảo mật History Alive 🏛️</strong></p>
                </div>
                <div class="footer">
                    <p>© 2026 History Alive. Tất cả các quyền được bảo lưu.</p>
                </div>
            </div>
        </body>
        </html>
        """
        cls._send_email(to_email, subject, html_content)
