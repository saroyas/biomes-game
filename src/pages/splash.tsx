import React, { useEffect, useState } from "react";
import { LoginRelatedController } from "@/client/components/static_site/LoginRelatedController";
import { LoginRelatedControllerContext } from "@/client/components/static_site/LoginRelatedControllerContext";
import { safeDetermineEmployeeUserId } from "@/server/shared/bootstrap/sync";
import Head from "next/head";

const DynamicBackgroundVideo = () => {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Function to update the state based on the window width
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Set the threshold for mobile devices
    };

    // Call handleResize initially and whenever the window resizes
    handleResize();
    window.addEventListener("resize", handleResize);

    // Cleanup function to remove event listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    return (
      <img
        src="mainBackground.png" // Replace with your mobile-specific image source
        alt="Background"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    );
  }

  // Fallback to video for non-mobile devices
  return (
    <video
      autoPlay
      muted
      loop
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    >
      <source src="trailer.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

const VideoModal = ({
  isOpen,
  videoUrl,
  onClose,
}: {
  isOpen: boolean;
  videoUrl: string;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <iframe
        src={videoUrl}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ width: "80%", height: "80%" }}
      ></iframe>
    </div>
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

const Section = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => <div style={{ minHeight: "100vh", ...style }}>{children}</div>;

export const SplashPage: React.FunctionComponent<{
  defaultUsernameOrId?: string;
  onLogin?: () => unknown;
}> = ({ defaultUsernameOrId, onLogin }) => {
  const [showVideo, setShowVideo] = useState(false);

  const handleVideoOpen = () => setShowVideo(true);
  const handleVideoClose = () => setShowVideo(false);

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
      <VideoModal
        isOpen={showVideo}
        videoUrl="https://www.youtube.com/embed/LeqS7HhrIZs?si=3JL15x3QCwBCD-pw"
        onClose={handleVideoClose}
      />

      <LoginRelatedController
        defaultUsernameOrId={defaultUsernameOrId}
        onLogin={onLogin}
      >
        <LoginRelatedControllerContext.Consumer>
          {(loginRelatedControllerContext) => (
            <>
              <Section>
                {/* Splash section with video background */}
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
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      zIndex: 2,
                    }}
                  ></div>
                </div>
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
                          <div
                            style={{
                              position: "relative",
                              textAlign: "center",
                              marginTop: "20px",
                            }}
                          >
                            <img
                              src="mainBackground.png" // Your video thumbnail image
                              alt="Watch Video"
                              style={{ width: "100%", cursor: "pointer" }}
                              onClick={handleVideoOpen}
                            />
                            <button
                              onClick={handleVideoOpen}
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                fontSize: "30px",
                                color: "#FFF",
                                background: "rgba(0, 0, 0, 0.5)",
                                border: "none",
                                borderRadius: "50%",
                                padding: "15px 30px",
                                cursor: "pointer",
                              }}
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                      </div>
                    </main>
                  </>
                )}
              </Section>

              <Section style={{ background: "#f0f0f0" }}>
                {/* About section */}
                <div style={{ textAlign: "center", padding: "20vh 20px" }}>
                  <h1>About Oasis</h1>
                  <p>
                    Learn more about our virtual world where you can forage,
                    build, and battle in a rich, evolving environment.
                  </p>
                </div>
              </Section>
            </>
          )}
        </LoginRelatedControllerContext.Consumer>
      </LoginRelatedController>
    </div>
  );
};

export default SplashPage;
