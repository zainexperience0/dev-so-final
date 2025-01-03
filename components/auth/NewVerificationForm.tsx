"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Wrapper } from "./Wrapper";
import { BeatLoader } from "react-spinners";
import { FormSuccess } from "../FormSuccess";
import { FormError } from "../FormError";
import axios from "axios";

export const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (success || error) return; // Prevent multiple submissions

    if (!token) {
      setError("Missing token!");
      return;
    }

    axios
      .post("/api/auth/new-verification", { token })
      .then((res) => {
        setSuccess(res.data.message);
        router.push("/auth/login");
        // Use the "message" field from the API response
      })
      .catch((err) => {
        setError(err.response?.data?.error || "An unexpected error occurred.");
      });
  }, [token, success, error, router]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <Wrapper
      headerLabel="Confirming your verification"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <div className="flex items-center w-full justify-center">
        {!success && !error && <BeatLoader />}
        {success && <FormSuccess message={success} />}
        {error && <FormError message={error} />}
      </div>
    </Wrapper>
  );
};
