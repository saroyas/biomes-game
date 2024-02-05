import styles from "@/client/styles/new_site.module.css";
import React, { useEffect, useRef, useState } from "react";

import { WakeupMuckParticles } from "@/client/components/Particles";
import { LoginRelatedController } from "@/client/components/static_site/LoginRelatedController";
import { LoginRelatedControllerContext } from "@/client/components/static_site/LoginRelatedControllerContext";
import { SplashHeader } from "@/client/components/static_site/SplashHeader";
import { safeDetermineEmployeeUserId } from "@/server/shared/bootstrap/sync";

import Head from "next/head";

export const getServerSideProps = async () => {
  return {
    props: {
      defaultUsernameOrId: (await safeDetermineEmployeeUserId()) ?? "",
      primaryCTA: CONFIG.primaryCTA,
    },
  };
};

// Style objects for the component
const styles2 = {
  fullScreenContainer: {
    height: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    backgroundColor: "#1C0D28",
    position: "relative",
    overflow: "hidden",
  },
  splashOverlay: {
    zIndex: 2,
    padding: "20px",
    textAlign: "center",
  },
  contentWrapper: {
    maxWidth: "600px",
    margin: "0 auto",
    paddingTop: "20vh",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  subtitle: {
    fontSize: "1.25rem",
    marginBottom: "2rem",
    lineHeight: "1.5",
  },
  primaryButton: {
    fontSize: "1.25rem",
    padding: "10px 20px",
    backgroundColor: "#FFA500",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    color: "#1C0D28",
    marginBottom: "2rem",
  },
  footerText: {
    fontSize: "1rem",
    color: "#fff",
    opacity: 0.7,
  },
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
    <>
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
              <WakeupMuckParticles />
              {/* Use the showingModal state to conditionally render content */}
              {!loginRelatedControllerContext.showingModal && (
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
                      The worlds first space designed for both AI and Humans.
                      <br />
                      Explore this new world straight from your browser.
                      <br />
                      Join our exclusive friends-only release.
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        padding: "20px",
                      }}
                    >
                      <EnterOasisButton
                        onLoginClick={loginRelatedControllerContext.showLogin}
                      />
                    </div>
                    <div
                      style={{ fontSize: "1rem", color: "#fff", opacity: 0.7 }}
                    >
                      Brought to you by{" "}
                      <a
                        href="https://siliconsoul.xyz"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Silicon Soul
                      </a>
                      .
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </LoginRelatedControllerContext.Consumer>
      </LoginRelatedController>
    </>
  );
};

export default SplashPage;
