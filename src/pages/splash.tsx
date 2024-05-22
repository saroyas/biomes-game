import React, { useEffect, useState } from "react";
import { LoginRelatedController } from "@/client/components/static_site/LoginRelatedController";
import { LoginRelatedControllerContext } from "@/client/components/static_site/LoginRelatedControllerContext";
import { safeDetermineEmployeeUserId } from "@/server/shared/bootstrap/sync";
import Head from "next/head";

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

const InfoSection = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => <div style={{ ...style }}>{children}</div>;

export const SplashPage: React.FunctionComponent<{
  defaultUsernameOrId?: string;
  onLogin?: () => unknown;
}> = ({ defaultUsernameOrId, onLogin }) => {
  const [showVideo, setShowVideo] = useState(false);

  const handleVideoOpen = () => setShowVideo(true);
  const handleVideoClose = () => setShowVideo(false);
  const [hoverStyle, setHoverStyle] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  // Styles
  const mainStyle = {
    display: "flex",
    flexDirection: isMobile ? "column" : "row", // Adjust layout based on screen size
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "1200px",
    margin: "auto",
    paddingTop: "20vh",
    padding: "20px", // Adds space around contents

    width: "100vw", // Ensures the width is always equal to the viewport width
  };

  const mainBackgroundStyle = {
    display: "flex",
    flexDirection: "column",
    width: "100vw", // Ensures the width is always equal to the viewport width
    backgroundImage: isMobile
      ? `linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0)), linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("background2_landscape.png")`
      : `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("background2_landscape.png")`,
    backgroundSize: "cover", // Ensures the gradient and the image cover the full area
    backgroundPosition: "center center", // Centers the gradient and the image
    backgroundRepeat: "no-repeat", // Ensures there's no repetition
  };

  const muckyMonstersBackground = {
    display: "flex",
    flexDirection: "column",
    width: "100vw", // Ensures the width is always equal to the viewport width
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("background_mucky_world.png")`, // Adds a dark overlay
    backgroundSize: "cover, cover, cover", // Ensures both the gradient and the image cover the full area
    backgroundPosition: "center, center, center", // Centers both the gradient and the image
    backgroundRepeat: "no-repeat, no-repeat, no-repeat", // Ensures there's no repetition
  };

  const gameEngineBackground = {
    display: "flex",
    flexDirection: "column",
    width: "100vw", // Ensures the width is always equal to the viewport width
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("background_game_engine.png")`, // Adds a dark overlay
    backgroundSize: "cover, cover, cover", // Ensures both the gradient and the image cover the full area
    backgroundPosition: "center, center, center", // Centers both the gradient and the image
    backgroundRepeat: "no-repeat, no-repeat, no-repeat", // Ensures there's no repetition
  };

  const studioBackground = {
    display: "flex",
    flexDirection: "column",
    width: "100vw", // Ensures the width is always equal to the viewport width
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("background_studio.png")`, // Adds a dark overlay
    backgroundSize: "cover, cover, cover", // Ensures both the gradient and the image cover the full area
    backgroundPosition: "center, center, center", // Centers both the gradient and the image
    backgroundRepeat: "no-repeat, no-repeat, no-repeat", // Ensures there's no repetition
  };

  const textStyle = {
    textAlign: "left",
    maxWidth: isMobile ? "100%" : "600px",
    padding: isMobile ? "20px" : "20px", // Adds space between the text and video on mobile
    color: "#FFFFFF", // Ensures text color is white for better contrast
    textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8)", // Adds a dark shadow for contrast
  };

  const videoStyle = {
    maxWidth: "500px",
    width: "100%",
    cursor: "pointer",
    borderRadius: "45px",
    objectFit: "cover",
    transform: "scale(1.05)", // Example transformation on hover
    transition: "transform 0.3s ease",
    padding: "20px", // Adds space between the text and video on mobile
  };

  // CSS keyframes animation for the floating effect
  const floatingIconAnimation = `
    @keyframes float {
      0% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
      100% {
        transform: translateY(0);
      }
    }
  `;

  // Inject the animation into the document head
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = floatingIconAnimation;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Floating scroll icon style
  // Floating scroll icon style
  const scrollIconStyle = {
    width: "40px",
    height: "40px",
    animation: "float 2s ease-in-out infinite",
    position: "absolute",
    bottom: "20px",
    left: "calc(50% - 20px)", // Adjust for icon's own width to be dead center
    cursor: "pointer",
    zIndex: 30, // Make sure it's above other content
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
        <title>Oasis — A cosy world</title>
      </Head>
      <VideoModal
        isOpen={showVideo}
        videoUrl="https://www.youtube.com/embed/7U6e4JOL94c?si=tnfBEZIqeY3VR-Ci&autoplay=1"
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
                            <img
                              style={videoThumbnailStyle}
                              src="trailer.png"
                              onClick={handleVideoOpen}
                              onMouseEnter={() =>
                                setHoverStyle({ transform: "scale(1.05)" })
                              } // Slightly scale up on hover
                              onMouseLeave={() => setHoverStyle({})} // Return to normal on mouse leave
                            />
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
                          <img
                            src="scroll_icon.png"
                            alt="Scroll Icon"
                            style={scrollIconStyle}
                          />
                        </div>
                      </div>
                    </main>
                  </>
                )}
              </Section>

              <div style={mainBackgroundStyle}>
                <InfoSection>
                  <div style={mainStyle}>
                    <div style={textStyle}>
                      <h1
                        style={{
                          fontSize: "5rem",
                          fontWeight: "bold",
                          marginBottom: "1rem",
                        }}
                      >
                        A Cosy MMO
                      </h1>
                      <p style={{ fontSize: "2rem", lineHeight: "1.5" }}>
                        In Oasis, we wanted the serenity of Minecraft and
                        Stardew Valley while also having the feeling of a
                        living, breathing world like World of Warcraft.
                      </p>
                    </div>
                    <img style={videoStyle} src="cosymmo.png" />
                  </div>
                </InfoSection>
                <InfoSection>
                  <div style={mainStyle}>
                    <img style={videoStyle} src="swimming.png" />

                    <div style={textStyle}>
                      <p style={{ fontSize: "2rem", lineHeight: "1.5" }}>
                        - Get <strong>territory</strong> and design a{" "}
                        <strong>custom NPC Character</strong> after completing{" "}
                        core quest
                        <br />- <strong>Build</strong>,{" "}
                        <strong>forage</strong>, and design your home
                        <br />- Form <strong>guilds</strong> (teams), trade{" "}
                        <strong>resources</strong>, fight{" "}
                        <strong>bosses</strong>
                        <br />- Go on <strong>quests</strong> to defeat the{" "}
                        <strong>mucky monsters</strong>
                        <br />
                      </p>
                    </div>
                  </div>
                </InfoSection>
              </div>
              <div style={muckyMonstersBackground}>
                <InfoSection>
                  <div style={mainStyle}>
                    <div style={textStyle}>
                      <h1
                        style={{
                          fontSize: "2rem",
                          fontWeight: "bold",
                          marginBottom: "1rem",
                        }}
                      >
                        The Mucky Monsters
                      </h1>

                      <p style={{ fontSize: "2rem", lineHeight: "1.5" }}>
                        You wake up in a giant open world invaded by cute mushy
                        monsters.
                      </p>
                      <br />
                      <p style={{ fontSize: "2rem", lineHeight: "1.5" }}>
                        But don’t be fooled. These cute mushes have ravaged
                        almost everything - covering the world with a strange
                        purple muck.
                      </p>
                      <br />
                      <p style={{ fontSize: "2rem", lineHeight: "1.5" }}>
                        <strong>What’s more, they bite!</strong>
                      </p>
                    </div>
                    <img style={videoStyle} src="muckymonsters.png" />
                  </div>
                </InfoSection>
                <InfoSection>
                  <div style={mainStyle}>
                    <div style={textStyle}>
                      <h1
                        style={{
                          fontSize: "2rem",
                          fontWeight: "bold",
                          marginBottom: "1rem",
                        }}
                      >
                        The Collective
                      </h1>

                      <p style={{ fontSize: "2rem", lineHeight: "1.5" }}>
                        The Collective - a straggling bunch of survivors - has
                        managed to save a few neighbourhoods.
                      </p>
                      <br />
                      <p style={{ fontSize: "2rem", lineHeight: "1.5" }}>
                        But they need need your help. There’s so much to rebuild
                        and those purple monsters are still quite the mystery.
                      </p>
                    </div>
                    <img style={videoStyle} src="collective.png" />
                  </div>
                </InfoSection>
              </div>
              <div style={gameEngineBackground}>
                <InfoSection>
                  <div style={mainStyle}>
                    <div style={textStyle}>
                      <h1
                        style={{
                          fontSize: "2rem",
                          fontWeight: "bold",
                          marginBottom: "1rem",
                        }}
                      >
                        Art, Creativity and The Game Engine
                      </h1>
                      <p
                        style={{
                          fontSize: "2rem",
                          lineHeight: "1.5",
                        }}
                      >
                        The voxel art style comes from our love of virtual
                        sandcastles. We wanted building to be a central game
                        mechanic.
                      </p>
                      <br />
                      <p
                        style={{
                          fontSize: "2rem",
                          lineHeight: "1.5",
                        }}
                      >
                        But we haven’t just hashed together your typical 3D lego
                        blocks. <br />
                      </p>
                      <br />
                      <p
                        style={{
                          fontSize: "2rem",
                          lineHeight: "1.5",
                        }}
                      >
                        To give you a beautiful canvas - we pushed technical
                        boundaries in the voxel genre’s aesthetic.
                        <br />
                        Our game engine captures the glow of soft light; the
                        rustling of tree leaves; the translucence of water
                        bodies - we indulged in the details.
                      </p>
                      <br />
                      <p
                        style={{
                          fontSize: "2rem",
                          lineHeight: "1.5",
                        }}
                      >
                        To do this, we developed a custom engine for Oasis.
                        Built using three, react and next - all open-source
                        javascript libraries. We freed ourselves from the closed
                        source monopolies Unity and Unreal; as well as letting
                        Oasis be an early example of streamed-gaming - where
                        even the lightest laptops can play.
                      </p>
                    </div>
                  </div>
                </InfoSection>
              </div>
              <div style={studioBackground}>
                <InfoSection>
                  <div style={mainStyle}>
                    <div style={textStyle}>
                      <h1
                        style={{
                          fontSize: "2rem",
                          fontWeight: "bold",
                          marginBottom: "1rem",
                        }}
                      >
                        Passion, Money and The Community
                      </h1>
                      <p
                        style={{
                          fontSize: "2rem",
                          lineHeight: "1.5",
                        }}
                      >
                        I left my job last year and founded Silicon Soul
                        studios.
                      </p>
                      <br />
                      <p
                        style={{
                          fontSize: "2rem",
                          lineHeight: "1.5",
                        }}
                      >
                        Although we're still a one-man studio (with occasional
                        help from friends) - this is our first production.
                      </p>
                      <br />
                      <p
                        style={{
                          fontSize: "2rem",
                          lineHeight: "1.5",
                        }}
                      >
                        Oasis is a joy to work on, and I’m proud to make it{" "}
                        <strong>free</strong>.
                      </p>

                      <br />
                      <p
                        style={{
                          fontSize: "2rem",
                          lineHeight: "1.5",
                        }}
                      >
                        That’s free free. No in-game transactions. No adverts.
                      </p>
                      <br />
                      <p
                        style={{
                          fontSize: "2rem",
                          lineHeight: "1.5",
                        }}
                      >
                        If you do find joy in Oasis, and want to support us,
                        consider joining our Patreon:
                      </p>
                      <br />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "6rem",
                          marginBottom: "2rem",
                        }}
                      >
                        <a
                          href="https://www.patreon.com/OasisRealm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src="patreon_logo.png"
                            alt="Patreon Icon"
                            style={{
                              maxWidth: "60px",
                              height: "auto",
                              borderRadius: "10px",
                            }}
                          />
                        </a>
                      </div>
                      <p
                        style={{
                          fontSize: "2rem",
                          lineHeight: "1.5",
                        }}
                      >
                        And if you have an idea, or just want to say hi, pop me
                        a message on either Discord or Instagram - these often
                        make my day!
                      </p>
                      <br />

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "6rem",
                          marginBottom: "2rem",
                        }}
                      >
                        <a
                          href="https://discord.com/invite/suttC9A6yJ"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src="discord_logo.png"
                            alt="Discord Icon"
                            style={{
                              maxWidth: "50px",
                              height: "auto",
                              borderRadius: "10px",
                            }}
                          />
                        </a>
                        <a
                          href="https://www.instagram.com/oasisrealm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src="insta_logo.png"
                            alt="Instagram Icon"
                            style={{
                              maxWidth: "50px",
                              height: "auto",
                              borderRadius: "10px",
                            }}
                          />
                        </a>
                      </div>

                      <p
                        style={{
                          fontSize: "2rem",
                          lineHeight: "1.5",
                        }}
                      >
                        Yours,
                        <br />
                        Saros - dev at Silicon Soul
                      </p>
                      <br />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginBottom: "1rem",
                          marginTop: "2rem",
                        }}
                      >
                        <a
                          href="https://siliconsoul.xyz/info"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "inline-block" }}
                        >
                          <img
                            src="silicon_soul_logo.png"
                            alt="Silicon Soul Logo"
                            style={{
                              maxWidth: "100px",
                              height: "auto",
                              borderRadius: "10px",
                              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                            }}
                          />
                        </a>
                      </div>
                      <div
                        style={{
                          fontSize: "1rem",
                          color: "#fff",
                          opacity: 0.7,
                          textAlign: "center",
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
                </InfoSection>
              </div>
            </>
          )}
        </LoginRelatedControllerContext.Consumer>
      </LoginRelatedController>
    </div>
  );
};

export default SplashPage;
