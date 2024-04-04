import React, { useEffect, useMemo, useRef, useState } from "react";
import { DialogButton } from "@/client/components/system/DialogButton";
import { MaybeError } from "@/client/components/system/MaybeError";
import { log } from "@/shared/logging";

export const DevLogin: React.FunctionComponent<{
  error?: any;
  loggingIn: boolean;
  defaultUsernameOrId?: string;
  onLogin: (usernameOrId: string) => any;
  onCancelPressed: () => any;
}> = ({ error, loggingIn, defaultUsernameOrId, onLogin, onCancelPressed }) => {
  const [usernameOrId, setUsernameOrId] = useState(defaultUsernameOrId || "");
  const [isFlagged, setIsFlagged] = useState(false);
  const [moderationPending, setModerationPending] = useState(false);
  const usernameOrIdField = useRef<HTMLInputElement>(null);

  const checkModeration = async (text: string) => {
    setModerationPending(true);
    try {
      const response = await fetch("/api/moderation", { // Update this line to your Next.js API route
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setIsFlagged(data.flagged); // Adjust according to the response structure
    } catch (error) {
      log.error("Error during moderation check:", error);
      setIsFlagged(false); // Consider how you want to handle errors
    }
    setModerationPending(false);
  };

  useEffect(() => {
    if (usernameOrId) {
      void (async () => {
        await checkModeration(usernameOrId);
      })();
    } else {
      setIsFlagged(false); // Reset when field is cleared
    }
  }, [usernameOrId]);

  const loginDisabled = useMemo(
    () =>
      usernameOrId.length === 0 || loggingIn || isFlagged || moderationPending,
    [usernameOrId, loggingIn, isFlagged, moderationPending]
  );

  useEffect(() => {
    if (usernameOrIdField.current) {
      usernameOrIdField.current.focus();
    }
  }, []);

  return (
    <div className="biomes-box dialog email-sign-in">
      <div className="title-bar">
        <div className="title">Log in</div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!loginDisabled) {
            onLogin(usernameOrId);
          }
        }}
      >
        <div className="dialog-contents">
          <MaybeError error={error} />
          <div className="email-sign-in">
            <section>
              <label>Username (progress may be lost)</label>
              <input
                type="text"
                ref={usernameOrIdField}
                value={usernameOrId}
                placeholder={defaultUsernameOrId || "1234"}
                onChange={(e) => setUsernameOrId(e.target.value)}
              />
              {isFlagged && (
                <div
                  style={{
                    color: "red",
                    fontSize: "1em",
                    marginTop: "0.5em",
                  }}
                >
                  Username invalid
                </div>
              )}
            </section>
          </div>
          <section className="dialog-button-group">
            <DialogButton
              onClick={() => onLogin(usernameOrId + "_temp")} // Add test to username for dev login
              type="primary"
              disabled={loginDisabled}
            >
              {loggingIn ? "Logging in..." : "Login"}
            </DialogButton>
            <DialogButton onClick={onCancelPressed}>Cancel</DialogButton>
          </section>
        </div>
      </form>
    </div>
  );
};
