"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ApiClientError,
  createPost,
  fetchEstablishments,
  fetchZones,
  type EstablishmentPublic,
} from "@/lib/client/api";
import { INCIDENT_TYPE_LABELS, INCIDENT_TYPES } from "@/lib/client/labels";
import { stripImageMetadata } from "@/lib/client/strip-image-metadata";
import type { IncidentType, Zone } from "@/lib/types";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import {
  LocationPicker,
  type LatLng,
} from "@/components/LocationPicker";

export type PublishFormProps = {
  initialZoneId?: string;
};

export function PublishForm({ initialZoneId }: PublishFormProps) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [establishments, setEstablishments] = useState<EstablishmentPublic[]>(
    [],
  );
  const [bootLoading, setBootLoading] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);

  const [zoneId, setZoneId] = useState(initialZoneId ?? "");
  const [type, setType] = useState<IncidentType>("robo");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isEstablishment, setIsEstablishment] = useState(false);
  const [establishmentId, setEstablishmentId] = useState("");
  const [location, setLocation] = useState<LatLng | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [followUpCode, setFollowUpCode] = useState<string | null>(null);

  async function loadZones() {
    setBootLoading(true);
    setBootError(null);
    try {
      const res = await fetchZones();
      setZones(res.zones);
      if (!zoneId && res.zones[0]) {
        setZoneId(initialZoneId || res.zones[0].id);
      }
    } catch (e) {
      const msg =
        e instanceof ApiClientError
          ? e.message
          : "No pudimos cargar las zonas.";
      setBootError(msg);
    } finally {
      setBootLoading(false);
    }
  }

  useEffect(() => {
    void loadZones();
  }, []);

  useEffect(() => {
    if (!zoneId || !isEstablishment) {
      setEstablishments([]);
      setEstablishmentId("");
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetchEstablishments(zoneId);
        if (cancelled) return;
        setEstablishments(res.establishments);
        setEstablishmentId((prev) =>
          res.establishments.some((e) => e.id === prev)
            ? prev
            : (res.establishments[0]?.id ?? ""),
        );
      } catch {
        if (!cancelled) {
          setEstablishments([]);
          setEstablishmentId("");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [zoneId, isEstablishment]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!zoneId) {
      setSubmitError("Elige una zona.");
      return;
    }
    if (!location) {
      setSubmitError("Marca la ubicación en el mapa.");
      return;
    }
    if (isEstablishment && !establishmentId) {
      setSubmitError(
        "Selecciona un establecimiento del registro. No uses nombres propios.",
      );
      return;
    }

    setSubmitting(true);
    try {
      let evidence: File | null = photo;
      if (photo) {
        evidence = await stripImageMetadata(photo);
      }
      const res = await createPost({
        zone_id: zoneId,
        type,
        title,
        body,
        lat: location.lat,
        lng: location.lng,
        is_establishment: isEstablishment,
        establishment_id: isEstablishment ? establishmentId : null,
        evidence,
      });
      setFollowUpCode(res.follow_up_code);
      setTitle("");
      setBody("");
      setPhoto(null);
      setLocation(null);
      setIsEstablishment(false);
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : "No se pudo publicar el caso.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (bootLoading) {
    return <LoadingState label="Cargando formulario…" />;
  }

  if (bootError) {
    return <ErrorState message={bootError} onRetry={() => void loadZones()} />;
  }

  if (followUpCode) {
    return (
      <div className="stack" role="status">
        <div className="success-banner">
          <strong>Caso enviado.</strong> Guarda tu código de seguimiento: no se
          vuelve a mostrar.
        </div>
        <p
          style={{
            fontFamily: "var(--cuadra-font-display)",
            fontSize: "1.4rem",
            letterSpacing: "0.04em",
            margin: 0,
          }}
        >
          {followUpCode}
        </p>
        <p className="muted" style={{ margin: 0 }}>
          Con este código puedes consultar el estado en Seguimiento, sin iniciar
          sesión.
        </p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setFollowUpCode(null)}
        >
          Publicar otro caso
        </button>
      </div>
    );
  }

  return (
    <form className="publish-form" onSubmit={(e) => void onSubmit(e)} noValidate>
      <div className="notice">
        No escribas nombres de personas ni de negocios. Si el caso involucra un
        local, elígelo desde el registro.
      </div>

      <div className="field">
        <label htmlFor="publish-type">Tipo de caso</label>
        <select
          id="publish-type"
          value={type}
          onChange={(e) => setType(e.target.value as IncidentType)}
          required
        >
          {INCIDENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {INCIDENT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="publish-zone">Zona</label>
        <select
          id="publish-zone"
          value={zoneId}
          onChange={(e) => setZoneId(e.target.value)}
          required
        >
          {zones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name}
            </option>
          ))}
        </select>
      </div>

      <div className="check-row">
        <input
          id="publish-establishment"
          type="checkbox"
          checked={isEstablishment}
          onChange={(e) => setIsEstablishment(e.target.checked)}
        />
        <label htmlFor="publish-establishment">
          El señalamiento apunta a un establecimiento registrado
        </label>
      </div>

      {isEstablishment ? (
        <div className="field">
          <label htmlFor="publish-establishment-id">
            Establecimiento (registro)
          </label>
          <select
            id="publish-establishment-id"
            value={establishmentId}
            onChange={(e) => setEstablishmentId(e.target.value)}
            required
          >
            {establishments.length === 0 ? (
              <option value="">Sin registros en esta zona</option>
            ) : (
              establishments.map((est) => (
                <option key={est.id} value={est.id}>
                  {est.registry_label}
                </option>
              ))
            )}
          </select>
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="publish-title">Título</label>
        <input
          id="publish-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          required
          placeholder="Qué ocurrió, sin nombres propios"
        />
      </div>

      <div className="field">
        <label htmlFor="publish-body">Descripción</label>
        <textarea
          id="publish-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          placeholder="Cuenta lo sucedido con hechos. Sin nombres de personas o negocios."
        />
      </div>

      <LocationPicker
        value={location}
        onChange={setLocation}
        disabled={submitting}
      />

      <div className="field">
        <label htmlFor="publish-photo">Foto (opcional)</label>
        <input
          id="publish-photo"
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        />
        <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>
          Antes de subir, eliminamos los metadatos de la imagen (incluye datos
          de ubicación embebidos).
        </p>
      </div>

      {submitError ? <ErrorState message={submitError} /> : null}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={submitting}
      >
        {submitting ? "Enviando…" : "Publicar caso"}
      </button>
    </form>
  );
}
