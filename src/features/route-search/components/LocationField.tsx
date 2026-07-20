import { AnimatePresence, motion } from "motion/react";
import { Check, LocateFixed, MapPin, Navigation, TrainFront } from "lucide-react";
import type { useLocationAutocomplete } from "../hooks/useLocationAutocomplete";
import { cn } from "../../../lib/cn";

export type LocationAutocompleteModel = ReturnType<typeof useLocationAutocomplete>;

type LocationFieldProps = {
  field: LocationAutocompleteModel;
  label: string;
  placeholder: string;
};

const MODE_LABELS = {
  angkot: "Angkot",
  bikun: "Bikun",
  krl: "KRL",
  lrt: "LRT",
  mrt: "MRT",
  transjakarta: "TJ",
  walk: "Jalan",
} as const;

export function LocationField({ field, label, placeholder }: LocationFieldProps) {
  const pinSelection = field.selection.kind === "pin" ? field.selection : null;
  const placeCount = field.places.length;

  return (
    <div
      className="location-field group relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) field.onClose();
      }}
    >
      <label className="field-label" htmlFor={field.inputId}>{label}</label>
      <div className="location-input-row">
        <input
          id={field.inputId}
          value={field.query}
          onChange={(event) => field.onChange(event.target.value)}
          onFocus={field.onFocus}
          onKeyDown={field.onKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={field.listboxId}
          aria-expanded={field.isOpen}
          aria-activedescendant={field.activeOptionId}
        />
        {field.selection.kind !== "empty" && (
          <span className="grid size-5 shrink-0 place-items-center rounded-md bg-emerald-300/10 text-emerald-200" aria-label="Lokasi siap">
            <Check size={13} strokeWidth={2.2} />
          </span>
        )}
      </div>
      {pinSelection?.selectedStop && (
        <select
          className="mt-0.5 w-full appearance-none truncate border-0 bg-transparent p-0 text-[9px] text-white/38 outline-none"
          aria-label={`Halte ${label.toLowerCase()} terdekat`}
          value={pinSelection.selectedStop.id}
          onChange={(event) => {
            const stop = field.nearbyStops.find((candidate) => candidate.id === event.target.value);
            if (stop) field.onNearbySelect(stop);
          }}
        >
          {field.nearbyStops.map((stop) => (
            <option key={stop.id} value={stop.id}>via {stop.name} · {Math.round(stop.distanceMeters)} m</option>
          ))}
        </select>
      )}

      <AnimatePresence>
        {field.isOpen && (
          <motion.div
            className="stop-dropdown"
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div id={field.listboxId} role="listbox" aria-label={`Pilihan ${label.toLowerCase()}`}>
              <div className="flex items-center justify-between px-2.5 pb-1.5 pt-1">
                <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/35">Lokasi & tempat</span>
                {field.isLoadingPlaces && <span className="mini-loader" />}
              </div>

              {field.placeError && (
                <div className="stop-dropdown__state stop-dropdown__state--error">
                  <span>Lokasi gagal dicari</span>
                  <button type="button" onClick={() => field.onRetryPlaces()}>Coba lagi</button>
                </div>
              )}
              {!field.placeError && !field.isLoadingPlaces && field.places.length === 0 && field.query.trim().length >= 3 && (
                <div className="stop-dropdown__state">Tempat tidak ditemukan</div>
              )}
              {field.places.map((place, index) => (
                <button
                  id={`${field.listboxId}-${index}`}
                  className={cn("stop-option", field.activeIndex === index && "is-active")}
                  type="button"
                  role="option"
                  aria-selected={field.activeIndex === index}
                  key={place.id}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => field.onPlaceSelect(place)}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/8 bg-white/[0.035] text-cyan-200"><MapPin size={15} /></span>
                  <span className="stop-option__content"><strong>{place.label}</strong><small>{place.area} · {place.category}</small></span>
                </button>
              ))}

              {field.stops.length > 0 && (
                <>
                  <div className="my-1.5 h-px bg-white/[0.07]" />
                  <div className="flex items-center justify-between px-2.5 pb-1.5 pt-1">
                    <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/35">Halte & stasiun</span>
                    {field.isLoadingStops && <span className="mini-loader" />}
                  </div>
                </>
              )}
              {field.stopError && (
                <div className="stop-dropdown__state stop-dropdown__state--error">
                  <span>Pencarian halte gagal</span>
                  <button type="button" onClick={() => field.onRetryStops()}>Coba lagi</button>
                </div>
              )}
              {field.stops.map((stop, index) => {
                const optionIndex = placeCount + index;
                return (
                  <button
                    id={`${field.listboxId}-${optionIndex}`}
                    className={cn("stop-option", field.activeIndex === optionIndex && "is-active")}
                    type="button"
                    role="option"
                    aria-selected={field.activeIndex === optionIndex}
                    key={stop.id}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => field.onStopSelect(stop)}
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/8 bg-white/[0.035] text-amber-200">
                      <TrainFront size={15} />
                    </span>
                    <span className="stop-option__content">
                      <strong>{stop.name}</strong>
                      <small>{stop.modes.map((mode) => MODE_LABELS[mode]).join(" · ")}</small>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-1 px-1 pt-1 sm:grid-cols-2">
              <button className="location-action" type="button" onMouseDown={(event) => event.preventDefault()} onClick={field.onPickOnMap}>
                <Navigation size={14} /> Pilih titik
              </button>
              <button className="location-action" type="button" onMouseDown={(event) => event.preventDefault()} onClick={field.onUseDevice}>
                <LocateFixed size={14} /> Lokasi saya
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
