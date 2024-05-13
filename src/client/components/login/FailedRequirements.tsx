import { DialogButton } from "@/client/components/system/DialogButton";
import {
  MiniPhoneCloseItem,
  MiniPhoneMoreItem,
} from "@/client/components/system/mini_phone/MiniPhoneMoreItem";
import React from "react";

export const FailedRequirements: React.FunctionComponent<{
  onOkay: () => unknown;
  onWaitlist: () => unknown;
  onTryAnyway: () => unknown;
}> = ({ onOkay, onTryAnyway }) => {
  const handleOpenDiscord = () => {
    window.open(
      "https://discord.com/invite/suttC9A6yJ",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleOpenInstagram = () => {
    window.open(
      "https://www.instagram.com/oasisrealm",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="biomes-box dialog">
      <div className="title-bar">
        <div className="invisible">
          <MiniPhoneCloseItem />
        </div>
        <div className="title">We&apos;re not on Mobile yet</div>
        <div>
          <MiniPhoneMoreItem onClick={() => onTryAnyway()} />
        </div>
      </div>
      <div className="dialog-contents text-center">
        <p>Try Oasis on Desktop!</p>
        <p>Just visit www.oasis-realm.com</p>
        <footer className="dialog-button-group">
          <DialogButton type="primary" onClick={handleOpenDiscord}>
            <div style={{ display: "inline-flex", alignItems: "center" }}>
              Join Discord
            </div>
          </DialogButton>
          <DialogButton type="primary" onClick={handleOpenInstagram}>
            <div style={{ display: "inline-flex", alignItems: "center" }}>
              Join Instagram
            </div>
          </DialogButton>
          <DialogButton onClick={onOkay}>Cancel</DialogButton>
        </footer>
      </div>
    </div>
  );
};
