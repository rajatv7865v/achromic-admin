import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../layout/dashboardLayout";
import { getGalleries } from "../../services/gallery";
import { useAsync } from "../../hooks";
import toast from "react-hot-toast";

interface GalleryItem {
  _id: string;
  title: string;
  filePath: string | string[];
  event: {
    name: string;
  };
}

const GalleryDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>(); // This is the event ID
  const navigate = useNavigate();
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { run: fetchGalleries } = useAsync(getGalleries, {
    onSuccess: (result: any) => {
      if (result?.data) {
        setGalleryData(result.data.data);
      }
      setLoading(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to fetch gallery images");
      setLoading(false);
    },
  });

  useEffect(() => {
    if (eventId) {
      setLoading(true);
      fetchGalleries({
        eventId, // Using the event ID from the URL
        page: 1,
        limit: 100, // Get all images for the event
        sortBy: "createdAt",
        sortOrder: "desc",
      });
    }
  }, [eventId]);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Convert filePath to array for consistent handling
  const getAllImages = (): string[] => {
    const allImages: string[] = [];
    galleryData.forEach(item => {
      if (Array.isArray(item.filePath)) {
        allImages.push(...item.filePath);
      } else {
        allImages.push(item.filePath as string);
      }
    });
    return allImages;
  };

  const allImages = getAllImages();

  return (
    <DashboardLayout>
      <section className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Gallery: {galleryData.length > 0 ? galleryData[0].event.name : "Loading..."}
          </h1>
          <button
            onClick={handleBack}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
          >
            Back
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600">Loading gallery images...</p>
          </div>
        ) : allImages.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600">No images found for this event.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allImages.map((image, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={image}
                    alt={`Gallery item ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
};

export default GalleryDetail;