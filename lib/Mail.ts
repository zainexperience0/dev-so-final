"use server"
import nodemailer from 'nodemailer'

interface MailProps {
    to: string
    subject: string
    html: string
}

const domain = process.env.NEXT_PUBLIC_APP_URL

export const onMail = ({ to, subject, html }: MailProps) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        }
    })

    const mailOptions = {
        from: {
            name: "dev.so Community",
            address: "devcommunity@gmail.com"
        },
        to,
        subject,
        html
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response)
        }
    })
} 