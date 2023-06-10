Vue.createApp({
  data() {
    return {
      scanning: false,
      scannedCodes: [],
      codeReader: null,
      videoStream: null
    };
  },
  mounted() {
    this.codeReader = new ZXing.BrowserBarcodeReader();
  },
  methods: {
    startScan() {
      this.scanning = true;

      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          const rearCamera = videoDevices.find(device => device.label.toLowerCase().includes('rear'));

          if (rearCamera) {
            navigator.mediaDevices.getUserMedia({ video: { deviceId: rearCamera.deviceId } })
              .then(stream => {
                this.$refs.video.srcObject = stream;
                this.videoStream = stream;

                this.codeReader.decodeFromVideoElement(this.$refs.video, (result, err) => {
                  if (result) {
                    this.scannedCodes.push(result.text);
                  }
                  if (err && !(err instanceof ZXing.NotFoundException)) {
                    console.error(err);
                  }
                });
              })
              .catch(error => {
                console.error(error);
                this.stopScan();
              });
          } else {
            console.error('No se encontró la cámara trasera.');
            this.stopScan();
          }
        })
        .catch(error => {
          console.error(error);
          this.stopScan();
        });
    },
    stopScan() {
      this.scanning = false;
      this.codeReader.reset();
      if (this.videoStream) {
        this.videoStream.getTracks().forEach(track => track.stop());
        this.videoStream = null;
      }
    }
  }
}).mount('#app');
