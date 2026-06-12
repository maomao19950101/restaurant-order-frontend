<template>
  <div class="points-page">
    <!-- Header -->
    <div class="points-header">
      <div class="header-nav">
        <div class="back-btn" @click="$router.back()">
          <van-icon name="arrow-left" size="20" />
        </div>
        <div class="header-title">积分明细</div>
        <div class="header-placeholder"></div>
      </div>

      <!-- 积分总览 -->
      <div class="points-summary">
        <div class="summary-item">
          <div class="summary-value">{{ member?.points || 0 }}</div>
          <div class="summary-label">可用积分</div>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <div class="summary-value">{{ member?.totalPoints || 0 }}</div>
          <div class="summary-label">累计积分</div>
        </div>
      </div>
    </div>

    <!-- 积分记录 -->
    <div class="points-content">
      <div v-if="loading" class="loading-wrap">
        <van-loading type="spinner" color="#f59e0b" vertical>加载中...</van-loading>
      </div>

      <div v-else-if="records.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
        <p>暂无积分记录</p>
      </div>

      <div v-else class="record-list">
        <div v-for="record in records" :key="record.id" class="record-item">
          <div class="record-info">
            <div class="record-desc">{{ record.description }}</div>
            <div class="record-time">{{ formatTime(record.createdAt) }}</div>
          </div>
          <div :class="['record-points', record.points > 0 ? 'add' : 'deduct']">
            {{ record.points > 0 ? '+' : '' }}{{ record.points }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMemberInfo, getPointsRecords } from '../api'
import { getOpenid } from '../utils/auth'

const loading = ref(false)
const member = ref(null)
const records = ref([])

const formatTime = (time) => {
  if (!time) return ''
  const d = new Date(time)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const loadMember = async () => {
  try {
    const restaurantId = 1
    const openid = getOpenid()
    const res = await getMemberInfo(restaurantId, openid)
    member.value = res.data

    if (member.value) {
      loadRecords()
    }
  } catch (error) {
    console.error('加载会员信息失败:', error)
  }
}

const loadRecords = async () => {
  if (!member.value) return

  loading.value = true
  try {
    const res = await getPointsRecords({
      memberId: member.value.id,
      page: 1,
      size: 50
    })
    records.value = res.data || []
  } catch (error) {
    console.error('加载积分记录失败:', error)
  }
  loading.value = false
}

onMounted(loadMember)
</script>

<style scoped>
.points-page {
  min-height: 100vh;
  background: var(--bg);
}

.points-header {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  padding: 12px 16px 24px;
  padding-top: calc(12px + env(safe-area-inset-top, 0));
  color: #fff;
}

.header-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.back-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.header-title {
  font-size: 17px;
  font-weight: 600;
}

.header-placeholder {
  width: 38px;
}

.points-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.summary-item {
  text-align: center;
}

.summary-value {
  font-size: 32px;
  font-weight: 700;
}

.summary-label {
  font-size: 13px;
  opacity: 0.8;
  margin-top: 4px;
}

.summary-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
}

.points-content {
  padding: 16px;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text3);
}

.empty-state p {
  margin-top: 12px;
  font-size: 14px;
}

.record-list {
  background: var(--surface);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.record-item:last-child {
  border-bottom: none;
}

.record-info {
  flex: 1;
}

.record-desc {
  font-size: 14px;
  color: var(--text);
  margin-bottom: 4px;
}

.record-time {
  font-size: 12px;
  color: var(--text3);
}

.record-points {
  font-size: 16px;
  font-weight: 600;
}

.record-points.add {
  color: #10b981;
}

.record-points.deduct {
  color: #ef4444;
}
</style>
