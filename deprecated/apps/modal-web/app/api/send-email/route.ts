import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export interface SendEmailRequestBody {
  subject: string;
  text: string;
  to: string;
}

export async function POST(request: Request) {
  const { subject, text, to }: SendEmailRequestBody = await request.json();

  if (!subject || !text || !to) {
    return NextResponse.json(
      {
        error: "Missing email parameters",
      },
      { status: 400 },
    );
  }

  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER, // Your Gmail address
      pass: process.env.GMAIL_PASS, // Your Gmail password or App password
    },
  });

  // Define email options
  const mailOptions = {
    from: process.env.GMAIL_USER, // sender address
    to, // list of receivers
    subject, // Subject line
    text, // plain text body
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Email could not be sent: ${JSON.stringify(error)}` },
      { status: 500 },
    );
  }
}
