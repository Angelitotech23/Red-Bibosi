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

/** Celda agregada del mapa — alineada con lib/server/grid.ts / GET /api/map. */
export interface MapCellPublic {
  grid_lat: number;
  grid_lng: number;
  total: number;
  by_type: Partial<Record<IncidentType, number>>;
}

const NOW = "2026-11-03T18:00:00.000Z";

export const MOCK_ZONES: ZonesResponse = {
  zones: [
    {
      id: "11111111-1111-4111-8111-111111111111",
      slug: "equipetrol",
      name: "Equipetrol",
      bbox: { south: -17.78, west: -63.2, north: -17.75, east: -63.17 },
      created_at: NOW,
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      slug: "plan_3000",
      name: "Plan 3000",
      bbox: { south: -17.82, west: -63.14, north: -17.78, east: -63.1 },
      created_at: NOW,
    },
    {
      id: "33333333-3333-4333-8333-333333333333",
      slug: "uv_128",
      name: "UV 128",
      bbox: { south: -17.8, west: -63.18, north: -17.77, east: -63.15 },
      created_at: NOW,
    },
    {
      id: "44444444-4444-4444-8444-444444444444",
      slug: "las_palmas",
      name: "Las Palmas",
      bbox: { south: -17.76, west: -63.19, north: -17.74, east: -63.16 },
      created_at: NOW,
    },
    {
      id: "55555555-5555-4555-8555-555555555555",
      slug: "el_tronco",
      name: "El Tronco",
      bbox: { south: -17.79, west: -63.22, north: -17.76, east: -63.19 },
      created_at: NOW,
    },
    {
      id: "66666666-6666-4666-8666-666666666666",
      slug: "villa_1ro_de_mayo",
      name: "Villa 1º de Mayo",
      bbox: { south: -17.77, west: -63.14, north: -17.74, east: -63.1 },
      created_at: NOW,
    },
    {
      id: "77777777-7777-4777-8777-777777777777",
      slug: "el_pari",
      name: "El Pari",
      bbox: { south: -17.8, west: -63.2, north: -17.77, east: -63.16 },
      created_at: NOW,
    },
    {
      id: "88888888-8888-4888-8888-888888888888",
      slug: "norte",
      name: "Norte",
      bbox: { south: -17.74, west: -63.2, north: -17.71, east: -63.16 },
      created_at: NOW,
    },
  ],
};

export const MOCK_ESTABLISHMENTS: EstablishmentPublic[] = [
  {
    id: "est-001",
    registry_label: "Punto registrado SCZ-A-104",
    zone_id: "11111111-1111-4111-8111-111111111111",
  },
  {
    id: "est-002",
    registry_label: "Punto registrado SCZ-A-221",
    zone_id: "11111111-1111-4111-8111-111111111111",
  },
  {
    id: "est-003",
    registry_label: "Punto registrado SCZ-B-018",
    zone_id: "22222222-2222-4222-8222-222222222222",
  },
  {
    id: "est-004",
    registry_label: "Punto registrado SCZ-C-055",
    zone_id: "33333333-3333-4333-8333-333333333333",
  },
  {
    id: "est-005",
    registry_label: "Punto registrado SCZ-D-090",
    zone_id: "44444444-4444-4444-8444-444444444444",
  },
];

