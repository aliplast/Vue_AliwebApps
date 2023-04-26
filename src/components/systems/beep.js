export const beep = {
  methods: {
    playSound (error) {
      var vm = this
      var audioCtx = new (window.AudioContext || window.webkitAudioContext)()

      vm.oscillator = audioCtx.createOscillator()
      var gainNode = audioCtx.createGain()

      vm.oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      vm.oscillator.type = 'square' // 'sine' | 'sawtooth' | 'triangle' | 'square'
      if (error) {
        vm.oscillator.frequency.value = '200'
      } else {
        vm.oscillator.frequency.value = '1200'
      }
      vm.oscillator.start()
      vm.oscillator.stop(audioCtx.currentTime + 0.3)
    }
  }
}
