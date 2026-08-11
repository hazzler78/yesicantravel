// TEMPORARY: local UI fixtures for screenshotting without a LiteAPI key.
// Not committed.

const NAMES = [
  "Hôtel Saint-Germain Rive Gauche",
  "The Marais Townhouse",
  "Citizen Lodge Bastille",
  "Maison Clarisse Montmartre",
  "Hotel Lumière Opéra",
  "The Quiet Quarter Canal",
];

const ADDRESSES = [
  "12 Rue de Buci, 6th arrondissement, Paris",
  "41 Rue des Archives, 3rd arrondissement, Paris",
  "8 Boulevard Richard-Lenoir, 11th arrondissement, Paris",
  "22 Rue Lepic, 18th arrondissement, Paris",
  "3 Rue Auber, 9th arrondissement, Paris",
  "77 Quai de Valmy, 10th arrondissement, Paris",
];

const FACILITIES = [
  ["24-hour front desk", "Elevator", "Safety deposit box", "Free WiFi", "Non-smoking rooms"],
  ["24-hour reception", "CCTV in common areas", "Free WiFi", "Elevator"],
  ["Free WiFi", "Elevator", "Non-smoking rooms"],
  ["24-hour front desk", "Security", "In-room safe", "Free WiFi", "Illuminated parking"],
  ["24 hour front desk", "Elevator", "Free WiFi"],
  ["Free WiFi", "Safety deposit box"],
];

export function fixtureHotels() {
  return NAMES.map((name, index) => ({
    id: `fx-${index + 1}`,
    name,
    address: ADDRESSES[index],
    rating: [4.8, 4.6, 4.4, 4.2, 3.9, 4.7][index],
    starRating: 4,
    main_photo: `https://picsum.photos/seed/yict${index + 1}/640/480`,
    hotelImages: Array.from({ length: 6 }, (_, i) => ({
      url: `https://picsum.photos/seed/yict${index + 1}-${i}/900/700`,
    })),
    hotelDescription:
      "<p>A calm, well-run hotel a few minutes from the metro, with a staffed desk around the clock and a lift to every floor.</p>",
    hotelFacilities: FACILITIES[index],
    location: { latitude: 48.85 + index * 0.006, longitude: 2.33 + index * 0.008 },
    rooms: [
      { id: 1, roomName: "Classic Double", photos: [{ url: `https://picsum.photos/seed/room${index}a/600/450` }] },
      { id: 2, roomName: "Superior Queen", photos: [{ url: `https://picsum.photos/seed/room${index}b/600/450` }] },
    ],
  }));
}

export function fixtureRates() {
  const hotels = fixtureHotels();
  return {
    data: hotels.map((h, index) => ({
      hotelId: h.id,
      roomTypes: [
        {
          offerId: `offer-${index}-1`,
          rates: [
            {
              name: "Classic Double Room",
              mappedRoomId: 1,
              offerId: `offer-${index}-1`,
              boardName: "Room only",
              retailRate: { total: [{ amount: 168 + index * 41, currency: "EUR" }] },
              cancellationPolicies: { refundableTag: index % 2 === 0 ? "RFN" : "NRFN" },
            },
            {
              name: "Classic Double Room, breakfast included",
              mappedRoomId: 1,
              offerId: `offer-${index}-1b`,
              boardName: "Breakfast included",
              retailRate: { total: [{ amount: 198 + index * 41, currency: "EUR" }] },
              cancellationPolicies: { refundableTag: "RFN" },
            },
          ],
        },
        {
          offerId: `offer-${index}-2`,
          rates: [
            {
              name: "Superior Queen Room",
              mappedRoomId: 2,
              offerId: `offer-${index}-2`,
              boardName: "Breakfast included",
              retailRate: { total: [{ amount: 245 + index * 39, currency: "EUR" }] },
              cancellationPolicies: { refundableTag: "RFN" },
            },
          ],
        },
      ],
    })),
    hotels: hotels.map((h) => ({
      id: h.id,
      name: h.name,
      address: h.address,
      rating: h.rating,
      main_photo: h.main_photo,
      location: h.location,
    })),
  };
}

export function fixtureHotel(hotelId: string) {
  const hotels = fixtureHotels();
  return { data: hotels.find((h) => h.id === hotelId) ?? hotels[0] };
}

export function fixtureReviews() {
  return {
    data: {
      reviews: [
        {
          name: "Hanna",
          averageScore: 9.4,
          country: "Sweden",
          date: "2026-05-12",
          headline: "Felt completely fine walking back at night",
          pros: "Reception staffed all night, street outside is busy and well lit, and the lift goes straight to the room floor.",
          cons: "Room was small, but that's central Paris.",
        },
        {
          name: "Marta",
          averageScore: 8.8,
          country: "Spain",
          date: "2026-04-02",
          headline: "Good location, thin walls",
          pros: "Two minutes from the metro and the staff stored my bag after checkout.",
          cons: "You hear the corridor door at night.",
        },
      ],
      sentimentAnalysis: {
        pros: ["Central location", "Staffed reception at night", "Clean rooms"],
        cons: ["Small rooms", "Some street noise"],
        categories: [
          { name: "Location", rating: 9.5 },
          { name: "Cleanliness", rating: 9.1 },
          { name: "Staff", rating: 9.3 },
        ],
      },
    },
  };
}
