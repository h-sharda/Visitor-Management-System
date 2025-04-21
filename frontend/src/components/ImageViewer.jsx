import { useEffect } from "react";

const ImageViewer = ({ imageUrl, onClose }) => {
  useEffect(() => {
    // Add escape key listener when component mounts
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    // Clean up listener when component unmounts
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);

  const handleOverlayClick = (e) => {
    // Only close if clicking the overlay background (not the image)
    if (e.target.classList.contains("expanded-image-overlay")) {
      onClose();
    }
  };

  return (
    <div className="expanded-image-overlay" onClick={handleOverlayClick}>
      <img src={imageUrl} className="expanded-image" alt="Expanded view" />
      <button className="close-button" onClick={onClose}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default ImageViewer;
