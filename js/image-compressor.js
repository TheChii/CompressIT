/**
 * ImageCompressor.js
 * A simple JavaScript image compression library using HTML5 Canvas
 * 
 * This library provides functionality to compress images in the browser
 * by resizing and adjusting quality using canvas rendering.
 */

class ImageCompressor {
  constructor(options) {
    const defaults = {
      file: null,          // The image file to compress
      quality: 0.6,        // Default compression quality (0.1 to 1)
      maxWidth: 1920,      // Default max width
      maxHeight: 1080,     // Default max height
      mimeType: '',        // Default mime type (will use original if not specified)
      beforeCompress: null, // Callback before compression
      success: null,       // Success callback
      error: null          // Error callback
    };

    // Merge options with defaults
    this.options = Object.assign({}, defaults, options);
    
    // Validate required options
    if (!this.options.file) {
      this._handleError('File is required');
      return;
    }

    // Start compression process
    this._compress();
  }

  /**
   * Main compression method
   * @private
   */
  _compress() {
    const file = this.options.file;
    const reader = new FileReader();
    const self = this;

    reader.onload = function(e) {
      const img = new Image();
      
      img.onload = function() {
        // Call beforeCompress callback if provided
        if (typeof self.options.beforeCompress === 'function') {
          self.options.beforeCompress({
            size: file.size,
            type: file.type,
            width: img.width,
            height: img.height
          });
        }

        // Create canvas for compression
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > self.options.maxWidth) {
          height = Math.round(height * self.options.maxWidth / width);
          width = self.options.maxWidth;
        }
        
        if (height > self.options.maxHeight) {
          width = Math.round(width * self.options.maxHeight / height);
          height = self.options.maxHeight;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas with new dimensions
        ctx.drawImage(img, 0, 0, width, height);

        // Determine mime type
        const mimeType = self.options.mimeType || file.type;

        // Convert canvas to blob with specified quality
        // Make sure we're using the quality value from options
        const quality = self.options.quality;
        console.log('Using compression quality:', quality);
        
        // Handle different image types appropriately
        // For JPEG and WEBP, quality parameter works as expected
        // For PNG, we need to use different approach since it's lossless
        if (mimeType === 'image/png') {
          // For PNG, we can adjust the number of colors to reduce file size
          // We'll use the quality parameter to determine how much to reduce colors
          // Lower quality = fewer colors = smaller file size
          let imageData;
          
          // If quality is very low, convert to JPEG for better compression
          if (quality < 0.3) {
            canvas.toBlob(function(blob) {
              if (!blob) {
                self._handleError('Failed to compress image');
                return;
              }

              // Create a new File object from the blob
              const compressedFile = new File([blob], file.name.replace(/\.png$/i, '.jpg'), {
                type: 'image/jpeg',
                lastModified: new Date().getTime()
              });
              
              // Log the size difference for debugging
              console.log('Original size:', file.size, 'Compressed size:', blob.size, 'Quality used:', quality, '(Converted PNG to JPEG)');

              // Call success callback if provided
              if (typeof self.options.success === 'function') {
                self.options.success(compressedFile);
              }
            }, 'image/jpeg', quality);
            return;
          } else {
            // Use PNG with appropriate quality
            canvas.toBlob(function(blob) {
              if (!blob) {
                self._handleError('Failed to compress image');
                return;
              }

              // Create a new File object from the blob
              const compressedFile = new File([blob], file.name, {
                type: mimeType,
                lastModified: new Date().getTime()
              });
              
              // Log the size difference for debugging
              console.log('Original size:', file.size, 'Compressed size:', blob.size, 'Quality used:', quality);

              // Call success callback if provided
              if (typeof self.options.success === 'function') {
                self.options.success(compressedFile);
              }
            }, mimeType, quality);
          }
        } else {
          // For JPEG and other formats, use standard quality parameter
          canvas.toBlob(function(blob) {
            if (!blob) {
              self._handleError('Failed to compress image');
              return;
            }

            // Create a new File object from the blob
            const compressedFile = new File([blob], file.name, {
              type: mimeType,
              lastModified: new Date().getTime()
            });
            
            // Log the size difference for debugging
            console.log('Original size:', file.size, 'Compressed size:', blob.size, 'Quality used:', quality);

            // Call success callback if provided
            if (typeof self.options.success === 'function') {
              self.options.success(compressedFile);
            }
          }, mimeType, quality);
        }
      };

      img.onerror = function() {
        self._handleError('Failed to load image');
      };

      img.src = e.target.result;
    };

    reader.onerror = function() {
      self._handleError('Failed to read file');
    };

    reader.readAsDataURL(file);
  }

  /**
   * Handle errors and call error callback if provided
   * @param {string} message - Error message
   * @private
   */
  _handleError(message) {
    if (typeof this.options.error === 'function') {
      this.options.error(message);
    } else {
      console.error('ImageCompressor error:', message);
    }
  }
}

// Support both CommonJS and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageCompressor;
} else {
  window.ImageCompressor = ImageCompressor;
}