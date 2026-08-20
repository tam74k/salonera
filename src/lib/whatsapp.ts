export async function sendWhatsAppMessage(
  apiUrl: string,
  instance: string,
  apiKey: string,
  phone: string,
  message: string
) {
  if (!apiUrl || !instance || !apiKey || !phone) {
    console.log('WhatsApp Error: Missing required credentials or phone number');
    return false;
  }

  // Clean phone number (remove +, spaces, leading zeros if standardizing)
  // Most WhatsApp APIs expect format like 9665... without the plus
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  try {
    const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: cleanPhone,
        text: message,
        options: {
          delay: 1200,
          presence: 'composing'
        }
      })
    });
    
    if (!response.ok) {
      console.error('Failed to send WhatsApp message:', await response.text());
      return false;
    } else {
      console.log('WhatsApp message sent successfully to', cleanPhone);
      return true;
    }
  } catch (error) {
    console.error('Evolution API Error:', error);
    return false;
  }
}
