import { useState, useRef, ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface UploadWidgetProps {
  slug: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "processing" | "complete" | "error";
  error?: string;
}

export const UploadWidget = ({ slug }: UploadWidgetProps) => {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Update status to uploading
      setUploads((prev) =>
        prev.map((u) =>
          u.file === file ? { ...u, status: "uploading" as const } : u
        )
      );

      // Get file dimensions for images/videos
      const dimensions = await getFileDimensions(file);

      // Request upload URL
      const uploadRequest = await apiClient.requestUpload(slug, {
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      });

      // Upload to Supabase
      await apiClient.uploadToSignedUrl(
        uploadRequest.signedUrl,
        file,
        (progress) => {
          setUploads((prev) =>
            prev.map((u) => (u.file === file ? { ...u, progress } : u))
          );
        }
      );

      // Update status to processing
      setUploads((prev) =>
        prev.map((u) =>
          u.file === file
            ? { ...u, status: "processing" as const, progress: 100 }
            : u
        )
      );

      // Complete upload
      await apiClient.completeUpload(slug, {
        path: uploadRequest.path,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        ...dimensions,
      });

      // Update status to complete
      setUploads((prev) =>
        prev.map((u) =>
          u.file === file ? { ...u, status: "complete" as const } : u
        )
      );

      // Invalidate memory query to refetch
      queryClient.invalidateQueries({ queryKey: ["memory", slug] });

      // Remove from upload list after 2 seconds
      setTimeout(() => {
        setUploads((prev) => prev.filter((u) => u.file !== file));
      }, 2000);
    },
    onError: (error, file) => {
      setUploads((prev) =>
        prev.map((u) =>
          u.file === file
            ? {
                ...u,
                status: "error" as const,
                error: (error as Error).message,
              }
            : u
        )
      );
    },
  });

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Add files to upload queue
    const newUploads: UploadProgress[] = files.map((file) => ({
      file,
      progress: 0,
      status: "pending",
    }));

    setUploads((prev) => [...prev, ...newUploads]);

    // Start uploading
    files.forEach((file) => {
      uploadMutation.mutate(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-purple-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Share Your Photos & Videos
          </h2>
          <p className="text-sm text-gray-600">
            Capture and upload your favorite moments
          </p>
        </div>
      </div>

      <button
        onClick={openFileDialog}
        className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-5 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 touch-manipulation shadow-lg hover:shadow-xl"
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="text-lg">Take Photo or Choose Files</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="mt-6 space-y-3">
          {uploads.map((upload, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-800 truncate flex-1 max-w-[70%]">
                  {upload.file.name}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold ml-2">
                  {upload.status === "complete" && (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Done
                    </span>
                  )}
                  {upload.status === "error" && (
                    <span className="flex items-center gap-1 text-red-600">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Failed
                    </span>
                  )}
                  {upload.status === "uploading" && (
                    <span className="text-indigo-600">
                      {Math.round(upload.progress)}%
                    </span>
                  )}
                  {upload.status === "processing" && (
                    <span className="flex items-center gap-1 text-purple-600">
                      <svg
                        className="animate-spin w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing
                    </span>
                  )}
                  {upload.status === "pending" && (
                    <span className="text-gray-500">Pending...</span>
                  )}
                </span>
              </div>

              {upload.status !== "complete" && upload.status !== "error" && (
                <div className="w-full bg-white rounded-full h-2.5 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              )}

              {upload.error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-700 font-medium">
                    {upload.error}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to get image/video dimensions
async function getFileDimensions(
  file: File
): Promise<{ width?: number; height?: number; duration?: number }> {
  return new Promise((resolve) => {
    if (file.type.startsWith("image/")) {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => resolve({});
      img.src = URL.createObjectURL(file);
    } else if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
        });
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () => resolve({});
      video.src = URL.createObjectURL(file);
    } else {
      resolve({});
    }
  });
}
