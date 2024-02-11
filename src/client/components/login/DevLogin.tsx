import React, { useEffect, useMemo, useRef, useState } from "react";
import { DialogButton } from "@/client/components/system/DialogButton";
import { MaybeError } from "@/client/components/system/MaybeError";

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
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer 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", // Replace YOUR_API_KEY with your actual API key
      },
      body: JSON.stringify({ input: text }),
    });

    const data = await response.json();
    setIsFlagged(data.results[0].flagged);
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
              <label>Username or ID</label>
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
              onClick={() => onLogin(usernameOrId)}
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
