"use client";

import { useEffect, useRef, useState } from "react";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type { Session, Venue } from "@/lib/domain/types";

type MapPin = {
  venue: Venue;
  session?: Session;
  active?: boolean;
};

type MapStageProps = {
  venue: Venue;
  session: Session;
  pins?: MapPin[];
  selectedVenueId?: string;
  onPinSelect?: (venueId: string) => void;
};

function FallbackMap({
  venue,
  session,
  pins = [],
  selectedVenueId,
  onPinSelect
}: MapStageProps) {
  const visiblePins = pins.length ? pins : [{ venue, session, active: true }];

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-midnight/10 bg-[linear-gradient(180deg,#dde6ef_0%,#d4dfeb_40%,#ecf2e8_40%,#ecf2e8_100%)] p-5 shadow-card">
      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(10,24,56,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(10,24,56,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="relative flex min-h-[420px] flex-col justify-between">
        <div className="max-w-sm rounded-[28px] bg-white/88 p-4 shadow-card backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-coral">
            Personal route view
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-midnight">
            {venue.name}
          </h2>
          <p className="mt-2 text-sm leading-6 text-midnight/72">{venue.address}</p>
          <p className="mt-3 text-sm text-midnight/68">
            {session.startTime} · {session.title}
          </p>
        </div>

        <div className="ml-auto grid gap-2">
          {visiblePins.slice(0, 4).map((pin, index) => (
            <button
              key={`${pin.venue.id}-${pin.session?.id ?? index}`}
              type="button"
              onClick={() => onPinSelect?.(pin.venue.id)}
              className="relative flex h-20 w-20 items-center justify-center"
            >
              <div
                className={`map-pin-marker scale-[1.35] ${
                  pin.active || pin.venue.id === selectedVenueId
                    ? "map-pin-marker-active"
                    : ""
                }`}
              >
                <span className="map-pin-marker__dot" />
              </div>
            </button>
          ))}
          <div className="rounded-2xl bg-white/80 px-3 py-2 text-right text-xs font-semibold text-midnight/68">
            {visiblePins.length} visible stop{visiblePins.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MapStage({
  venue,
  session,
  pins = [],
  selectedVenueId,
  onPinSelect
}: MapStageProps) {
  const styleUrl =
    process.env.NEXT_PUBLIC_MAP_STYLE_URL ??
    "https://tiles.openfreemap.org/styles/liberty";
  const ref = useRef<HTMLDivElement | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  const isJsDom =
    typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("jsdom");

  useEffect(() => {
    if (!styleUrl || !ref.current || isJsDom) return;

    setMapFailed(false);

    try {
      const map = new maplibregl.Map({
        container: ref.current,
        style: styleUrl,
        center: [venue.lng, venue.lat],
        zoom: 13.4
      });

      const visiblePins = pins.length ? pins : [{ venue, active: true }];
      const bounds = new maplibregl.LngLatBounds();

      visiblePins.forEach((pin) => {
        const markerElement = document.createElement("button");
        markerElement.type = "button";
        markerElement.setAttribute("aria-label", `Open ${pin.venue.name}`);
        markerElement.className = `map-pin-marker${
          pin.venue.id === selectedVenueId || pin.active ? " map-pin-marker-active" : ""
        }`;
        markerElement.innerHTML = '<span class="map-pin-marker__dot"></span>';
        markerElement.addEventListener("click", () => {
          onPinSelect?.(pin.venue.id);
        });

        new maplibregl.Marker({ element: markerElement })
          .setLngLat([pin.venue.lng, pin.venue.lat])
          .addTo(map);
        bounds.extend([pin.venue.lng, pin.venue.lat]);
      });

      map.on("load", () => {
        if (visiblePins.length > 1) {
          map.fitBounds(bounds, { padding: 56, maxZoom: 14 });
        }
      });

      map.on("error", () => {
        setMapFailed(true);
      });

      return () => {
        map.remove();
      };
    } catch {
      setMapFailed(true);
      return;
    }
  }, [isJsDom, onPinSelect, pins, selectedVenueId, styleUrl, venue]);

  if (!styleUrl || mapFailed || isJsDom) {
    return (
      <FallbackMap
        session={session}
        venue={venue}
        pins={pins}
        selectedVenueId={selectedVenueId}
        onPinSelect={onPinSelect}
      />
    );
  }

  return <div ref={ref} className="h-[420px] overflow-hidden rounded-[32px] shadow-card" />;
}
