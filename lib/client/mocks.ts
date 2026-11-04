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

/** IDs alineados con `supabase/seed.sql` para que el filtro de zona coincida en Vercel. */
export const DEMO_ZONE_IDS = {
  equipetrol: "a1000000-0000-4000-8000-000000000001",
  plan_3000: "a1000000-0000-4000-8000-000000000002",
  uv_128: "a1000000-0000-4000-8000-000000000003",
  centro: "a1000000-0000-4000-8000-000000000004",
  la_ramada: "a1000000-0000-4000-8000-000000000005",
  el_trigo: "a1000000-0000-4000-8000-000000000006",
  los_cholitos: "a1000000-0000-4000-8000-000000000007",
  norte: "a1000000-0000-4000-8000-000000000008",
  santos_dumont: "a1000000-0000-4000-8000-000000000009",
  palmaira: "a1000000-0000-4000-8000-00000000000a",
  radial_26: "a1000000-0000-4000-8000-00000000000b",
  villa_1ro_de_mayo: "a1000000-0000-4000-8000-00000000000c",
  anillo: "a1000000-0000-4000-8000-00000000000d",
} as const;

export const MOCK_ZONES: ZonesResponse = {
  zones: [
    {
      id: DEMO_ZONE_IDS.anillo,
      slug: "4to_anillo",
      name: "4to Anillo (demo)",
      bbox: { sw: [-17.8, -63.2], ne: [-17.76, -63.16], note: "FICTICIO" },
      created_at: NOW,
    },
    {
      id: DEMO_ZONE_IDS.centro,
      slug: "centro",
      name: "Centro (demo)",
      bbox: { sw: [-17.79, -63.19], ne: [-17.77, -63.17], note: "FICTICIO" },
      created_at: NOW,
    },
    {
      id: DEMO_ZONE_IDS.el_trigo,
      slug: "el_trigo",
      name: "El Trigo (demo)",
      bbox: { sw: [-17.83, -63.16], ne: [-17.81, -63.14], note: "FICTICIO" },
      created_at: NOW,
    },
    {
      id: DEMO_ZONE_IDS.equipetrol,
      slug: "equipetrol",
      name: "Equipetrol (demo)",
      bbox: {
        sw: [-17.783, -63.198],
        ne: [-17.755, -63.168],
        note: "FICTICIO bbox aproximado",
      },
      created_at: NOW,
    },
    {
      id: DEMO_ZONE_IDS.la_ramada,
      slug: "la_ramada",
      name: "La Ramada (demo)",
      bbox: { sw: [-17.81, -63.17], ne: [-17.79, -63.15], note: "FICTICIO" },
      created_at: NOW,
    },
    {
      id: DEMO_ZONE_IDS.los_cholitos,
      slug: "los_cholitos",
      name: "Los Cholitos (demo)",
      bbox: { sw: [-17.85, -63.15], ne: [-17.83, -63.13], note: "FICTICIO" },
      created_at: NOW,
    },
    {
      id: DEMO_ZONE_IDS.norte,
      slug: "norte",
      name: "Norte / Urubó acceso (demo)",
      bbox: { sw: [-17.74, -63.22], ne: [-17.7, -63.18], note: "FICTICIO" },
      created_at: NOW,
    },
    {
      id: DEMO_ZONE_IDS.palmaira,
      slug: "palmaira",
      name: "Palmaira (demo)",
      bbox: { sw: [-17.77, -63.21], ne: [-17.75, -63.19], note: "FICTICIO" },
      created_at: NOW,
    },
    {
      id: DEMO_ZONE_IDS.plan_3000,
      slug: "plan_3000",
      name: "Plan 3000 (demo)",
      bbox: { sw: [-17.82, -63.14], ne: [-17.78, -63.1], note: "FICTICIO" },
      created_at: NOW,
    },
    {
      id: DEMO_ZONE_IDS.radial_26,
      slug: "radial_26",
      name: "Radial 26 (demo)",
      bbox: { sw: [-17.8, -63.18], ne: [-17.77, -63.15], note: "FICTICIO" },
      created_at: NOW,
    },
    {
      id: DEMO_ZONE_IDS.santos_dumont,
      slug: "santos_dumont",
      name: "Santos Dumont (demo)",
      bbox: { sw: [-17.8, -63.16], ne: [-17.78, -63.14], note: "FICTICIO" },
      created_at: NOW,
    },
    {
      id: DEMO_ZONE_IDS.uv_128,
      slug: "uv_128",
      name: "UV 128 (demo)",
      bbox: { sw: [-17.8, -63.2], ne: [-17.785, -63.18], note: "FICTICIO" },
      created_at: NOW,
    },
    {
      id: DEMO_ZONE_IDS.villa_1ro_de_mayo,
      slug: "villa_1ro_de_mayo",
      name: "Villa 1º de Mayo (demo)",
      bbox: { sw: [-17.83, -63.18], ne: [-17.8, -63.15], note: "FICTICIO" },
      created_at: NOW,
    },
  ],
};

