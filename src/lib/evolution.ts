export async function sendWhatsAppOTP(
  instanceName: string, 
  apiKey: string, 
  mobileNumber: string, 
  otpCode: string
) {
  // The Evolution API endpoint for sending text messages
  const url = `https://api.evolution.example.com/message/sendText/${instanceName}`;
  
  const message = `Welcome to Salonera! \nYour verification code is: *${otpCode}*\nDo not share this code with anyone.`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: mobileNumber,
        options: {
          delay: 1200,
          presence: 'composing' // Shows "typing..." indicator for realism
        },
        textMessage: {
          text: message
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Evolution API Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to send OTP via WhatsApp:', error);
    throw error;
  }
}
