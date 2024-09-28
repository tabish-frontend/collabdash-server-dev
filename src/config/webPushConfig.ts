// webPushConfig.ts
const webPush = require("web-push");

// Configure web-push with your VAPID keys
webPush.setVapidDetails(
  "mailto:thdev4.2@gmail.com", // Your email
  process.env.VAPID_PUBLIC_KEY!, // Your VAPID public key
  process.env.VAPID_PRIVATE_KEY! // Your VAPID private key
);

export default webPush;
