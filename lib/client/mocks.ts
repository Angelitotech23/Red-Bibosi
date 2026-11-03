import type {
  CommentPublic,
  CreatePostResponse,
  FollowUpLookupResponse,
  IncidentType,
  ListPostsResponse,
  OfficialResponsePublic,
  PostPublic,
  PostStatus,
  ZonesResponse,
} from "@/lib/types";

/** Establecimiento del registro (contrato pendiente — ver Solicitudes). */
export interface EstablishmentPublic {
  id: string;
  /** Etiqueta genérica del registro; nunca nombre comercial libre. */
  registry_label: string;
  zone_id: string;
}

/** Celda agregada del mapa (contrato pendiente — ver Solicitudes). */
export interface MapCellPublic {
  grid_lat: number;
  grid_lng: number;
  counts: Partial<Record<IncidentType, number>>;
  total: number;
}

const NOW = "2026-11-03T18:00:00.000Z";

export const MOCK_ZONES: ZonesResponse = {
  zones: [
    {
      id: "z-equipetrol",
      slug: "equipetrol",
      name: "Equipetrol",
      bbox: { south: -17.78, west: -63.2, north: -17.75, east: -63.17 },
      created_at: NOW,
    },
    {
      id: "z-plan-3000",
      slug: "plan_3000",
      name: "Plan 3000",
      bbox: { south: -17.82, west: -63.14, north: -17.78, east: -63.1 },
      created_at: NOW,
    },
    {
      id: "z-uv-128",
      slug: "uv_128",
      name: "UV 128",
      bbox: { south: -17.8, west: -63.18, north: -17.77, east: -63.15 },
      created_at: NOW,
    },
    {
      id: "z-las-palmas",
      slug: "las_palmas",
      name: "Las Palmas",
      bbox: { south: -17.76, west: -63.19, north: -17.74, east: -63.16 },
      created_at: NOW,
    },
    {
      id: "z-el-tronco",
      slug: "el_tronco",
      name: "El Tronco",
      bbox: { south: -17.79, west: -63.22, north: -17.76, east: -63.19 },
      created_at: NOW,
    },
  ],
};

export const MOCK_ESTABLISHMENTS: EstablishmentPublic[] = [
  {
    id: "est-001",
    registry_label: "Punto registrado SCZ-A-104",
    zone_id: "z-equipetrol",
  },
  {
    id: "est-002",
    registry_label: "Punto registrado SCZ-A-221",
    zone_id: "z-equipetrol",
  },
  {
    id: "est-003",
    registry_label: "Punto registrado SCZ-B-018",
    zone_id: "z-plan-3000",
  },
  {
    id: "est-004",
    registry_label: "Punto registrado SCZ-C-055",
    zone_id: "z-uv-128",
  },
  {
    id: "est-005",
    registry_label: "Punto registrado SCZ-D-090",
    zone_id: "z-las-palmas",
  },
];

