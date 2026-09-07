import { http } from "./http";

export interface UploadResponse {
    url: string;
    filename: string;
    size: number;
}

export const uploadImage = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    return http.post<UploadResponse>("/admin/upload/image", formData);
};

export const uploadDocument = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    return http.post<UploadResponse>("/admin/upload/document", formData);
};