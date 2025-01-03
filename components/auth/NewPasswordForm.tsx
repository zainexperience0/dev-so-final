"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Wrapper } from "./Wrapper";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { FormError } from "../FormError";
import { Button } from "../ui/button";
import { FormSuccess } from "../FormSuccess";
import axios from "axios";

export const NewPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [fields, setFields] = useState({ password: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios
      .post("/api/auth/new-password", { token, ...fields })
      .then((res) => {
        if (res.status === 200) {
          setSuccess(res.data.success);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || "An unexpected error occurred.");
      });
  };
  return (
    <Wrapper
      headerLabel="Enter a new password"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={fields.password}
              onChange={(e) =>
                setFields({ ...fields, password: e.target.value })
              }
            />
          </div>
        </div>
        <FormError message={error} />
        <FormSuccess message={success} />
        <Button type="submit" className="w-full">
          Reset password
        </Button>
      </form>
    </Wrapper>
  );
};