export const MOCK_ESTABLISHMENTS: EstablishmentPublic[] = [
  {
    id: "est-001",
    registry_label: "Punto registrado SCZ-A-104",
    zone_id: DEMO_ZONE_IDS.equipetrol,
  },
  {
    id: "est-002",
    registry_label: "Punto registrado SCZ-A-221",
    zone_id: DEMO_ZONE_IDS.equipetrol,
  },
  {
    id: "est-003",
    registry_label: "Punto registrado SCZ-B-018",
    zone_id: DEMO_ZONE_IDS.plan_3000,
  },
  {
    id: "est-004",
    registry_label: "Punto registrado SCZ-C-055",
    zone_id: DEMO_ZONE_IDS.uv_128,
  },
  {
    id: "est-005",
    registry_label: "Punto registrado SCZ-D-090",
    zone_id: DEMO_ZONE_IDS.centro,
  },
];

function demoPost(
  id: string,
  zone_id: string,
  type: IncidentType,
  status: PostStatus,
  title: string,
  body: string,
  grid_lat: number,
  grid_lng: number,
  extra: Partial<PostPublic> = {},
): PostPublic {
  return {
    id,
    zone_id,
    type,
    status,
    title,
    body,
    grid_lat,
    grid_lng,
    is_establishment: false,
    publish_gate: "published",
    created_at: NOW,
    updated_at: NOW,
    vote_count: 3,
    ...extra,
  };
}

