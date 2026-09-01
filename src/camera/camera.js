export function startCamera(videoElement, stopButton) {
  return navigator.mediaDevices
    .getUserMedia({ video: {} })
    .then((stream) => {
      if (videoElement.srcObject !== null) {
        console.log('Please turn off before starting a new stream');
        return;
      }
      videoElement.srcObject = stream;
      videoElement.addEventListener('loadedmetadata', () => {
        videoElement.play();
      });
      stopButton.addEventListener('click', () => {
        stream.getTracks().forEach((track) => track.stop());
        videoElement.srcObject = null;
      });
    })
    .catch(alert);
}
