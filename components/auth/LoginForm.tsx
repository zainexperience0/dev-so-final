"use client";

import { useState } from "react";
import { Wrapper } from "./Wrapper";
import axios from "axios";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { FormError } from "../FormError";
import { FormSuccess } from "../FormSuccess";
import { Button } from "../ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import Link from "next/link";

const LoginForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const router = useRouter();
  const [success, setSuccess] = useState<string | undefined>("");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email already in use with different provider!"
      : "";

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [fields, setFields] = useState({
    email: "",
    password: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form default submission behavior
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("/api/auth/login", fields);
      if (res.status === 200) {
        setSuccess(res.data.success); // Success message from the API
        setTimeout(() => {
          router.push(callbackUrl || "/");
        }, 2000);
      }
    } catch (err: any) {
      if (err.response) {
        // Handle known API errors
        setError(err.response.data.error || "An error occurred.");
      } else {
        // Handle unexpected errors
        setError("Something went wrong. Please try again later.");
      }
    }
  };
  return (
    <Wrapper
      headerLabel="Welcome back"
      backButtonLabel="Don't have an account?"
      backButtonHref="/auth/register"
      showSocial
    >
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="space-y-4">
          {showTwoFactor && (
            <div>
              <Label>Verification Code</Label>
              <InputOTP maxLength={6}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          )}
          {!showTwoFactor && (
            <>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="HcE2i@example.com"
                  value={fields.email}
                  onChange={(e) =>
                    setFields({ ...fields, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="********"
                  value={fields.password}
                  onChange={(e) =>
                    setFields({ ...fields, password: e.target.value })
                  }
                />
                <Button
                  size="sm"
                  variant="link"
                  asChild
                  className="px-0 font-normal"
                >
                  <Link href="/auth/reset">Forgot password?</Link>
                </Button>
              </div>
            </>
          )}
        </div>
        {error && <FormError message={error} />}
        {success && <FormSuccess message={success} />}
        <Button type="submit" className="w-full">
          {showTwoFactor ? "Confirm" : "Login"}
        </Button>
      </form>
    </Wrapper>
  );
};

export default LoginForm;
