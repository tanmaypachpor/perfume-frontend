interface ProductGalleryProps {
  productName: string;
  activeImageUrl: string;
  imageError: boolean;
  productImages: string[];
  activeImageIndex: number;
  hasMultipleImages: boolean;
  onImageError: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSelectImage: (index: number) => void;
}

export function ProductGallery({
  productName,
  activeImageUrl,
  imageError,
  productImages,
  activeImageIndex,
  hasMultipleImages,
  onImageError,
  onPrevious,
  onNext,
  onSelectImage,
}: ProductGalleryProps) {
  return (
    <div className="product-details-image-container">
      {activeImageUrl && !imageError ? (
        <>
          <img
            key={activeImageUrl}
            src={activeImageUrl}
            alt={productName}
            className="details-product-image"
            fetchPriority="high"
            onError={onImageError}
          />

          {hasMultipleImages && (
            <>
              <button
                type="button"
                className="image-carousel-arrow image-carousel-prev"
                aria-label="Previous image"
                onClick={onPrevious}
              >
                ←
              </button>
              <button
                type="button"
                className="image-carousel-arrow image-carousel-next"
                aria-label="Next image"
                onClick={onNext}
              >
                →
              </button>
              <div className="image-carousel-dots">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`image-carousel-dot ${
                      index === activeImageIndex ? "active" : ""
                    }`}
                    aria-label={`View image ${index + 1}`}
                    onClick={() => onSelectImage(index)}
                  />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="details-bottle">
          <div className="details-bottle-cap" />
          <div className="details-bottle-neck" />
          <div className="details-bottle-body">
            <span>K</span>
            <strong>KEIAN</strong>
          </div>
        </div>
      )}
    </div>
  );
}
