import type { useStopAutocomplete } from "../hooks/useStopAutocomplete";
import { Icon } from "../../../components/Icon";

export type StopAutocompleteModel = ReturnType<typeof useStopAutocomplete>;

type LocationFieldProps = {
  field: StopAutocompleteModel;
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
  return (
    <div
      className="location-field"
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
        {field.selectedStop && <span className="selected-indicator" aria-label="Halte dipilih"><Icon name="check" size={16} /></span>}
      </div>

      {field.isOpen && (
        <div className="stop-dropdown">
          {field.isLoading && <div className="stop-dropdown__state"><span className="mini-loader" /> Mencari halte</div>}
          {field.isError && (
            <div className="stop-dropdown__state stop-dropdown__state--error">
              <span>Pencarian gagal</span>
              <button type="button" onClick={() => field.onRetry()}>Coba lagi</button>
            </div>
          )}
          {!field.isLoading && !field.isError && field.stops.length === 0 && (
            <div className="stop-dropdown__state">Halte tidak ditemukan</div>
          )}
          {!field.isError && field.stops.length > 0 && (
            <div id={field.listboxId} role="listbox" aria-label={`Pilihan ${label.toLowerCase()}`}>
              {field.stops.map((stop, index) => (
                <button
                  id={`${field.listboxId}-${index}`}
                  className={`stop-option${field.activeIndex === index ? " is-active" : ""}`}
                  type="button"
                  role="option"
                  aria-selected={field.activeIndex === index}
                  key={stop.id}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => field.onSelect(stop)}
                >
                  <span className="stop-option__marker" />
                  <span className="stop-option__content">
                    <strong>{stop.name}</strong>
                    <small>{stop.modes.map((mode) => MODE_LABELS[mode]).join(" · ")}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
