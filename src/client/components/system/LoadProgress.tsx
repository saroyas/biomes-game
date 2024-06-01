import { choose } from "@/shared/util/helpers";
import { progressSummary } from "@/client/game/load_progress";
import type { LoadProgress } from "@/client/game/load_progress";
import { reportClientError } from "@/client/util/request_helpers";
import LoadingContentPreview from "@/pages/new-loading";
import * as _ from "lodash";
import { entriesIn } from "lodash";
import type { ReactNode } from "react";
import React, { useEffect, useMemo, useState } from "react";
import { useClientContext } from "@/client/components/contexts/ClientContextReactContext";
import { respawn } from "@/client/game/util/warping";

function progressDetails(loadProgress: LoadProgress): string[] {
  if (!loadProgress.startedLoading) {
    return ["Downloading..."];
  }
  if (!loadProgress.earlyContextLoader) {
    return ["Waiting for early context."];
  }
  if (!loadProgress.earlyContextLoader.loaded) {
    return [
      "Loading early context:",
      ...Array.from(
        entriesIn(loadProgress.earlyContextLoader.timing),
        ([key, time]) => `${key}: ${time.toFixed(3)}ms`
      ),
    ];
  }
  return [
    `Connection to server: ${loadProgress.channelStats.status}`,
    `Messages received: ${loadProgress.channelStats.receivedMessages}`,
    `Bytes downloaded: ${prettyMb(loadProgress.channelStats.receivedBytes)}`,
    `Entities loaded: ${loadProgress.entitiesLoaded}`,
    `Player mesh loaded: ${loadProgress.playerMeshLoaded}`,
    `Terrain mesh loaded: ${loadProgress.terrainMeshLoaded}`,
    `Scene frames rendered: ${loadProgress.sceneRendered}`,
  ];
}

const MEGABYTE = 1024 * 1024;
function prettyMb(bytes: number) {
  return `${(bytes / MEGABYTE).toFixed(2)} MB`;
}

// Tracks whether or not the current load has been in the same state for a
// long time or not. This works by checking if the progress *details* have
// in a set amount of time..  So if the user is slowly downloading data, this
// indicator will not appear.
function loadStaleChecks(progress: LoadProgress) {
  const [previousProgress, setPreviousProgress] = useState(progress);
  if (!_.isEqual(progress, previousProgress)) {
    setPreviousProgress(progress);
  }
  const [progressStaleTimeout, setProgressStaleTimeout] = useState<
    ReturnType<typeof setTimeout> | undefined
  >();
  const [staleProgress, setStaleProgress] = useState<
    LoadProgress | undefined
  >();

  useEffect(() => {
    const TIME_UNTIL_STALE_SECONDS = 10;
    if (progressStaleTimeout) {
      clearTimeout(progressStaleTimeout);
    }
    const newTimeout = setTimeout(() => {
      setStaleProgress((p) => {
        if (!p) {
          reportClientError(
            "LongLoad",
            `Load screen stuck at "${progressSummary(
              previousProgress
            )}" for >= ${TIME_UNTIL_STALE_SECONDS}s.`,
            {
              staleProgress: previousProgress,
            }
          );
        }
        return previousProgress;
      });
    }, TIME_UNTIL_STALE_SECONDS * 1000);
    setProgressStaleTimeout(newTimeout);
    return () => clearTimeout(newTimeout);
  }, [previousProgress]);

  return staleProgress;
}

export const tips = [
  "Tip: Use a Pick when mining ores and stone or you'll be left with nothing but Cobblestone",
  "Tip: Press [ESC] for the game menu and to scroll through chat",
  "Tip: When chopping wood, don't forget to use an Axe",
  "Tip: To escape a deep cave or to get back home, use your Homestone",
  "Tip: When people warp to your photos you receive a share of their warping fee",
  "Tip: Press [R] to quickly open your Crafting window",
  "Tip: Complete quests to unlock secret recipes and special items",
  "Tip: Lost? Use [M] to bring up a map of the world",
  "Tip: Press [T] for first-person view",
  "Saying: Folly of my kind, there's always a yearning for more.",
  "Saying: We speak the right words. Then we create life itself out of chaos.",
  "Saying: They already know who they are. They're here because they want a glimpse of who they could be.",
  "Saying: But, of course, the peacock can barely fly.",
  "Saying: Evolution forged the entirety of sentient life on this planet using only one tool… The mistake.",
  "Saying: There is no threshold that makes us greater than the sum of our parts.",
];

