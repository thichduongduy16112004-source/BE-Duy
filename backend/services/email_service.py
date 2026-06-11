import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging
from core.config import settings

logger = logging.getLogger("email_service")

class EmailService:
    @staticmethod
    def _send_email(to_email: str, subject: str, html_content: str):
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.warning("SMTP configuration is not set. Email is in MOCK MODE.")
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
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.SMTP_USER
            msg["To"] = to_email

            part = MIMEText(html_content, "html")
            msg.attach(part)

            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
            server.quit()
            logger.info(f"Email sent successfully to {to_email}")
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
                        <a href="http://localhost:5174/" class="button">Bắt Đầu Học Ngay 🚀</a>
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