export const MOCK_POSTS: PostPublic[] = [
  {
    id: "p-1001",
    author_id: "u-1",
    zone_id: "z-equipetrol",
    type: "robo",
    status: "en_verificacion",
    title: "Intento de hurto cerca de la avenida principal",
    body: "Dos personas en motocicleta intentaron quitar un bolso a una vecina cerca de las 20:30. Había poca iluminación en la esquina.",
    grid_lat: -17.7632,
    grid_lng: -63.1821,
    is_establishment: false,
    publish_gate: "published",
    created_at: "2026-11-02T23:10:00.000Z",
    updated_at: "2026-11-03T01:00:00.000Z",
    author_pseudonym: "vecino_norte",
    vote_count: 4,
  },
  {
    id: "p-1002",
    author_id: "u-2",
    zone_id: "z-equipetrol",
    type: "convivencia_nocturna",
    status: "reportado",
    title: "Ruido excesivo pasada la medianoche",
    body: "Desde hace tres noches hay música a alto volumen que no deja dormir a las familias de la cuadra.",
    grid_lat: -17.764,
    grid_lng: -63.1815,
    is_establishment: true,
    publish_gate: "published",
    created_at: "2026-11-03T08:20:00.000Z",
    updated_at: "2026-11-03T08:20:00.000Z",
    author_pseudonym: "cuadra_viva",
    vote_count: 2,
  },
  {
    id: "p-1003",
    author_id: "u-3",
    zone_id: "z-plan-3000",
    type: "vandalismo",
    status: "corroborado",
    title: "Daños a mobiliario en la plaza del sector",
    body: "Bancas y un basurero fueron destruidos durante la madrugada. Varios vecinos confirmaron lo ocurrido.",
    grid_lat: -17.801,
    grid_lng: -63.12,
    is_establishment: false,
    publish_gate: "published",
    created_at: "2026-11-01T14:00:00.000Z",
    updated_at: "2026-11-02T10:00:00.000Z",
    author_pseudonym: "ojo_ciudadano",
    vote_count: 7,
  },
  {
    id: "p-1004",
    author_id: "u-4",
    zone_id: "z-plan-3000",
    type: "acoso",
    status: "derivado",
    title: "Acoso reiterado en parada de micro",
    body: "Una persona insiste en seguir a peatones en la parada durante la tarde. Se pidió apoyo a autoridad local.",
    grid_lat: -17.8025,
    grid_lng: -63.118,
    is_establishment: false,
    publish_gate: "published",
    created_at: "2026-10-30T19:40:00.000Z",
    updated_at: "2026-11-01T12:00:00.000Z",
    author_pseudonym: "paso_seguro",
    vote_count: 11,
  },
  {
    id: "p-1005",
    author_id: "u-5",
    zone_id: "z-uv-128",
    type: "consumo_via_publica",
    status: "resuelto",
    title: "Consumo problemático frente a la escuela",
    body: "Grupo frecuente en la vereda frente a la unidad educativa. Tras derivación, hubo intervención y el punto quedó limpio.",
    grid_lat: -17.785,
    grid_lng: -63.165,
    is_establishment: false,
    publish_gate: "published",
    created_at: "2026-10-20T11:00:00.000Z",
    updated_at: "2026-10-28T16:00:00.000Z",
    author_pseudonym: "madre_uv",
    vote_count: 9,
  },
  {
    id: "p-1006",
    author_id: "u-6",
    zone_id: "z-las-palmas",
    type: "robo",
    status: "sin_respuesta",
    title: "Hurto de bicicleta en vía secundaria",
    body: "Sacaron una bicicleta amarrada a un poste cerca del mediodía. No hubo respuesta formal aún.",
    grid_lat: -17.752,
    grid_lng: -63.175,
    is_establishment: false,
    publish_gate: "published",
    created_at: "2026-10-25T17:30:00.000Z",
    updated_at: "2026-10-25T17:30:00.000Z",
    author_pseudonym: "pedal_scz",
    vote_count: 1,
  },
  {
    id: "p-1007",
    author_id: "u-7",
    zone_id: "z-el-tronco",
    type: "vandalismo",
    status: "reportado",
    title: "Grafitis ofensivos en muro comunitario",
    body: "Aparecieron pintadas en el muro del espacio vecinal. Se solicita limpieza y mayor vigilancia nocturna.",
    grid_lat: -17.775,
    grid_lng: -63.205,
    is_establishment: false,
    publish_gate: "published",
    created_at: "2026-11-03T12:00:00.000Z",
    updated_at: "2026-11-03T12:00:00.000Z",
    author_pseudonym: "tronco_activo",
    vote_count: 0,
  },
];

const MOCK_COMMENTS: Record<string, CommentPublic[]> = {
  "p-1001": [
    {
      id: "c-1",
      post_id: "p-1001",
      author_id: "u-8",
      body: "Yo también vi la moto dando vueltas esa noche. Ojalá instalen más luces.",
      created_at: "2026-11-03T00:10:00.000Z",
      author_pseudonym: "luz_en_la_esquina",
    },
    {
      id: "c-2",
      post_id: "p-1001",
      author_id: "u-9",
      body: "Corroboro: pasó cerca de las 20:40. Había otra persona filmando.",
      created_at: "2026-11-03T00:45:00.000Z",
      author_pseudonym: "testigo_sur",
    },
  ],
  "p-1003": [
    {
      id: "c-3",
      post_id: "p-1003",
      author_id: "u-10",
      body: "Las bancas quedaron inutilizables. Varios vecinos ya reportamos lo mismo.",
      created_at: "2026-11-01T18:00:00.000Z",
      author_pseudonym: "plaza_limpia",
    },
  ],
  "p-1004": [
    {
      id: "c-4",
      post_id: "p-1004",
      author_id: "u-11",
      body: "Gracias por publicar. La parada necesita presencia permanente en horas pico.",
      created_at: "2026-10-31T09:00:00.000Z",
      author_pseudonym: "ruta_segura",
    },
  ],
};

