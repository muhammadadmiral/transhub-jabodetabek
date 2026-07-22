import { useEffect, useState } from "react";
import { Drawer } from "vaul";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { useMapStore } from "../../../store/mapStore";
import { hasSearchActivity, SearchPanel, SearchPanelContent, type SearchPanelProps } from "./SearchPanel";

const COMPACT_SNAP = 0.28;
const ACTIVE_SNAP = 0.64;
const FULL_SNAP = 0.9;
const SNAP_POINTS = [COMPACT_SNAP, ACTIVE_SNAP, FULL_SNAP];

export function SearchSheet(props: SearchPanelProps) {
  const isMobile = useMediaQuery("(max-width: 760px)");
  const pinMode = useMapStore((state) => state.pinMode);
  const [snapPoint, setSnapPoint] = useState<number | string | null>(ACTIVE_SNAP);
  const hasActivity = hasSearchActivity(props);
  const isCompact = snapPoint === COMPACT_SNAP;
  const isFull = snapPoint === FULL_SNAP;

  useEffect(() => {
    // Keep the route and its endpoints visible while presenting useful results.
    setSnapPoint(ACTIVE_SNAP);
  }, [hasActivity]);

  if (!isMobile) return <SearchPanel {...props} />;

  const guide = isCompact
    ? "Geser ke atas untuk mencari rute"
    : isFull
      ? "Geser ke bawah untuk melihat peta"
      : hasActivity
        ? "Geser untuk membandingkan rute dan peta"
        : "Geser ke atas untuk pilihan lengkap";

  return (
    <Drawer.Root
      open
      modal={false}
      dismissible={false}
      snapPoints={SNAP_POINTS}
      activeSnapPoint={snapPoint}
      setActiveSnapPoint={setSnapPoint}
      repositionInputs
    >
      <Drawer.Portal>
        <Drawer.Content
          className={`search-sheet${pinMode ? " is-hidden" : ""}${isCompact ? " is-compact" : ""}`}
          aria-labelledby="search-title"
          data-snap={isCompact ? "compact" : isFull ? "full" : "active"}
        >
          <div className="search-sheet__handle" aria-hidden="true">
            <div className="search-sheet__grabber" />
            <span className="search-sheet__guide">{guide}</span>
          </div>
          <div
            className="search-sheet__scroll"
            onFocusCapture={(event) => {
              if (event.target instanceof HTMLInputElement) setSnapPoint(FULL_SNAP);
            }}
          >
            <SearchPanelContent {...props} />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