// Add an array of sayings
export const sayings = [
  "Patience is a virtue.",
  "The early bird catches the worm.",
  "Actions speak louder than words.",
  "A picture is worth a thousand words.",
  "When in Rome, do as the Romans do.",
  "The pen is mightier than the sword.",
  "When the going gets tough, the tough get going.",
  "Two heads are better than one.",
  "Better late than never.",
  "Practice makes perfect.",
];

export const MemoLoadingProgressContent: React.FunctionComponent<{
  tip: string;
  progress: LoadProgress;
  hasLoadingProblems: boolean;
  onReloadClicked?: () => void;
  onToggleDetails: () => void;
  showDetails: boolean;
  children?: ReactNode;
}> = React.memo(
  ({
    tip,
    progress,
    hasLoadingProblems,
    onReloadClicked,
    onToggleDetails,
    showDetails,
    children,
  }) => {
    const detailsMsgs = progressDetails(progress);
    const detailsElements = Array.from(detailsMsgs.keys(), (i) => (
      <p key={i}>{detailsMsgs[i]}</p>
    ));
    return (
      <LoadingContentPreview
        tip={`${tip}`}
        loadProgress={progress}
        onToggleDetails={onToggleDetails}
      >
        <div className="loading-info">
          {hasLoadingProblems && (
            <p className="loading-problems">
              Loading is unexpectedly stalled...{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onReloadClicked?.();
                }}
              >
                Respawn
              </a>
              {" "}or pop us a message on{" "}
              <a
                href="https://discord.com/invite/suttC9A6yJ"
                target="_blank"
                rel="noopener noreferrer"
              >
                Discord
              </a>
            </p>
          )}
          {showDetails && <div>{detailsElements}</div>}
          {children}
        </div>
      </LoadingContentPreview>
    );
  }
);

export const LoadingProgress: React.FunctionComponent<{
  progress: LoadProgress;
  tipSeed: number;
}> = ({ progress, tipSeed }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [reloadClicked, setReloadClicked] = useState(false);
  const [onceHadProblems, setOnceHadProblems] = useState(false);
  const staleProgress = loadStaleChecks(progress);
  const currentlyStale = _.isEqual(staleProgress, progress);
  const randomTip = useMemo(() => choose(tips, tipSeed * tips.length), []);
  const clientContext = useClientContext();

  let summary = progressSummary(progress);
  let loadingProblems = currentlyStale || summary === "problems_connecting";
  if (!onceHadProblems && loadingProblems) {
    setOnceHadProblems(true);
  }

  if (summary === "connecting" && onceHadProblems) {
    // If we've previously had problems connecting during this loading flow,
    // and we find ourselves currently in a state where we're disconnected, then
    // treat this from here on out as if we're currently having problems
    // connecting.
    summary = "problems_connecting";
    loadingProblems = true;
  }

  if (reloadClicked) {
    return (
      <div className="loading-wrapper">
        <MemoLoadingProgressContent
          hasLoadingProblems={loadingProblems}
          progress={progress}
          showDetails={showDetails}
          tip={randomTip}
          onToggleDetails={() => setShowDetails((show) => !show)}
        >
          <div className="loading-status">
            <div className="loading-summary">Reloading...</div>
          </div>
        </MemoLoadingProgressContent>
      </div>
    );
  }

  const ready = summary === "ready";

  if (ready) {
    return <></>;
  }

  return (
    <div className="loading-wrapper">
      <MemoLoadingProgressContent
        hasLoadingProblems={loadingProblems}
        progress={progress}
        showDetails={showDetails}
        onReloadClicked={() => {
          setReloadClicked(true);
          (async () => {
            try {
              if (clientContext) {
                await respawn(clientContext, {
                  kind: "starter_location",
                });
              }
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            } catch (error) {
              console.error("Error during reload and respawn:", error);
            }
          })();
        }}


        tip={randomTip}
        onToggleDetails={() => setShowDetails((show) => !show)}
      />
    </div>
  );
};