const MOCK_OFFICIAL: Record<string, OfficialResponsePublic> = {
  "p-1004": {
    id: "or-1",
    post_id: "p-1004",
    author_id: "u-auth-1",
    body: "El caso fue derivado a la unidad de prevención. Se coordinará patrullaje en horarios de mayor afluencia.",
    status_after: "derivado",
    created_at: "2026-11-01T12:00:00.000Z",
    author_pseudonym: "autoridad_distrital",
  },
  "p-1005": {
    id: "or-2",
    post_id: "p-1005",
    author_id: "u-auth-1",
    body: "Intervención realizada con apoyo vecinal. El punto permanece bajo seguimiento semanal.",
    status_after: "resuelto",
    created_at: "2026-10-28T16:00:00.000Z",
    author_pseudonym: "autoridad_distrital",
  },
};

/** Códigos de seguimiento de demo (solo mock). */
const FOLLOW_UP_CODES: Record<string, string> = {
  "CUADRA-DEMO-1001": "p-1001",
  "CUADRA-DEMO-1003": "p-1003",
  "CUADRA-DEMO-1005": "p-1005",
};

function delay(ms = 280): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockGetZones(): Promise<ZonesResponse> {
  await delay();
  return structuredClone(MOCK_ZONES);
}

export async function mockListPosts(params: {
  zone_id?: string;
  type?: IncidentType;
  status?: PostStatus;
  cursor?: string;
  limit?: number;
}): Promise<ListPostsResponse> {
  await delay();
  let posts = MOCK_POSTS.filter((p) => p.publish_gate === "published");
  if (params.zone_id) {
    posts = posts.filter((p) => p.zone_id === params.zone_id);
  }
  if (params.type) {
    posts = posts.filter((p) => p.type === params.type);
  }
  if (params.status) {
    posts = posts.filter((p) => p.status === params.status);
  }
  posts = [...posts].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const limit = Math.min(params.limit ?? 20, 50);
  const start = params.cursor
    ? posts.findIndex((p) => p.id === params.cursor) + 1
    : 0;
  const slice = posts.slice(Math.max(0, start), Math.max(0, start) + limit);
  const next =
    start + limit < posts.length ? (slice[slice.length - 1]?.id ?? null) : null;
  return { posts: structuredClone(slice), next_cursor: next };
}

export async function mockGetPost(id: string): Promise<{ post: PostPublic }> {
  await delay();
  const post = MOCK_POSTS.find((p) => p.id === id);
  if (!post) {
    throw new MockApiError("NOT_FOUND", "No encontramos ese caso.", 404);
  }
  return { post: structuredClone(post) };
}

export async function mockGetComments(
  postId: string,
): Promise<{ comments: CommentPublic[] }> {
  await delay();
  if (!MOCK_POSTS.some((p) => p.id === postId)) {
    throw new MockApiError("NOT_FOUND", "No encontramos ese caso.", 404);
  }
  return {
    comments: structuredClone(MOCK_COMMENTS[postId] ?? []),
  };
}

export async function mockGetOfficialResponse(
  postId: string,
): Promise<{ response: OfficialResponsePublic | null }> {
  await delay(120);
  return { response: structuredClone(MOCK_OFFICIAL[postId] ?? null) };
}

export async function mockCreateVote(
  postId: string,
): Promise<{ vote: { id: string; post_id: string; user_id: string; value: 1; created_at: string }; post: PostPublic }> {
  await delay();
  const post = MOCK_POSTS.find((p) => p.id === postId);
  if (!post) {
    throw new MockApiError("NOT_FOUND", "No encontramos ese caso.", 404);
  }
  post.vote_count = (post.vote_count ?? 0) + 1;
  if (post.vote_count >= 3 && post.status === "reportado") {
    post.status = "en_verificacion";
  }
  if (post.vote_count >= 5 && post.status === "en_verificacion") {
    post.status = "corroborado";
  }
  post.updated_at = new Date().toISOString();
  return {
    vote: {
      id: `v-${Date.now()}`,
      post_id: postId,
      user_id: "u-mock",
      value: 1,
      created_at: new Date().toISOString(),
    },
    post: structuredClone(post),
  };
}

