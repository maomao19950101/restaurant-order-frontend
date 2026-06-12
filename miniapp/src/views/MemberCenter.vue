<template>
  <div class="member-page">
    <!-- Header -->
    <div class="member-header">
      <div class="header-nav">
        <div class="back-btn" @click="$router.back()">
          <van-icon name="arrow-left" size="20" />
        </div>
        <div class="header-title">会员中心</div>
        <div class="header-placeholder"></div>
      </div>

      <!-- 会员信息卡 -->
      <div class="member-card" v-if="member">
        <div class="member-avatar">
          <img v-if="member.avatar" :src="member.avatar" alt="avatar" />
          <div v-else class="avatar-placeholder">{{ member.nickname?.[0] || 'U' }}</div>
        </div>
        <div class="member-info">
          <div class="member-name">{{ member.nickname || '未设置昵称' }}</div>
          <div class="member-level">
            <van-tag type="warning" size="medium">{{ member.levelName || '普通会员' }}</van-tag>
          </div>
          <div class="member-phone" v-if="member.phone">{{ member.phone }}</div>
        </div>
        <div class="member-points">
          <div class="points-value">{{ member.points || 0 }}</div>
          <div class="points-label">可用积分</div>
        </div>
      </div>
    </div>

    <!-- 等级进度 -->
    <div class="section-card" v-if="member && nextLevel">
      <div class="level-progress">
        <div class="level-info">
          <span class="current-level">{{ member.levelName || '普通会员' }}</span>
          <span class="next-level">{{ nextLevel.name }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="progress-text">
          还需 {{ pointsNeeded }} 积分升级
        </div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="section-card">
      <div class="menu-list">
        <div class="menu-item" @click="goCoupons">
          <div class="menu-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/>
            </svg>
          </div>
          <div class="menu-text">我的优惠券</div>
          <div class="menu-badge" v-if="couponCount > 0">{{ couponCount }}</div>
          <van-icon name="arrow" size="16" color="#999" />
        </div>
        <div class="menu-item" @click="goPoints">
          <div class="menu-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div class="menu-text">积分明细</div>
          <van-icon name="arrow" size="16" color="#999" />
        </div>
        <div class="menu-item" @click="goOrders">
          <div class="menu-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div class="menu-text">我的订单</div>
          <van-icon name="arrow" size="16" color="#999" />
        </div>
      </div>
    </div>

    <!-- 会员等级说明 -->
    <div class="section-card">
      <div class="section-title">会员等级权益</div>
      <div class="level-list">
        <div
          v-for="level in levels"
          :key="level.id"
          class="level-item"
          :class="{ active: member?.levelId === level.id }"
        >
          <div class="level-name">{{ level.name }}</div>
          <div class="level-discount">{{ (level.discount * 10).toFixed(1) }}折</div>
          <div class="level-points">{{ level.minPoints }}积分起</div>
          <div class="level-benefits">{{ level.benefits }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMemberInfo, getMemberLevels, getAvailableCouponCount } from '../api'
import { getOpenid } from '../utils/auth'

const router = useRouter()
const member = ref(null)
const levels = ref([])
const couponCount = ref(0)

// 计算下一等级
const nextLevel = computed(() => {
  if (!member.value || !levels.value.length) return null
  const currentIdx = levels.value.findIndex(l => l.id === member.value.levelId)
  if (currentIdx < levels.value.length - 1) {
    return levels.value[currentIdx + 1]
  }
  return null
})

// 计算升级所需积分
const pointsNeeded = computed(() => {
  if (!nextLevel.value || !member.value) return 0
  return Math.max(0, nextLevel.value.minPoints - member.value.totalPoints)
})

// 计算进度百分比
const progressPercent = computed(() => {
  if (!nextLevel.value || !member.value) return 100
  const currentLevel = levels.value.find(l => l.id === member.value.levelId)
  if (!currentLevel) return 0
  const total = nextLevel.value.minPoints - currentLevel.minPoints
  const current = member.value.totalPoints - currentLevel.minPoints
  return Math.min(100, Math.max(0, (current / total) * 100))
})

// 加载会员信息
const loadMember = async () => {
  try {
    const restaurantId = 1 // 从路由或配置获取
    const openid = getOpenid()
    const res = await getMemberInfo(restaurantId, openid)
    member.value = res.data
  } catch (error) {
    console.error('加载会员信息失败:', error)
  }
}

// 加载等级列表
const loadLevels = async () => {
  try {
    const restaurantId = 1
    const res = await getMemberLevels(restaurantId)
    levels.value = res.data || []
  } catch (error) {
    console.error('加载等级列表失败:', error)
  }
}

// 加载优惠券数量
const loadCouponCount = async () => {
  if (!member.value) return
  try {
    const res = await getAvailableCouponCount(member.value.id)
    couponCount.value = res.data?.count || 0
  } catch (error) {
    console.error('加载优惠券数量失败:', error)
  }
}

const goCoupons = () => router.push('/coupons')
const goPoints = () => router.push('/points')
const goOrders = () => router.push('/orders')

onMounted(async () => {
  await loadMember()
  await loadLevels()
  await loadCouponCount()
})
</script>

<style scoped>
.member-page {
  min-height: 100vh;
  background: var(--bg);
}

.member-header {
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

.member-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.member-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  font-size: 24px;
  font-weight: 600;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.member-level {
  margin-bottom: 4px;
}

.member-phone {
  font-size: 13px;
  opacity: 0.8;
}

.member-points {
  text-align: center;
}

.points-value {
  font-size: 28px;
  font-weight: 700;
}

.points-label {
  font-size: 12px;
  opacity: 0.8;
}

.section-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 16px;
  margin: 12px 16px;
  border: 1px solid var(--border);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
}

.level-progress {
  padding: 4px 0;
}

.level-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text2);
  margin-bottom: 8px;
}

.progress-bar {
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #f97316);
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-text {
  text-align: center;
  font-size: 12px;
  color: var(--text3);
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  color: var(--text2);
}

.menu-text {
  flex: 1;
  font-size: 15px;
  color: var(--text);
}

.menu-badge {
  background: #ef4444;
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.level-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.level-item.active {
  border-color: #f59e0b;
  background: #fffbeb;
}

.level-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  width: 70px;
}

.level-discount {
  font-size: 14px;
  font-weight: 600;
  color: #f59e0b;
  width: 50px;
}

.level-points {
  font-size: 12px;
  color: var(--text3);
  width: 80px;
}

.level-benefits {
  flex: 1;
  font-size: 12px;
  color: var(--text2);
}
</style>
