"use client";

import { useState } from "react";
import { Wrapper } from "./Wrapper";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { FormError } from "../FormError";
import { FormSuccess } from "../FormSuccess";
import { Button } from "../ui/button";
import axios from "axios";

export const ResetForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [fields, setFields] = useState({ email: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form default submission

    // Clear previous messages
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("/api/auth/reset", fields);
      setSuccess(res.data.success);
    } catch (err: any) {
      setError(err.response?.data?.error || "An unexpected error occurred.");
    }
  };

  return (
    <Wrapper
      headerLabel="Forgot your password?"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={fields.email}
              onChange={(e) => {
                setFields({ ...fields, email: e.target.value });
                setError(""); // Clear error when user starts typing
                setSuccess(""); // Clear success message when user starts typing
              }}
            />
          </div>
        </div>
        {error && <FormError message={error} />}
        {success && <FormSuccess message={success} />}
        <Button type="submit" className="w-full">
          Send reset email
        </Button>
      </form>
    </Wrapper>
  );
};
