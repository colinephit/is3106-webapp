const sendEmail = async (to, subject, message) => {
    console.log("📬 Simulated email send:");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Message:", message);
  };
  
  module.exports = sendEmail;
  