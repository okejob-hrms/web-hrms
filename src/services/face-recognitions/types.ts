export interface FaceResponse {
    data: FaceResponseData;
    message: string;
    status: string;
}

export interface FaceResponseData {
    created_at: string;
    email: string;
    faces: FaceResponseList[];
    id: number;
    name: string;
    updated_at: string;
}

export interface FaceResponseList {
    created_at: null;
    created_by: number;
    id: number;
    image_path: string;
    image_url: string;
    is_active: boolean;
    quality_score: number;
    source: number;
    updated_at: null;
    user_id: number;
}

export interface FaceRequest {
    file: File;
    user_id: number;
}