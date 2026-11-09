import smtplib
from email.message import EmailMessage

msg = EmailMessage()
msg.set_content('Test notification from Phani')
msg['Subject'] = 'Test notification'
msg['From'] = 'phani_veluvali@tecnics.com'
msg['To'] = 'phani_veluvali@tecnics.com'

try:
    s = smtplib.SMTP('172.16.6.9', 5433)
    s.send_message(msg)
    s.quit()
    print('Sent successfully!')
except Exception as e:
    print('Failed to send:', e)
