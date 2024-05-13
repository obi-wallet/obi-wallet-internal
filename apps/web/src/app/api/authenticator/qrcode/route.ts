import QRCode from "qrcode";
import speakeasy from "speakeasy";

export async function GET(): Promise<Response> {
  const secret = speakeasy.generateSecret({
    name: "Obi",
  });
  const qrcode = await QRCode.toDataURL(secret.otpauth_url as string);
  return Response.json({
    qrcode,
    secret: secret.base32,
  });
}