export const MOCK_POSTS: PostPublic[] = [
  demoPost(
    "p-1001",
    DEMO_ZONE_IDS.equipetrol,
    "robo",
    "en_verificacion",
    "Intento de hurto cerca de la avenida principal",
    "Dos personas en motocicleta intentaron quitar un bolso a una vecina cerca de las 20:30. Había poca iluminación en la esquina.",
    -17.769,
    -63.183,
    { created_at: "2026-11-02T23:10:00.000Z", updated_at: "2026-11-03T01:00:00.000Z", vote_count: 4 },
  ),
  demoPost(
    "p-1011",
    DEMO_ZONE_IDS.equipetrol,
    "consumo_via_publica",
    "derivado",
    "Grupo en la vereda tapa el paso de noche",
    "Después de las 22:00 el cruce queda ocupado. Vecinos evitan esa cuadra para no enfrentar el grupo.",
    -17.761,
    -63.186,
    { created_at: "2026-11-01T23:50:00.000Z", updated_at: "2026-11-02T18:20:00.000Z", vote_count: 5 },
  ),
  demoPost(
    "p-1003",
    DEMO_ZONE_IDS.plan_3000,
    "vandalismo",
    "corroborado",
    "Daños a mobiliario en la plaza del sector",
    "Bancas y un basurero fueron destruidos durante la madrugada. Varios vecinos confirmaron lo ocurrido.",
    -17.801,
    -63.12,
    { created_at: "2026-11-01T14:00:00.000Z", updated_at: "2026-11-02T10:00:00.000Z", vote_count: 7 },
  ),
  demoPost(
    "p-1012",
    DEMO_ZONE_IDS.plan_3000,
    "convivencia_nocturna",
    "reportado",
    "Música a todo volumen hasta la madrugada",
    "El ruido llega a las casas de la manzana. Piden que se respete el horario de descanso.",
    -17.798,
    -63.126,
    {
      is_establishment: true,
      created_at: "2026-11-03T06:30:00.000Z",
      updated_at: "2026-11-03T06:30:00.000Z",
      vote_count: 10,
    },
  ),
  demoPost(
    "p-1005",
    DEMO_ZONE_IDS.uv_128,
    "consumo_via_publica",
    "resuelto",
    "Consumo problemático frente a la escuela",
    "Grupo frecuente en la vereda frente a la unidad educativa. Tras derivación, hubo intervención y el punto quedó limpio.",
    -17.792,
    -63.19,
    { created_at: "2026-10-20T11:00:00.000Z", updated_at: "2026-10-28T16:00:00.000Z", vote_count: 9 },
  ),
  demoPost(
    "p-1015",
    DEMO_ZONE_IDS.uv_128,
    "consumo_via_publica",
    "resuelto",
    "Punto frente al canal ya fue limpiado",
    "Había un grupo frecuente junto al canal. Tras el aviso vecinal, el tramo quedó despejado.",
    -17.79,
    -63.188,
    { created_at: "2026-10-27T14:20:00.000Z", updated_at: "2026-11-01T11:00:00.000Z", vote_count: 7 },
  ),
  demoPost(
    "p-1002",
    DEMO_ZONE_IDS.centro,
    "convivencia_nocturna",
    "reportado",
    "Ruido excesivo pasada la medianoche",
    "Desde hace tres noches hay música a alto volumen que no deja dormir a las familias de la cuadra.",
    -17.78,
    -63.181,
    {
      is_establishment: true,
      created_at: "2026-11-03T08:20:00.000Z",
      updated_at: "2026-11-03T08:20:00.000Z",
      vote_count: 2,
    },
  ),
  demoPost(
    "p-1004",
    DEMO_ZONE_IDS.centro,
    "acoso",
    "derivado",
    "Acoso reiterado en parada de micro",
    "Una persona insiste en seguir a peatones en la parada durante la tarde. Se pidió apoyo a autoridad local.",
    -17.778,
    -63.179,
    { created_at: "2026-10-30T19:40:00.000Z", updated_at: "2026-11-01T12:00:00.000Z", vote_count: 11 },
  ),
  demoPost(
    "p-1006",
    DEMO_ZONE_IDS.la_ramada,
    "robo",
    "sin_respuesta",
    "Hurto de bicicleta en vía secundaria",
    "Sacaron una bicicleta amarrada a un poste cerca del mediodía. No hubo respuesta formal aún.",
    -17.8,
    -63.16,
    { created_at: "2026-10-25T17:30:00.000Z", vote_count: 1 },
  ),
  demoPost(
    "p-1016",
    DEMO_ZONE_IDS.la_ramada,
    "vandalismo",
    "reportado",
    "Señal de tránsito doblada en la esquina",
    "La placa quedó inclinada y cuesta verla de noche. Varios vecinos piden reposición.",
    -17.802,
    -63.158,
    { created_at: "2026-11-02T15:10:00.000Z", vote_count: 4 },
  ),
  demoPost(
    "p-1007",
    DEMO_ZONE_IDS.el_trigo,
    "vandalismo",
    "reportado",
    "Grafitis ofensivos en muro comunitario",
    "Aparecieron pintadas en el muro del espacio vecinal. Se solicita limpieza y mayor vigilancia nocturna.",
    -17.82,
    -63.15,
    { created_at: "2026-11-03T12:00:00.000Z", vote_count: 0 },
  ),
  demoPost(
    "p-1013",
    DEMO_ZONE_IDS.el_trigo,
    "vandalismo",
    "en_verificacion",
    "Basurero volcado y vidrios en la plaza",
    "Amaneció el espacio sucio y con vidrios. Hay fotos de vecinos, sin nombres de personas.",
    -17.818,
    -63.148,
    { created_at: "2026-11-02T12:45:00.000Z", updated_at: "2026-11-02T19:10:00.000Z", vote_count: 3 },
  ),
  demoPost(
    "p-1017",
    DEMO_ZONE_IDS.los_cholitos,
    "robo",
    "en_verificacion",
    "Arrebato de mochila cerca del paradero",
    "Una moto rozó la vereda y se llevaron una mochila. El cruce quedó sin testigos fijos.",
    -17.84,
    -63.14,
    { created_at: "2026-11-03T13:20:00.000Z", vote_count: 5 },
  ),
  demoPost(
    "p-1018",
    DEMO_ZONE_IDS.los_cholitos,
    "acoso",
    "reportado",
    "Seguimiento a peatones en la cancha",
    "Alguien insiste en acercarse a quienes salen del partido. Ya ocurrió dos tardes seguidas.",
    -17.838,
    -63.142,
    { created_at: "2026-11-02T22:05:00.000Z", vote_count: 6 },
  ),
  demoPost(
    "p-1010",
    DEMO_ZONE_IDS.norte,
    "acoso",
    "corroborado",
    "Acoso a peatones en la vereda del mercado",
    "Una persona se acerca a quienes caminan con compras y no se retira. Ya lo vieron en tres tardes distintas.",
    -17.72,
    -63.2,
    { created_at: "2026-11-02T21:15:00.000Z", updated_at: "2026-11-03T09:00:00.000Z", vote_count: 13 },
  ),
  demoPost(
    "p-1019",
    DEMO_ZONE_IDS.norte,
    "robo",
    "reportado",
    "Intento de hurto en el acceso al puente",
    "Frenaron una moto junto a quien esperaba transporte. No hubo forcejeo, pero genera alarma.",
    -17.722,
    -63.198,
    { created_at: "2026-11-03T18:40:00.000Z", vote_count: 8 },
  ),
  demoPost(
    "p-1020",
    DEMO_ZONE_IDS.palmaira,
    "vandalismo",
    "corroborado",
    "Luminaria rota en la plaza vecinal",
    "El farol amaneció con el vidrio hecho trizas. La cuadra queda oscura al cruzar.",
    -17.76,
    -63.2,
    { created_at: "2026-11-01T09:30:00.000Z", vote_count: 6 },
  ),
  demoPost(
    "p-1021",
    DEMO_ZONE_IDS.palmaira,
    "convivencia_nocturna",
    "en_verificacion",
    "Fiesta en vereda hasta la madrugada",
    "El ruido no baja después de las 2. Varias casas piden que se respete el descanso.",
    -17.758,
    -63.198,
    { created_at: "2026-11-03T07:15:00.000Z", vote_count: 9 },
  ),
  demoPost(
    "p-1014",
    DEMO_ZONE_IDS.radial_26,
    "robo",
    "reportado",
    "Moto sospechosa dando vueltas a la cuadra",
    "Dos personas en moto recorren la misma manzana cada pocos minutos. No hubo forcejeo, pero genera alarma.",
    -17.785,
    -63.165,
    { created_at: "2026-11-03T17:05:00.000Z", vote_count: 4 },
  ),
  demoPost(
    "p-1022",
    DEMO_ZONE_IDS.radial_26,
    "consumo_via_publica",
    "derivado",
    "Grupo en el recoveco tapa la vereda",
    "Al atardecer el paso queda bloqueado. Se pidió apoyo para despejar el tramo.",
    -17.788,
    -63.162,
    { created_at: "2026-11-02T20:10:00.000Z", vote_count: 7 },
  ),
  demoPost(
    "p-1023",
    DEMO_ZONE_IDS.santos_dumont,
    "acoso",
    "en_verificacion",
    "Acoso en la parada hacia el centro",
    "Una persona comenta en voz alta a quienes esperan el micro. Varias vecinas cambiaron de parada.",
    -17.79,
    -63.15,
    { created_at: "2026-11-03T11:25:00.000Z", vote_count: 8 },
  ),
  demoPost(
    "p-1024",
    DEMO_ZONE_IDS.santos_dumont,
    "vandalismo",
    "reportado",
    "Bancas de la plazoleta destrozadas",
    "Quedaron tablas sueltas y clavos a la vista. El espacio ya no se usa de noche.",
    -17.792,
    -63.148,
    { created_at: "2026-11-01T16:40:00.000Z", vote_count: 5 },
  ),
  demoPost(
    "p-1008",
    DEMO_ZONE_IDS.anillo,
    "robo",
    "en_verificacion",
    "Arrebato de celular en parada del anillo",
    "Un motociclista frenó de golpe y se llevó un celular. Varios vecinos vieron la misma moto minutos antes.",
    -17.78,
    -63.178,
    { created_at: "2026-11-03T15:40:00.000Z", updated_at: "2026-11-03T16:10:00.000Z", vote_count: 6 },
  ),
  demoPost(
    "p-1009",
    DEMO_ZONE_IDS.anillo,
    "vandalismo",
    "reportado",
    "Farol de esquina apagado desde el fin de semana",
    "El poste quedó oscuro y la vereda se siente insegura al cruzar de noche. Se pide reparación del alumbrado.",
    -17.776,
    -63.182,
    { created_at: "2026-11-03T10:05:00.000Z", vote_count: 8 },
  ),
  demoPost(
    "p-1025",
    DEMO_ZONE_IDS.villa_1ro_de_mayo,
    "robo",
    "corroborado",
    "Hurto de herramientas en la vereda",
    "Sacaron una caja dejada un momento junto a una obra menor. Varios vecinos vieron la misma camioneta.",
    -17.815,
    -63.165,
    { created_at: "2026-11-02T14:55:00.000Z", vote_count: 6 },
  ),
  demoPost(
    "p-1026",
    DEMO_ZONE_IDS.villa_1ro_de_mayo,
    "convivencia_nocturna",
    "reportado",
    "Moto con escape libre a toda hora",
    "Pasan a alta velocidad y el ruido entra a las casas. Piden control en el tramo del mercado.",
    -17.818,
    -63.162,
    { created_at: "2026-11-03T04:20:00.000Z", vote_count: 12 },
  ),
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
  if (post) return { post: structuredClone(post) };
  const base = MOCK_POSTS.find((item) => id.startsWith(`${item.id}-`));
  if (!base) {
    throw new MockApiError("NOT_FOUND", "No encontramos ese caso.", 404);
  }
  return { post: structuredClone({ ...base, id }) };
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
