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
      "https://discord.com/invite/your-discord-link",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleOpenInstagram = () => {
    window.open(
      "https://www.instagram.com/your-instagram-profile",
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
        <div className="">
          <MiniPhoneMoreItem onClick={() => onTryAnyway()} />
        </div>
      </div>
      <div className="dialog-contents text-center">
        <p>Try Oasis on Desktop!</p>
        <p>Just visit www.oasis-realm.com</p>
        <footer className="dialog-button-group">
          <DialogButton type="primary" onClick={handleOpenDiscord}>
            <img
              src="discord-2-128.ico"
              alt="Discord Icon"
              style={{ width: "8px", height: "8px", marginRight: "8px" }}
            />
            Join Discord
          </DialogButton>
          <DialogButton type="primary" onClick={handleOpenInstagram}>
            <img
              src="instagram-128.ico"
              alt="Instagram Icon"
              style={{ width: "8px", height: "8px", marginRight: "8px" }}
            />
            Join Instagram
          </DialogButton>
          <DialogButton
            onClick={() => {
              onOkay();
            }}
          >
            Cancel
          </DialogButton>
        </footer>
      </div>
    </div>
  );
};
