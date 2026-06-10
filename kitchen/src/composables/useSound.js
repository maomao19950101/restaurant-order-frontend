import { ref } from 'vue'

export function useSound() {
  const soundEnabled = ref(true)
  let audioCtx = null

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioCtx
  }

  function playNotification() {
    if (!soundEnabled.value) return

    try {
      const ctx = getAudioContext()

      // "叮咚" sound - two tones
      const now = ctx.currentTime

      // First tone: "叮" (ding)
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(880, now) // A5
      gain1.gain.setValueAtTime(0.3, now)
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.3)

      // Second tone: "咚" (dong) - lower
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(659, now + 0.15) // E5
      gain2.gain.setValueAtTime(0, now)
      gain2.gain.setValueAtTime(0.3, now + 0.15)
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + 0.15)
      osc2.stop(now + 0.5)
    } catch (e) {
      console.warn('Sound play failed:', e)
    }
  }

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
  }

  return { soundEnabled, playNotification, toggleSound }
}
