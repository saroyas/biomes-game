import React, { useEffect, useState } from "react";
import { LoginRelatedController } from "@/client/components/static_site/LoginRelatedController";
import { LoginRelatedControllerContext } from "@/client/components/static_site/LoginRelatedControllerContext";
import { safeDetermineEmployeeUserId } from "@/server/shared/bootstrap/sync";

import Head from "next/head";

const DynamicBackgroundVideo = () => {
  const [videoSrc, setVideoSrc] = useState("");

  useEffect(() => {
    // Dynamically set the video source after component mounts
    setVideoSrc("trailer.mp4");
  }, []);

  if (!videoSrc) return null; // Render nothing or a placeholder until videoSrc is set

  return (
    <video
      autoPlay
      muted
      loop
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    >
      <source src={videoSrc} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export const getServerSideProps = async () => {
  return {
    props: {
      defaultUsernameOrId: (await safeDetermineEmployeeUserId()) ?? "",
      primaryCTA: CONFIG.primaryCTA,
    },
  };
};

// Style for the button in its default state
const defaultButtonStyle = {
  padding: "15px 30px",
  fontSize: "18px",
  fontWeight: "bold",
  color: "#FFFFFF",
  background: "linear-gradient(145deg, #9D50BB, #6E48AA)",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
  transition: "all 0.3s ease",
};

// Style modifications for the hover state
const hoverButtonStyle = {
  ...defaultButtonStyle,
  background: "linear-gradient(145deg, #6E48AA, #9D50BB)",
  boxShadow: "0 6px 8px rgba(0, 0, 0, 0.3)",
};

// Style modifications for the active (clicked) state
const activeButtonStyle = {
  ...defaultButtonStyle,
  background: "linear-gradient(145deg, #5E378A, #8D4BA0)",
  boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.2)",
};

// Button component
const EnterOasisButton = ({ onLoginClick }: { onLoginClick: () => void }) => {
  const [buttonStyle, setButtonStyle] = useState(defaultButtonStyle);

  return (
    <button
      style={buttonStyle}
      onMouseEnter={() => setButtonStyle(hoverButtonStyle)}
      onMouseLeave={() => setButtonStyle(defaultButtonStyle)}
      onMouseDown={() => setButtonStyle(activeButtonStyle)}
      onMouseUp={() => setButtonStyle(hoverButtonStyle)}
      onClick={onLoginClick}
    >
      Enter Oasis
    </button>
  );
};

export const SplashPage: React.FunctionComponent<{
  defaultUsernameOrId?: string;
  onLogin?: () => unknown;
}> = ({ defaultUsernameOrId, onLogin }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh", // Ensure the container takes at least the full height of the viewport
      }}
    >
      <Head>
        <meta name="theme-color" content="#1C0D28" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Oasis — A new world</title>
      </Head>
      <LoginRelatedController
        defaultUsernameOrId={defaultUsernameOrId}
        onLogin={onLogin}
      >
        <LoginRelatedControllerContext.Consumer>
          {(loginRelatedControllerContext) => (
            <>
              {/* Background video */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  zIndex: -1,
                }}
              >
                <DynamicBackgroundVideo />
                {/* Dark translucent overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)", // Adjust opacity as needed
                    zIndex: 2, // Ensure it's above the video but below everything else
                  }}
                ></div>
              </div>
              {/* <WakeupMuckParticles /> */}
              {/* Use the showingModal state to conditionally render content */}
              {!loginRelatedControllerContext.showingModal && (
                <>
                  <main style={{ flexGrow: 1 }}>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          maxWidth: "600px",
                          margin: "0 auto",
                          paddingTop: "20vh",
                        }}
                      >
                        <h1
                          style={{
                            fontSize: "2.5rem",
                            fontWeight: "bold",
                            marginBottom: "1rem",
                          }}
                        >
                          Welcome to Oasis
                        </h1>
                        <p
                          style={{
                            fontSize: "1.25rem",
                            marginBottom: "2rem",
                            lineHeight: "1.5",
                          }}
                        >
                          A cozy voxel-based universe
                          <br />
                          Forage, build, and fight monsters with friends.
                          <br />A collaborative adventure filled with mystery
                          and wonder.
                        </p>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            padding: "20px",
                          }}
                        >
                          <EnterOasisButton
                            onLoginClick={
                              loginRelatedControllerContext.showLogin
                            }
                          />
                        </div>
                        <div
                          style={{
                            fontSize: "1rem",
                            color: "#fff",
                            opacity: 0.7,
                          }}
                        >
                          Brought to you by{" "}
                          <a
                            href="https://siliconsoul.xyz/info"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Silicon Soul
                          </a>{" "}
                          studios.
                        </div>
                      </div>
                    </div>
                  </main>
                  <FooterComponent />
                </>
              )}
            </>
          )}
        </LoginRelatedControllerContext.Consumer>
      </LoginRelatedController>
    </div>
  );
};

export default SplashPage;