export const MOCK_POSTS: PostPublic[] = [
  {
    id: "p-1001",
    zone_id: "11111111-1111-4111-8111-111111111111",
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
    vote_count: 4,
  },
  {
    id: "p-1002",
    zone_id: "11111111-1111-4111-8111-111111111111",
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
    vote_count: 2,
  },
  {
    id: "p-1003",
    zone_id: "22222222-2222-4222-8222-222222222222",
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
    vote_count: 7,
  },
  {
    id: "p-1004",
    zone_id: "22222222-2222-4222-8222-222222222222",
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
    vote_count: 11,
  },
  {
    id: "p-1005",
    zone_id: "33333333-3333-4333-8333-333333333333",
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
    vote_count: 9,
  },
  {
    id: "p-1006",
    zone_id: "44444444-4444-4444-8444-444444444444",
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
    vote_count: 1,
  },
  {
    id: "p-1007",
    zone_id: "55555555-5555-4555-8555-555555555555",
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
    vote_count: 0,
  },
  {
    id: "p-1008",
    zone_id: "66666666-6666-4666-8666-666666666666",
    type: "robo",
    status: "en_verificacion",
    title: "Arrebato de celular en parada del anillo",
    body: "Un motociclista frenó de golpe y se llevó un celular. Varios vecinos vieron la misma moto minutos antes.",
    grid_lat: -17.758,
    grid_lng: -63.122,
    is_establishment: false,
    publish_gate: "published",
    created_at: "2026-11-03T15:40:00.000Z",
    updated_at: "2026-11-03T16:10:00.000Z",
    vote_count: 6,
  },
  {
    id: "p-1009",
    zone_id: "77777777-7777-4777-8777-777777777777",
    type: "vandalismo",
    status: "reportado",
    title: "Farol de esquina apagado desde el fin de semana",
    body: "El poste quedó oscuro y la vereda se siente insegura al cruzar de noche. Se pide reparación del alumbrado.",
    grid_lat: -17.786,
    grid_lng: -63.178,
    is_establishment: false,
    publish_gate: "published",
    created_at: "2026-11-03T10:05:00.000Z",
    updated_at: "2026-11-03T10:05:00.000Z",
    vote_count: 8,
  },
  {
    id: "p-1010",
    zone_id: "88888888-8888-4888-8888-888888888888",
    type: "acoso",
    status: "corroborado",
    title: "Acoso a peatones en la vereda del mercado",
    body: "Una persona se acerca a quienes caminan con compras y no se retira. Ya lo vieron en tres tardes distintas.",
    grid_lat: -17.728,
    grid_lng: -63.176,
    is_establishment: false,
    publish_gate: "published",
    created_at: "2026-11-02T21:15:00.000Z",
    updated_at: "2026-11-03T09:00:00.000Z",
    vote_count: 13,
  },
  {
    id: "p-1011",
    zone_id: "11111111-1111-4111-8111-111111111111",
    type: "consumo_via_publica",
    status: "derivado",
    title: "Grupo en la vereda tapa el paso de noche",
    body: "Después de las 22:00 el cruce queda ocupado. Vecinos evitan esa cuadra para no enfrentar el grupo.",
    grid_lat: -17.761,
    grid_lng: -63.186,
    is_establishment: false,
    publish_gate: "published",
    created_at: "2026-11-01T23:50:00.000Z",
    updated_at: "2026-11-02T18:20:00.000Z",
    vote_count: 5,
  },
  {
    id: "p-1012",
    zone_id: "22222222-2222-4222-8222-222222222222",
    type: "convivencia_nocturna",
    status: "reportado",
    title: "Música a todo volumen hasta la madrugada",
    body: "El ruido llega a las casas de la manzana. Piden que se respete el horario de descanso.",
    grid_lat: -17.798,
    grid_lng: -63.126,
    is_establishment: true,
    publish_gate: "published",
    created_at: "2026-11-03T06:30:00.000Z",
    updated_at: "2026-11-03T06:30:00.000Z",
    vote_count: 10,
  },
  {
    id: "p-1013",
    zone_id: "44444444-4444-4444-8444-444444444444",
    type: "vandalismo",
    status: "en_verificacion",
    title: "Basurero volcado y vidrios en la plaza",
    body: "Amaneció el espacio sucio y con vidrios. Hay fotos de vecinos, sin nombres de personas.",
    grid_lat: -17.749,
    grid_lng: -63.171,
    is_establishment: false,
    publish_gate: "published",
    created_at: "2026-11-02T12:45:00.000Z",
    updated_at: "2026-11-02T19:10:00.000Z",
    vote_count: 3,
  },
  {
    id: "p-1014",
    zone_id: "66666666-6666-4666-8666-666666666666",
    type: "robo",
    status: "reportado",
    title: "Moto sospechosa dando vueltas a la cuadra",
    body: "Dos personas en moto recorren la misma manzana cada pocos minutos. No hubo forcejeo, pero genera alarma.",
    grid_lat: -17.754,
    grid_lng: -63.128,
    is_establishment: false,
    publish_gate: "published",
    created_at: "2026-11-03T17:05:00.000Z",
    updated_at: "2026-11-03T17:05:00.000Z",
    vote_count: 4,
  },
  {
    id: "p-1015",
    zone_id: "77777777-7777-4777-8777-777777777777",
    type: "consumo_via_publica",
    status: "resuelto",
    title: "Punto frente al canal ya fue limpiado",
    body: "Había un grupo frecuente junto al canal. Tras el aviso vecinal, el tramo quedó despejado.",
    grid_lat: -17.79,
    grid_lng: -63.172,
    is_establishment: false,
    publish_gate: "published",
    created_at: "2026-10-27T14:20:00.000Z",
    updated_at: "2026-11-01T11:00:00.000Z",
    vote_count: 7,
  },
];

