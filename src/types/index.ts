export interface Place {
  placeId: string;
  displayName: string;
  formattedAddress?: string;
}

export interface Rate {
  name: string;
  mappedRoomId: number;
  offerId: string;
  boardName: string;
  retailRate: {
    total: Array<{ amount: number; currency: string }>;
    taxesAndFees?: Array< { included: boolean; amount?: number }>;
  };
  cancellationPolicies?: {
    refundableTag: string;
    cancelPolicyInfos?: Array<{ cancelTime: string }>;
  };
}

export interface RoomType {
  offerId: string;
  rates: Rate[];
}

export interface HotelRateData {
  hotelId: string;
  roomTypes: RoomType[];
}

export interface HotelInfo {
  id: string;
  name: string;
  main_photo?: string;
  address?: string;
  rating?: number;
  tags?: string[];
  persona?: string;
  style?: string;
  story?: string;
}

export interface HotelDetail {
  id: string;
  name: string;
  hotelDescription?: string;
  main_photo?: string;
  hotelImages?: Array<{ url: string; defaultImage?: boolean }>;
  address?: string;
  city?: string;
  country?: string;
  starRating?: number;
  hotelFacilities?: string[];
  rooms?: Array<{
    id: number;
    roomName: string;
    photos?: Array<{ url: string }>;
  }>;
  sentiment_analysis?: { pros?: string[]; cons?: string[] };
}
