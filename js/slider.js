document.addEventListener('DOMContentLoaded', function() {
  const compressionLevel = document.getElementById('compression-level');
  
  if (compressionLevel) {

    compressionLevel.addEventListener('input', function() {
      if (compressionLevel.value < 33) {
        compressionLevel.classList.remove('bg-yellow-300', 'bg-red-400');
        compressionLevel.classList.add('bg-green-300');
      } else if (compressionLevel.value < 66) {
        compressionLevel.classList.remove('bg-green-300', 'bg-red-400');
        compressionLevel.classList.add('bg-yellow-300');
      } else {
        compressionLevel.classList.remove('bg-green-300', 'bg-yellow-300');
        compressionLevel.classList.add('bg-red-400');
      }
    });
    
    if (compressionLevel.value < 33) {
      compressionLevel.classList.add('bg-green-300');
    } else if (compressionLevel.value < 66) {
      compressionLevel.classList.add('bg-yellow-300');
    } else {
      compressionLevel.classList.add('bg-red-400');
    }
  }
});