const MOCK_COMMENTS: Record<string, CommentPublic[]> = {
  "p-1001": [
    {
      id: "c-1",
      post_id: "p-1001",
      body: "Yo también vi la moto dando vueltas esa noche. Ojalá instalen más luces.",
      created_at: "2026-11-03T00:10:00.000Z",
    },
    {
      id: "c-2",
      post_id: "p-1001",
      body: "Corroboro: pasó cerca de las 20:40. Había otra persona filmando.",
      created_at: "2026-11-03T00:45:00.000Z",
    },
  ],
  "p-1003": [
    {
      id: "c-3",
      post_id: "p-1003",
      body: "Las bancas quedaron inutilizables. Varios vecinos ya reportamos lo mismo.",
      created_at: "2026-11-01T18:00:00.000Z",
    },
  ],
  "p-1004": [
    {
      id: "c-4",
      post_id: "p-1004",
      body: "Gracias por publicar. La parada necesita presencia permanente en horas pico.",
      created_at: "2026-10-31T09:00:00.000Z",
    },
  ],
  "p-1008": [
    {
      id: "c-5",
      post_id: "p-1008",
      body: "Vi la misma moto color oscuro. Hay que avisar en el grupo de la zona.",
      created_at: "2026-11-03T16:25:00.000Z",
    },
  ],
  "p-1010": [
    {
      id: "c-6",
      post_id: "p-1010",
      body: "Confirmado. Varias vecinas cambiaron de vereda esa tarde.",
      created_at: "2026-11-03T10:20:00.000Z",
    },
  ],
  "p-1012": [
    {
      id: "c-7",
      post_id: "p-1012",
      body: "Anoche otra vez hasta las 3. No se puede dormir con niños.",
      created_at: "2026-11-03T11:10:00.000Z",
    },
  ],
};

const MOCK_OFFICIAL: Record<string, OfficialResponsePublic> = {
  "p-1004": {
    id: "or-1",
    post_id: "p-1004",
    body: "El caso fue derivado a la unidad de prevención. Se coordinará patrullaje en horarios de mayor afluencia.",
    status_after: "derivado",
    created_at: "2026-11-01T12:00:00.000Z",
  },
  "p-1005": {
    id: "or-2",
    post_id: "p-1005",
    body: "Intervención realizada con apoyo vecinal. El punto permanece bajo seguimiento semanal.",
    status_after: "resuelto",
    created_at: "2026-10-28T16:00:00.000Z",
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
    body: body.trim(),
    created_at: new Date().toISOString(),
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
      by_type: {},
      total: 0,
    };
    cell.by_type[post.type] = (cell.by_type[post.type] ?? 0) + 1;
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
