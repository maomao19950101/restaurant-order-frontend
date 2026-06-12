<template>
  <div class="review-page">
    <!-- Header -->
    <div class="review-header">
      <div class="header-nav">
        <div class="back-btn" @click="$router.back()">
          <van-icon name="arrow-left" size="20" />
        </div>
        <div class="header-title">评价订单</div>
        <div class="header-placeholder"></div>
      </div>
    </div>

    <div class="review-content" v-if="order">
      <!-- 订单信息 -->
      <div class="order-info">
        <div class="order-no">订单号：{{ order.orderNo }}</div>
        <div class="order-amount">¥{{ order.totalAmount?.toFixed(2) }}</div>
      </div>

      <!-- 评分 -->
      <div class="section-card">
        <div class="section-title">满意度评分</div>
        <div class="rating-stars">
          <div
            v-for="star in 5"
            :key="star"
            class="star-item"
            :class="{ active: star <= rating }"
            @click="rating = star"
          >
            <svg viewBox="0 0 24 24" :fill="star <= rating ? '#f59e0b' : 'none'" :stroke="star <= rating ? '#f59e0b' : '#d1d5db'" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
        </div>
        <div class="rating-text">{{ ratingText }}</div>
      </div>

      <!-- 评价标签 -->
      <div class="section-card">
        <div class="section-title">评价标签</div>
        <div class="tag-list">
          <div
            v-for="tag in defaultTags"
            :key="tag"
            class="tag-item"
            :class="{ active: selectedTags.includes(tag) }"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </div>
        </div>
      </div>

      <!-- 评价内容 -->
      <div class="section-card">
        <div class="section-title">评价内容</div>
        <textarea
          v-model="content"
          placeholder="分享您的用餐体验，帮助其他用户参考..."
          rows="4"
          class="review-textarea"
        ></textarea>
        <div class="char-count">{{ content.length }}/500</div>
      </div>

      <!-- 图片上传 -->
      <div class="section-card">
        <div class="section-title">上传图片（可选）</div>
        <div class="image-upload">
          <div
            v-for="(img, idx) in imageUrls"
            :key="idx"
            class="image-preview"
          >
            <img :src="img" alt="评价图片" />
            <div class="image-delete" @click="removeImage(idx)">
              <van-icon name="cross" size="14" />
            </div>
          </div>
          <div
            v-if="imageUrls.length < 9"
            class="image-add"
            @click="triggerUpload"
          >
            <van-icon name="plus" size="24" />
            <span>添加图片</span>
          </div>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          style="display: none"
          @change="handleFileChange"
        />
      </div>

      <!-- 匿名评价 -->
      <div class="section-card anonymous-card">
        <div class="anonymous-info">
          <div class="anonymous-title">匿名评价</div>
          <div class="anonymous-desc">开启后您的昵称将不会显示</div>
        </div>
        <van-switch v-model="isAnonymous" size="22" />
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="review-footer safe-bottom">
      <van-button
        type="primary"
        block
        round
        :loading="submitting"
        :disabled="!rating"
        @click="submitReview"
        class="submit-btn"
      >
        提交评价
      </van-button>
    </div>

    <!-- Loading -->
    <div v-if="!order" class="loading-wrap">
      <van-loading type="spinner" color="#ff6b35" vertical>加载中...</van-loading>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail, submitReview } from '../api'
import { getOpenid } from '../utils/auth'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()

const order = ref(null)
const rating = ref(0)
const content = ref('')
const selectedTags = ref([])
const imageUrls = ref([])
const isAnonymous = ref(false)
const submitting = ref(false)
const fileInput = ref(null)

const defaultTags = ['好吃', '份量足', '环境好', '服务好', '性价比高', '上菜快', '值得再来']

const ratingText = computed(() => {
  const texts = ['', '非常差', '较差', '一般', '满意', '非常满意']
  return texts[rating.value] || ''
})

