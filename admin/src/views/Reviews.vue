<template>
  <div>
    <div class="page-header">
      <h2>评价管理</h2>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalReviews || 0 }}</div>
        <div class="stat-label">总评价数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.averageRating || '0.0' }}</div>
        <div class="stat-label">平均评分</div>
      </div>
      <div class="stat-card" v-for="star in 5" :key="star">
        <div class="stat-value">{{ stats.ratingDistribution?.[star] || 0 }}</div>
        <div class="stat-label">{{ star }}星</div>
      </div>
    </div>

    <!-- 筛选 -->
    <div class="filter-bar">
      <el-select v-model="filterRating" placeholder="评分筛选" clearable @change="loadReviews">
        <el-option label="全部" value="" />
        <el-option v-for="star in 5" :key="star" :label="star + '星'" :value="star" />
      </el-select>
    </div>

    <!-- 评价列表 -->
    <el-table :data="reviews" stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="orderNo" label="订单号" width="150" />
      <el-table-column prop="userName" label="用户" width="120" />
      <el-table-column label="评分" width="120">
        <template #default="{ row }">
          <div class="rating-stars">
            <span v-for="star in 5" :key="star" :class="['star', { active: star <= row.rating }]">★</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="评价内容" min-width="200" show-overflow-tooltip />
      <el-table-column label="标签" width="200">
        <template #default="{ row }">
          <el-tag v-for="tag in row.tags" :key="tag" size="small" class="tag-item">{{ tag }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="图片" width="100">
        <template #default="{ row }">
          <span v-if="row.images?.length">{{ row.images.length }}张</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '正常' : '隐藏' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="商家回复" min-width="150" show-overflow-tooltip>
        <template #default="{ row }">
          <span v-if="row.replyContent">{{ row.replyContent }}</span>
          <span v-else class="no-reply">未回复</span>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="评价时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button text size="small" type="primary" @click="openDetail(row)">详情</el-button>
          <el-button text size="small" type="success" @click="openReply(row)" v-if="!row.replyContent">
            回复
          </el-button>
          <el-button text size="small" :type="row.status === 1 ? 'warning' : 'success'" @click="toggleStatus(row)">
            {{ row.status === 1 ? '隐藏' : '显示' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @change="loadReviews"
      />
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="评价详情" width="600">
      <div v-if="currentReview" class="review-detail">
        <div class="detail-row">
          <span class="detail-label">订单号：</span>
          <span>{{ currentReview.orderNo }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">用户：</span>
          <span>{{ currentReview.userName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">评分：</span>
          <div class="rating-stars">
            <span v-for="star in 5" :key="star" :class="['star', { active: star <= currentReview.rating }]">★</span>
          </div>
        </div>
        <div class="detail-row">
          <span class="detail-label">标签：</span>
          <div>
            <el-tag v-for="tag in currentReview.tags" :key="tag" size="small" class="tag-item">{{ tag }}</el-tag>
            <span v-if="!currentReview.tags?.length">无</span>
          </div>
        </div>
        <div class="detail-row">
          <span class="detail-label">评价内容：</span>
          <div>{{ currentReview.content || '无' }}</div>
        </div>
        <div class="detail-row" v-if="currentReview.images?.length">
          <span class="detail-label">图片：</span>
          <div class="image-list">
            <img v-for="(img, idx) in currentReview.images" :key="idx" :src="img.imageUrl" class="preview-image" />
          </div>
        </div>
        <div class="detail-row">
          <span class="detail-label">评价时间：</span>
          <span>{{ currentReview.createdAt }}</span>
        </div>
        <div class="detail-row" v-if="currentReview.replyContent">
          <span class="detail-label">商家回复：</span>
          <div>{{ currentReview.replyContent }}</div>
        </div>
        <div class="detail-row" v-if="currentReview.replyTime">
          <span class="detail-label">回复时间：</span>
          <span>{{ currentReview.replyTime }}</span>
        </div>
      </div>
    </el-dialog>

    <!-- 回复弹窗 -->
    <el-dialog v-model="replyVisible" title="回复评价" width="500">
      <div v-if="currentReview" class="reply-form">
        <div class="reply-review-info">
          <div class="rating-stars">
            <span v-for="star in 5" :key="star" :class="['star', { active: star <= currentReview.rating }]">★</span>
          </div>
          <div class="reply-content">{{ currentReview.content || '用户未填写评价内容' }}</div>
        </div>
        <el-input
          v-model="replyContent"
          type="textarea"
          :rows="4"
          placeholder="请输入回复内容..."
        />
      </div>
      <template #footer>
        <el-button @click="replyVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply" :loading="replying">提交回复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getReviews, getReviewStats, replyReview, updateReviewStatus } from '../api'

const reviews = ref([])
const loading = ref(false)
const stats = ref({})
const filterRating = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const detailVisible = ref(false)
const replyVisible = ref(false)
const currentReview = ref(null)
const replyContent = ref('')
const replying = ref(false)

// 加载评价列表
const loadReviews = async () => {
  loading.value = true
  try {
    const res = await getReviews({
      rating: filterRating.value || undefined,
      page: currentPage.value,
      size: pageSize.value
    })
    reviews.value = res.records || []
    total.value = res.total || 0
  } catch (error) {
    console.error('加载评价失败:', error)
  }
  loading.value = false
}

// 加载统计数据
const loadStats = async () => {
  try {
    stats.value = await getReviewStats()
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// 打开详情
const openDetail = (review) => {
  currentReview.value = review
  detailVisible.value = true
}

// 打开回复
const openReply = (review) => {
  currentReview.value = review
  replyContent.value = ''
  replyVisible.value = true
}

// 提交回复
const submitReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  replying.value = true
  try {
    await replyReview(currentReview.value.id, replyContent.value)
    ElMessage.success('回复成功')
    replyVisible.value = false
    loadReviews()
  } catch (error) {
    ElMessage.error(error.message || '回复失败')
  }
  replying.value = false
}

// 切换状态
const toggleStatus = async (review) => {
  const newStatus = review.status === 1 ? 0 : 1
  const action = newStatus === 0 ? '隐藏' : '显示'

  try {
    await ElMessageBox.confirm(`确定要${action}这条评价吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await updateReviewStatus(review.id, newStatus)
    ElMessage.success(`${action}成功`)
    loadReviews()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || `${action}失败`)
    }
  }
}

onMounted(() => {
  loadReviews()
  loadStats()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 24px;
  text-align: center;
  min-width: 100px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
}

.stat-label {
  font-size: 12px;
  color: var(--text2);
  margin-top: 4px;
}

.filter-bar {
  margin-bottom: 16px;
}

.rating-stars .star {
  color: #d1d5db;
  font-size: 16px;
}

.rating-stars .star.active {
  color: #f59e0b;
}

.tag-item {
  margin-right: 4px;
  margin-bottom: 4px;
}

.no-reply {
  color: var(--text3);
  font-size: 12px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.review-detail {
  padding: 16px 0;
}

.detail-row {
  display: flex;
  margin-bottom: 12px;
  line-height: 1.6;
}

.detail-label {
  width: 80px;
  color: var(--text2);
  flex-shrink: 0;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

.reply-form {
  padding: 16px 0;
}

.reply-review-info {
  background: var(--bg);
  padding: 12px;
  border-radius: var(--radius-sm);
  margin-bottom: 16px;
}

.reply-content {
  margin-top: 8px;
  font-size: 14px;
  color: var(--text2);
}
</style>