export async function mockCreateComment(
  postId: string,
  body: string,
): Promise<{ comment: CommentPublic }> {
  await delay();
  if (!MOCK_POSTS.some((p) => p.id === postId)) {
    throw new MockApiError("NOT_FOUND", "No encontramos ese caso.", 404);
  }
  if (!body.trim()) {
    throw new MockApiError(
      "VALIDATION_ERROR",
      "El comentario no puede estar vacío.",
      422,
    );
  }
  const comment: CommentPublic = {
    id: `c-${Date.now()}`,
    post_id: postId,
    author_id: "u-mock",
    body: body.trim(),
    created_at: new Date().toISOString(),
    author_pseudonym: "tu_sesion",
  };
  MOCK_COMMENTS[postId] = [...(MOCK_COMMENTS[postId] ?? []), comment];
  return { comment: structuredClone(comment) };
}

export async function mockCreatePost(input: {
  zone_id: string;
  type: IncidentType;
  title: string;
  body: string;
  lat: number;
  lng: number;
  is_establishment: boolean;
}): Promise<CreatePostResponse> {
  await delay(400);
  if (!input.title.trim() || !input.body.trim()) {
    throw new MockApiError(
      "VALIDATION_ERROR",
      "Completa el título y la descripción.",
      422,
    );
  }
  if (!Number.isFinite(input.lat) || !Number.isFinite(input.lng)) {
    throw new MockApiError(
      "VALIDATION_ERROR",
      "Marca la ubicación en el mapa.",
      422,
    );
  }
  const id = `p-${Date.now()}`;
  const post: PostPublic = {
    id,
    author_id: "u-mock",
    zone_id: input.zone_id,
    type: input.type,
    status: "reportado",
    title: input.title.trim(),
    body: input.body.trim(),
    grid_lat: Math.round(input.lat * 10000) / 10000,
    grid_lng: Math.round(input.lng * 10000) / 10000,
    is_establishment: input.is_establishment,
    publish_gate: "published",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author_pseudonym: "tu_sesion",
    vote_count: 0,
  };
  MOCK_POSTS.unshift(post);
  const code = `CUADRA-DEMO-${id.slice(-4).toUpperCase()}`;
  FOLLOW_UP_CODES[code] = id;
  return { post: structuredClone(post), follow_up_code: code };
}

export async function mockFollowUpLookup(
  code: string,
): Promise<FollowUpLookupResponse> {
  await delay();
  const postId = FOLLOW_UP_CODES[code.trim().toUpperCase()];
  if (!postId) {
    throw new MockApiError(
      "NOT_FOUND",
      "Código inválido o vencido. Revisa e intenta de nuevo.",
      404,
    );
  }
  const post = MOCK_POSTS.find((p) => p.id === postId);
  if (!post) {
    throw new MockApiError(
      "NOT_FOUND",
      "Código inválido o vencido. Revisa e intenta de nuevo.",
      404,
    );
  }
  return { post: structuredClone(post) };
}

export async function mockListEstablishments(
  zoneId?: string,
): Promise<{ establishments: EstablishmentPublic[] }> {
  await delay(150);
  const list = zoneId
    ? MOCK_ESTABLISHMENTS.filter((e) => e.zone_id === zoneId)
    : MOCK_ESTABLISHMENTS;
  return { establishments: structuredClone(list) };
}

export async function mockGetMapCells(): Promise<{ cells: MapCellPublic[] }> {
  await delay();
  const buckets = new Map<string, MapCellPublic>();
  for (const post of MOCK_POSTS) {
    if (post.publish_gate !== "published") continue;
    const key = `${post.grid_lat}|${post.grid_lng}`;
    const cell = buckets.get(key) ?? {
      grid_lat: post.grid_lat,
      grid_lng: post.grid_lng,
      counts: {},
      total: 0,
    };
    cell.counts[post.type] = (cell.counts[post.type] ?? 0) + 1;
    cell.total += 1;
    buckets.set(key, cell);
  }
  return { cells: structuredClone([...buckets.values()]) };
}

export class MockApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "MockApiError";
    this.code = code;
    this.status = status;
  }
}