// 切换标签
function toggleTag(tag) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx > -1) {
    selectedTags.value.splice(idx, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

// 触发文件选择
function triggerUpload() {
  fileInput.value?.click()
}

// 处理文件选择
async function handleFileChange(e) {
  const files = e.target.files
  if (!files || files.length === 0) return

  // 限制数量
  const remaining = 9 - imageUrls.value.length
  const filesToUpload = Array.from(files).slice(0, remaining)

  for (const file of filesToUpload) {
    // 验证文件大小
    if (file.size > 5 * 1024 * 1024) {
      showToast('图片大小不能超过5MB')
      continue
    }

    // 上传文件
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`
        },
        body: formData
      })

      const data = await res.json()
      if (data.code === 200 && data.data?.url) {
        imageUrls.value.push(data.data.url)
      } else {
        showToast('图片上传失败')
      }
    } catch (error) {
      showToast('图片上传失败')
    }
  }

  // 清空input
  e.target.value = ''
}

// 删除图片
function removeImage(idx) {
  imageUrls.value.splice(idx, 1)
}

// 提交评价
async function submitReview() {
  if (!rating.value) {
    showToast('请选择评分')
    return
  }

  submitting.value = true
  try {
    const res = await submitReview({
      orderNo: order.value.orderNo,
      openid: getOpenid(),
      rating: rating.value,
      content: content.value,
      tags: selectedTags.value,
      imageUrls: imageUrls.value,
      isAnonymous: isAnonymous.value
    })

    if (res.code === 200) {
      showToast({ message: '评价成功', type: 'success' })
      router.back()
    } else {
      showToast(res.message || '评价失败')
    }
  } catch (error) {
    showToast(error.message || '评价失败')
  } finally {
    submitting.value = false
  }
}

// 加载订单信息
onMounted(async () => {
  const orderNo = route.params.orderNo
  if (!orderNo) {
    showToast('订单号不存在')
    router.back()
    return
  }

  try {
    const res = await getOrderDetail(orderNo)
    order.value = res.data

    // 检查订单状态
    if (order.value?.status !== 4) {
      showToast('订单未完成，无法评价')
      router.back()
    }
  } catch (error) {
    showToast('加载订单失败')
    router.back()
  }
})
</script>

<style scoped>
.review-page {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
}

.review-header {
  background: linear-gradient(135deg, #ff6347 0%, #ff8a65 100%);
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top, 0));
  color: #fff;
}

.header-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
}

.header-title {
  font-size: 17px;
  font-weight: 600;
}

.header-placeholder {
  width: 38px;
}

.review-content {
  flex: 1;
  padding: 16px;
  padding-bottom: 100px;
  overflow-y: auto;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--surface);
  border-radius: var(--radius);
  margin-bottom: 12px;
  border: 1px solid var(--border);
}

.order-no {
  font-size: 14px;
  color: var(--text2);
}

.order-amount {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary);
}

.section-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid var(--border);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
}

.rating-stars {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 8px;
}

.star-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.star-item:active {
  transform: scale(1.2);
}

.star-item svg {
  width: 36px;
  height: 36px;
}

.rating-text {
  text-align: center;
  font-size: 14px;
  color: var(--text2);
  min-height: 20px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--border);
  font-size: 13px;
  color: var(--text2);
  cursor: pointer;
  transition: all 0.2s;
}

.tag-item.active {
  background: #fff7ed;
  border-color: #f59e0b;
  color: #f59e0b;
}

.review-textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px;
  font-size: 14px;
  resize: none;
  outline: none;
  font-family: inherit;
  line-height: 1.6;
  background: var(--bg);
}

.review-textarea:focus {
  border-color: var(--primary);
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: var(--text3);
  margin-top: 4px;
}

.image-upload {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-preview {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
}

.image-add {
  width: 80px;
  height: 80px;
  border: 1px dashed var(--border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  color: var(--text3);
  font-size: 12px;
}

.anonymous-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.anonymous-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text);
}

.anonymous-desc {
  font-size: 12px;
  color: var(--text3);
  margin-top: 2px;
}

.review-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: var(--surface);
  border-top: 1px solid var(--border);
}

.submit-btn {
  height: 46px;
  font-size: 16px;
  font-weight: 600;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}
</style>
