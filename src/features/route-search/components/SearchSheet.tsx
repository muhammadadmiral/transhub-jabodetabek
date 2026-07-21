import { useEffect, useState } from "react";
import { Drawer } from "vaul";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { useMapStore } from "../../../store/mapStore";
import { hasSearchActivity, SearchPanel, SearchPanelContent, type SearchPanelProps } from "./SearchPanel";

const SNAP_POINTS = [0.24, 0.55, 0.94];

export function SearchSheet(props: SearchPanelProps) {
  const isMobile = useMediaQuery("(max-width: 760px)");
  const pinMode = useMapStore((state) => state.pinMode);
  const [snapPoint, setSnapPoint] = useState<number | string | null>(SNAP_POINTS[0]);
  const hasActivity = hasSearchActivity(props);

  useEffect(() => {
    // Saat hasil rute muncul, buka setengah — jangan penuh agar peta tetap terlihat.
    if (hasActivity) setSnapPoint(SNAP_POINTS[1]);
    else setSnapPoint(SNAP_POINTS[0]);
  }, [hasActivity]);

  if (!isMobile) return <SearchPanel {...props} />;

  return (
    <Drawer.Root
      open
      modal={false}
      dismissible={false}
      snapPoints={SNAP_POINTS}
      activeSnapPoint={snapPoint}
      setActiveSnapPoint={setSnapPoint}
      repositionInputs={false}
    >
      <Drawer.Portal>
        <Drawer.Content className={`search-sheet${pinMode ? " is-hidden" : ""}`} aria-labelledby="search-title">
          <div className="search-sheet__grabber" aria-hidden="true" />
          <div
            className="search-sheet__scroll"
            onFocusCapture={(event) => {
              if (event.target instanceof HTMLInputElement) setSnapPoint(SNAP_POINTS[1]);
            }}
          >
            <SearchPanelContent {...props} />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
