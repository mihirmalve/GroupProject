import mailjet from 'node-mailjet';

const mailjetClient = mailjet.apiConnect(
  '45342d1e95d75521aedd1d8f62e310db',
  '03d6d8f6b05c24d338239ef729dfa700'
);

class otpController {
  async sendOtp(req, res) {
    const { email } = req.body;

    try {
      const otp = Math.floor(100000 + Math.random() * 900000);

      const request = mailjetClient
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: "ron47507@gmail.com",
                Name: "DevSquad",
              },
              To: [
                {
                  Email: email,
                },
              ],
              Subject: "Your OTP Code",
              HTMLPart: `<h3>Your OTP is: <strong>${otp}</strong></h3>`,
            },
          ],
        });

      await request;

      res.status(200).json({ message: "OTP sent successfully", otp }); // Remove OTP in production
    } catch (error) {
      console.error("Mailjet OTP error:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  }
}

export default new otpController();