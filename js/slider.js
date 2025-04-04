document.addEventListener('DOMContentLoaded', function() {
  const compressionLevel = document.getElementById('compression-level');
  const compressionDisplay = document.createElement('div');
  
  // Create and add the compression level display
  if (compressionLevel) {
    // Create display element
    compressionDisplay.className = 'text-sm font-medium text-center mt-2';
    compressionDisplay.id = 'compression-display';
    compressionLevel.parentNode.insertBefore(compressionDisplay, compressionLevel.nextSibling);
    
    // Update display and slider color based on value
    const updateDisplay = function() {
      const value = compressionLevel.value;
      compressionDisplay.textContent = `Compression: ${value}%`;
      
      if (value < 33) {
        compressionLevel.classList.remove('bg-yellow-300', 'bg-red-400');
        compressionLevel.classList.add('bg-green-300');
        compressionDisplay.className = 'text-sm font-medium text-center mt-2 text-green-600';
      } else if (value < 66) {
        compressionLevel.classList.remove('bg-green-300', 'bg-red-400');
        compressionLevel.classList.add('bg-yellow-300');
        compressionDisplay.className = 'text-sm font-medium text-center mt-2 text-yellow-600';
      } else {
        compressionLevel.classList.remove('bg-green-300', 'bg-yellow-300');
        compressionLevel.classList.add('bg-red-400');
        compressionDisplay.className = 'text-sm font-medium text-center mt-2 text-red-600';
      }
    };
    
    // Set initial display
    updateDisplay();
    
    // Update on slider change
    compressionLevel.addEventListener('input', updateDisplay);
  }
});