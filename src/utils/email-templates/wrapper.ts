import { TUITION_HIGHWAY } from "../contants";

export const email_template = (body: string) => `<html>
<body style="font-family: Arial, sans-serif; background-color: #F3F3F3; font-size: 16px; color: #333333; margin: 0; padding: 0;">
  <div style="max-width: 600px; background-color: #ffffff; padding: 20px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); margin: 0 auto;">
    <div style="text-align: center">
      <img src="https://th-lms.s3.amazonaws.com/logo.png" alt="logo" style="max-width: 200px" />
    </div>
    <!-- Body content -->
    ${body}
    <div style="margin-top: 15px; text-align: center">
      <hr style="width: 80%; margin-top: 2rem" />
      <!-- Footer -->
         <div style="margin-top: 15px; text-align: center">
           <a href="https://www.instagram.com/tuitionhighway/" target="_blank"
             ><img
               src="https://th-lms.s3.amazonaws.com/instagram.png"
               alt="instagram"
               width="24"
               style="margin: 0 3px; border-radius: 50%"
           /></a>
           <a
             href="https://www.linkedin.com/company/tuition-highway/"
             target="_blank"
             ><img
               src="https://th-lms.s3.amazonaws.com/linkedin.png"
               alt="linkedIn"
               width="24"
               style="margin: 0 3px; border-radius: 50%"
           /></a>
           <a href="https://www.facebook.com/tuitionhighway" target="_blank"
             ><img
               src="https://th-lms.s3.amazonaws.com/facebook.png"
               alt="facebook"
               width="24"
               style="margin: 0 3px; border-radius: 50%"
           /></a>
           <a
             href="https://api.whatsapp.com/send/?phone=971563511722&text=&type=phone_number&app_absent=0"
             target="_blank"
             ><img
               src="https://th-lms.s3.amazonaws.com/whatsapp.png"
               alt="whatsApp"
               width="24"
               style="margin: 0 3px; border-radius: 50%"
           /></a>
           <br />
           <p style="margin-top: 0.5rem">&copy; 2023 ${TUITION_HIGHWAY}. All rights reserved.</p>
         </div>
         <!-- Footer -->
    </div>
  </div>
</body>
</html>`;
