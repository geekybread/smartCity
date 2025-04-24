# alerts/twilio_utils.py

from twilio.rest import Client
from django.conf import settings

def send_bulk_sms(numbers, message):
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    from_number = settings.TWILIO_PHONE_NUMBER  # or MessagingServiceSid

    for number in numbers:
        try:
            client.messages.create(
                body=message,
                from_=from_number,
                to=number
            )
        except Exception as e:
            print(f"❌ Failed to send to {number}: {e}")
