export interface FeedbackRow {
  id: string;
  ref: string;
  project: string;
  type: string;
  message: string;
  email: string | null;
  status: string;
  /** Praise the sender agreed may be shown publicly. */
  testimonial_ok: boolean;
  /** Optional 1–5 stars. */
  rating: number | null;
  created_at: string;
}

export interface FeedbackListResponse {
  rows: FeedbackRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  statusCounts: { all: number; new: number; triaged: number; done: number };
}
