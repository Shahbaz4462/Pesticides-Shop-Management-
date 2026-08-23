/**
 * Image compression utility for optimizing product images before storage
 * Reduces file size while maintaining acceptable quality for product displays
 */

export const compressImage = (
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400,
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed base64
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file before compression
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are supported' };
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }

  return { valid: true };
};

/**
 * Get approximate file size from base64 string
 */
export const getBase64Size = (base64String: string): number => {
  const base64Length = base64String.length - (base64String.indexOf(',') + 1);
  const padding = (base64String.charAt(base64String.length - 1) === '=') 
    ? (base64String.charAt(base64String.length - 2) === '=' ? 2 : 1) 
    : 0;
  return (base64Length * 0.75) - padding;
};
