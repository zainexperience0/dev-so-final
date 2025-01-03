import { onMail } from "../Mail"


const domain = process.env.NEXT_PUBLIC_APP_URL

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
    onMail({
        to: email,
        subject: "Two-factor authentication",
        html: `<p>Two-factor authentication code: ${token}</p>`
    })
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
    onMail({
        to: email,
        subject: "Password reset",
        html: `<p>Click <a href="${domain}/auth/new-password?token=${token}">here</a> to reset your password.</p>`
    })
}

export const sendVerificationEmail = async (email: string, token: string) => {
    const confirmLink = `${domain}/auth/new-verification?token=${token}`
    onMail({
        to: email,
        subject: "Email verification",
        html: `<p>Click <a href="${confirmLink}">here</a> to verify your email.</p>`
    })
}