import { ref } from 'vue'

/**
 * 语音播报组合式函数
 * 使用浏览器 Speech Synthesis API 实现语音播报
 */
export function useVoice() {
  const voiceEnabled = ref(true)
  const voiceVolume = ref(1) // 0-1
  const voiceRate = ref(1) // 语速 0.5-2
  const voicePitch = ref(1) // 音调 0-2

  // 检查浏览器是否支持语音合成
  const isSupported = 'speechSynthesis' in window

  // 获取中文语音
  function getChineseVoice() {
    const voices = speechSynthesis.getVoices()
    // 优先找中文语音
    return voices.find(v => v.lang.includes('zh')) ||
           voices.find(v => v.lang.includes('CN')) ||
           voices[0]
  }

  /**
   * 播报文本
   * @param {string} text - 要播报的文本
   */
  function speak(text) {
    if (!voiceEnabled.value || !isSupported) return

    // 取消之前的播报
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    const voice = getChineseVoice()

    if (voice) {
      utterance.voice = voice
    }

    utterance.lang = 'zh-CN'
    utterance.volume = voiceVolume.value
    utterance.rate = voiceRate.value
    utterance.pitch = voicePitch.value

    speechSynthesis.speak(utterance)
  }

  /**
   * 播报新订单
   * @param {object} order - 订单信息
   */
  function speakNewOrder(order) {
    if (!order) return

    const tableNo = order.tableNo || `桌${order.tableId}`
    const itemCount = order.items ? order.items.length : 0
    const dishNames = order.items ? order.items.map(i => i.dishName).join('、') : ''

    const text = `您有新订单，${tableNo}，共${itemCount}道菜，${dishNames}`
    speak(text)
  }

  /**
   * 播报催单
   * @param {object} order - 订单信息
   */
  function speakUrgeOrder(order) {
    if (!order) return

    const tableNo = order.tableNo || `桌${order.tableId}`
    const urgeCount = order.urgeCount || 1

    const text = `${tableNo}催单，这是第${urgeCount}次催单，请尽快处理`
    speak(text)
  }

  /**
   * 播报自定义文本
   * @param {string} text - 要播报的文本
   */
  function speakCustom(text) {
    speak(text)
  }

  /**
   * 停止播报
   */
  function stop() {
    if (isSupported) {
      speechSynthesis.cancel()
    }
  }

  /**
   * 切换语音开关
   */
  function toggleVoice() {
    voiceEnabled.value = !voiceEnabled.value
    if (!voiceEnabled.value) {
      stop()
    }
  }

  // 初始化加载语音列表
  if (isSupported) {
    speechSynthesis.onvoiceschanged = () => {
      // 语音列表加载完成
    }
  }

  return {
    voiceEnabled,
    voiceVolume,
    voiceRate,
    voicePitch,
    isSupported,
    speak,
    speakNewOrder,
    speakUrgeOrder,
    speakCustom,
    stop,
    toggleVoice
  }
}
