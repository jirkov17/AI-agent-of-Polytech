import requests
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

def send_to_n8n(chat_id, user_message):
    if not settings.N8N_WEBHOOK_URL:
        raise ImproperlyConfigured("N8N_WEBHOOK_URL is not set in settings")
    
    payload = {
        "chat_id": chat_id,
        "message": user_message
    }
    
    try:
        response = requests.post(
            settings.N8N_WEBHOOK_URL,
            json=payload,
            timeout=60
        )
        #print(f"n8n response: {response.status_code}, content: {response.text[:100]}")
        response.raise_for_status()

    except requests.exceptions.RequestException as e:
        print(f"Error sending to n8n: {e}")
