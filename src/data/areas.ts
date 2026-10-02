import type { Area } from "@/types";

export const AREAS: Area[] = [
  { id: "satellite", name: "Satellite", city: "Ahmedabad", location: { lat: 23.0276, lng: 72.5073 } },
  { id: "vastrapur", name: "Vastrapur", city: "Ahmedabad", location: { lat: 23.0364, lng: 72.528 } },
  { id: "bodakdev", name: "Bodakdev", city: "Ahmedabad", location: { lat: 23.035, lng: 72.496 } },
  { id: "prahlad-nagar", name: "Prahlad Nagar", city: "Ahmedabad", location: { lat: 23.019, lng: 72.507 } },
  { id: "jodhpur", name: "Jodhpur", city: "Ahmedabad", location: { lat: 23.035, lng: 72.515 } },
];

export const DEMO_USER_HOME: GeoPointLite = { lat: 23.0272, lng: 72.5089 };

type GeoPointLite = { lat: number; lng: number };
