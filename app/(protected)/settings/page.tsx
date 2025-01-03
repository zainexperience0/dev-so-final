"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FormError } from "@/components/FormError";
import { FormSuccess } from "@/components/FormSuccess";
import { Button } from "@/components/ui/button";
import axios from "axios";

const Settings = () => {
  const user = useCurrentUser();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const { update } = useSession();
  const [fields, setFields] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    isTwoFactorEnabled: user?.isTwoFactorEnabled || false,
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined); // Reset error state
    setSuccess(undefined); // Reset success state

    try {
      const response = await axios.post("/api/auth/settings", fields);

      if (response.status === 200) {
        update(); // Update session
        setSuccess(response.data.success); // Show success message
      } else if (response.status === 400) {
        setError(response.data.error); // Show error message
      }
    } catch (err) {
      setError("Something went wrong. Please try again."); // Generic error message
    }
  };

  return (
    <Card className="w-[600px]">
      <CardHeader>
        <p className="text-2xl font-semibold text-center">⚙️ Settings</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                type="text"
                value={fields.name}
                onChange={(e) => setFields({ ...fields, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Username</Label>
              <Input
                type="text"
                value={fields.username}
                onChange={(e) =>
                  setFields({ ...fields, username: e.target.value })
                }
              />
            </div>
            {user?.isOAuth === false && (
              <>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
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
                    value={fields.password}
                    onChange={(e) =>
                      setFields({ ...fields, password: e.target.value })
                    }
                  />
                </div>
              </>
            )}
            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
              </div>
              <Switch
                checked={fields.isTwoFactorEnabled}
                onCheckedChange={(e) =>
                  setFields({ ...fields, isTwoFactorEnabled: e })
                }
              />
            </div>
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Settings;
