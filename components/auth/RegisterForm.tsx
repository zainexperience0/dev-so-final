"use client";

import { useState } from "react";
import { Wrapper } from "./Wrapper";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { FormError } from "../FormError";
import { FormSuccess } from "../FormSuccess";
import { Button } from "../ui/button";
import axios from "axios";

export const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [fields, setFields] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form default submission behavior
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("/api/auth/register", fields);
      if (res.status === 200) {
        setSuccess(res.data.success); // Success message from the API
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
      headerLabel="Create an account"
      backButtonLabel="Already have an account?"
      backButtonHref="/auth/login"
      showSocial
    >
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              type="text"
              placeholder="John Doe"
              value={fields.name}
              onChange={(e) => setFields({ ...fields, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="HcE2i@example.com"
              value={fields.email}
              onChange={(e) => setFields({ ...fields, email: e.target.value })}
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
          </div>
        </div>
        {error && <FormError message={error} />}
        {success && <FormSuccess message={success} />}
        <Button type="submit" className="w-full">
          Sign up
        </Button>
      </form>
    </Wrapper>
  );
};
