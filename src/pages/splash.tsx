import React, { useState } from "react";
import { LoginRelatedController } from "@/client/components/static_site/LoginRelatedController";
import { LoginRelatedControllerContext } from "@/client/components/static_site/LoginRelatedControllerContext";
import { safeDetermineEmployeeUserId } from "@/server/shared/bootstrap/sync";
import Head from "next/head";
import { motion } from 'framer-motion';


const DynamicBackgroundVideo = ({ src }: { src: string }) => {
  return (
    <img
      src={src} // Using the src prop to dynamically set the image source
      alt="Background"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
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
        src={`${videoUrl}`} // Ensure autoplay triggers when modal opens
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
  const [hoverStyle, setHoverStyle] = useState({});

  // Video thumbnail with similar styling and interaction as the image
  const videoThumbnailStyle = {
    maxWidth: "300px", // Ensures the video does not exceed 300px in width
    width: "100%", // Responsive width
    cursor: "pointer",
    borderRadius: "15px", // Rounded corners for the video
    transition: "transform 0.3s ease", // Smooth transition for hover effect
    objectFit: "cover", // Ensures the video covers the area without distortion
    ...hoverStyle, // Dynamic styles for hover effects
  };

  // Container to center the video thumbnail
  const thumbnailContainerStyle = {
    position: "relative",
    textAlign: "center",
    display: "flex",
    justifyContent: "center", // Horizontally center the thumbnail
    alignItems: "center", // Vertically center the thumbnail
  };

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
        videoUrl="https://www.youtube.com/embed/LeqS7HhrIZs?si=3JL15x3QCwBCD-pw&autoplay=1"
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
                  <DynamicBackgroundVideo src="mainBackground.png" />
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
                          <div style={thumbnailContainerStyle}>
                            <video
                              autoPlay
                              muted
                              loop
                              style={videoThumbnailStyle}
                              onClick={handleVideoOpen}
                              onMouseEnter={() =>
                                setHoverStyle({ transform: "scale(1.05)" })
                              } // Slightly scale up on hover
                              onMouseLeave={() => setHoverStyle({})} // Return to normal on mouse leave
                            >
                              <source src="trailer.mp4" type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
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
                  </>
                )}
              </Section>
            </>
          )}
        </LoginRelatedControllerContext.Consumer>
      </LoginRelatedController>
    </div>
  );
};

export default SplashPage;
