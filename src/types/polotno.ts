export interface QuoteItem {
  id: string;
  text: string;
  author: string;
}

export interface DesignItem {
  id: string;
  name?: string;
  previewURL?: string;
}

// API Request Response

export interface PolotnoPexelsVideoSearchResponse {
  page: number;
  per_page: number;
  total_results: number;
  url: string;
  videos: {
    id: number;
    width: number;
    height: number;
    url: string;
    image: string;
    duration: number;
    user: {
      id: number;
      name: string;
      url: string;
    };
    video_files: {
      id: number;
      quality: string;
      file_type: string;
      width: number | null;
      height: number | null;
      link: string;
    }[];
    video_pictures: {
      id: number;
      picture: string;
      nr: number;
    }[];
  }[];
}
