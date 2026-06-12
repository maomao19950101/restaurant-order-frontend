<template>
  <van-action-sheet
    v-model:show="visible"
    title="确认支付"
    :close-on-click-overlay="false"
    :closeable="false"
  >
    <div class="pay-dialog">
      <!-- 支付金额 -->
      <div class="pay-amount">
        <span class="amount-label">支付金额</span>
        <span class="amount-value">¥{{ formatAmount(amount) }}</span>
      </div>

      <!-- 支付方式 -->
      <div class="pay-method">
        <div class="method-item active">
          <svg class="method-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <span class="method-name">{{ paymentMode === 'mock' ? '模拟支付' : '微信支付' }}</span>
          <span class="method-check">✓</span>
        </div>
      </div>

      <!-- 支付按钮 -->
      <van-button
        type="primary"
        block
        round
        :loading="loading"
        loading-text="支付中..."
        @click="handlePay"
        class="pay-btn"
      >
        确认支付 ¥{{ formatAmount(amount) }}
      </van-button>

      <!-- 取消按钮 -->
      <van-button
        plain
        block
        round
        @click="handleCancel"
        class="cancel-btn"
      >
        取消支付
      </van-button>

      <!-- 提示信息 -->
      <p class="pay-tips">
        <span v-if="paymentMode === 'mock'">演示模式：点击确认即可完成支付</span>
        <span v-else>支付完成后请勿关闭页面</span>
      </p>
    </div>
  </van-action-sheet>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showToast, showDialog } from 'vant'

const props = defineProps({
  orderNo: { type: String, required: true },
  amount: { type: [Number, String], default: 0 },
  paymentMode: { type: String, default: 'mock' }
})

const emit = defineEmits(['success', 'cancel', 'close'])

const visible = ref(false)
const loading = ref(false)

const formatAmount = (val) => {
  return parseFloat(val || 0).toFixed(2)
}

// 打开支付弹窗
const open = () => {
  visible.value = true
}

// 关闭支付弹窗
const close = () => {
  visible.value = false
  emit('close')
}

// 处理支付
const handlePay = async () => {
  loading.value = true
  try {
    const res = await confirmPayment(props.orderNo)
    if (res.code === 200) {
      showToast({ message: '支付成功', type: 'success' })
      visible.value = false
      emit('success', res.data)
    } else {
      showToast({ message: res.message || '支付失败', type: 'fail' })
    }
  } catch (error) {
    showToast({ message: error.message || '支付失败', type: 'fail' })
  } finally {
    loading.value = false
  }
}

// 取消支付
const handleCancel = async () => {
  try {
    await showDialog({
      title: '提示',
      message: '确定取消支付吗？订单将在15分钟后自动取消。',
      showCancelButton: true
    })
    visible.value = false
    emit('cancel')
  } catch {
    // 用户点击取消
  }
}

// 导出方法供父组件调用
defineExpose({ open, close })
</script>

<style scoped>
.pay-dialog {
  padding: 20px 16px 30px;
}

.pay-amount {
  text-align: center;
  margin-bottom: 30px;
}

.amount-label {
  display: block;
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.amount-value {
  font-size: 36px;
  font-weight: 600;
  color: #333;
}

.pay-method {
  margin-bottom: 24px;
}

.method-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 12px;
  border: 2px solid #07c160;
}

.method-icon {
  width: 24px;
  height: 24px;
  color: #07c160;
  margin-right: 12px;
}

.method-name {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
}

.method-check {
  color: #07c160;
  font-size: 18px;
}

.pay-btn {
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  background: #07c160;
  border-color: #07c160;
  margin-bottom: 12px;
}

.cancel-btn {
  height: 44px;
  font-size: 14px;
  color: #666;
  border-color: #ddd;
  margin-bottom: 16px;
}

.pay-tips {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin: 0;
}
</style>
