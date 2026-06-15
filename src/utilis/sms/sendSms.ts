
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);


export const sendSms = async ({ to, message }: { to: string; message: string }) => {
    // let formattedNumber = to.trim();

   
    // if (!formattedNumber.startsWith('+')) {
  
    //     if (formattedNumber.startsWith('0')) {
    //         formattedNumber = `+20${formattedNumber.slice(1)}`;
    //     } else {
    //         formattedNumber = `+20${formattedNumber}`;
    //     }
    // }

    // const twilioNumber = process.env.TWILIO_PHONE_NUMBER as string;
    // if (formattedNumber === twilioNumber.trim()) {
    //     console.warn(`⚠️ Blocked dispatch: Recipient matching sender ID.`);
    //     return; 
    // }

    // await client.messages.create({
    //     body: message,
    //     from: twilioNumber,
    //     to: formattedNumber 
    // });

    console.log({to , message});
    
};