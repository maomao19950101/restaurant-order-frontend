<template>
  <div class="menu-page">
    <!-- Restaurant Header -->
    <div class="menu-header">
      <div class="header-content">
        <div class="header-left">
          <div class="restaurant-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 11h18l-1.5 7a2 2 0 0 1-2 1.5H6.5a2 2 0 0 1-2-1.5L3 11z"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              <line x1="8" y1="3" x2="8" y2="5"/>
              <line x1="12" y1="2" x2="12" y2="5"/>
              <line x1="16" y1="3" x2="16" y2="5"/>
            </svg>
          </div>
          <div class="header-info">
            <div class="restaurant-name">{{ restaurantName }}</div>
            <div class="table-badge" v-if="cart.tableId">
              <van-icon name="location-o" size="12" />
              <span>{{ cart.tableId }}号桌</span>
            </div>
          </div>
        </div>
        <div class="header-right" @click="$router.push('/orders')">
          <van-icon name="orders-o" size="20" color="#666" />
        </div>
      </div>
    </div>

    <!-- Search bar -->
    <div class="search-bar">
      <div class="search-input">
        <van-icon name="search" size="16" color="#999" />
        <input v-model="searchText" placeholder="搜索菜品..." />
      </div>
    </div>

    <!-- Content: left categories + right dishes -->
    <div class="menu-body">
      <!-- Category sidebar -->
      <div class="category-sidebar" ref="categoryRef">
        <div
          v-for="(cat, index) in categories"
          :key="cat.id"
          class="category-item"
          :class="{ active: activeCategory === index }"
          @click="scrollToCategory(index)"
        >
          <span class="category-icon">{{ cat.icon || '' }}</span>
          <span class="category-name">{{ cat.name }}</span>
          <span class="category-count">{{ cat.dishes?.length || 0 }}</span>
        </div>
      </div>

      <!-- Dishes list -->
      <div class="dish-list" ref="dishListRef">
        <div
          v-for="(cat, catIndex) in filteredCategories"
          :key="cat.id"
          :id="'cat-' + cat.id"
          class="dish-group"
        >
          <div class="dish-group-title">
            <span class="group-icon">{{ cat.icon || '' }}</span>
            {{ cat.name }}
          </div>
          <div
            v-for="dish in cat.dishes"
            :key="dish.id"
            class="dish-card"
          >
            <div class="dish-image">
              <img v-if="dish.image" :src="dish.image" :alt="dish.name" />
              <div v-else class="dish-placeholder">{{ dish.name[0] }}</div>
              <div class="dish-tag" v-if="dish.tag">{{ dish.tag }}</div>
            </div>
            <div class="dish-info">
              <div class="dish-name">{{ dish.name }}</div>
              <div class="dish-desc" v-if="dish.description">{{ dish.description }}</div>
              <div class="dish-meta">
                <span class="dish-sales" v-if="dish.sales">
                  <van-icon name="fire-o" size="12" /> 月售{{ dish.sales }}
                </span>
                <span class="dish-likes" v-if="dish.likes">
                  <van-icon name="good-job-o" size="12" /> {{ dish.likes }}%
                </span>
              </div>
              <div class="dish-bottom">
                <div class="dish-price">
                  <span class="price">{{ dish.price }}</span>
                </div>
                <div class="dish-actions">
                  <template v-if="getDishQuantity(dish) > 0">
                    <div class="action-btn minus" @click="decrease(dish)">
                      <van-icon name="minus" size="12" />
                    </div>
                    <span class="quantity">{{ getDishQuantity(dish) }}</span>
                  </template>
                  <div class="action-btn plus" @click="openSpec(dish)">
                    <van-icon name="plus" size="14" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="filteredCategories.length === 0" class="empty-dishes">
          <div class="empty-illustration">
            <!-- Search no result -->
            <svg v-if="searchText.trim()" width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="52" r="40" fill="#FFF3EE" stroke="#FFD4C0" stroke-width="1.5"/>
              <circle cx="52" cy="48" r="20" stroke="#FFAB91" stroke-width="2.5" fill="none"/>
              <line x1="66" y1="62" x2="80" y2="76" stroke="#FFAB91" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M44 44 L60 44" stroke="#FFD4C0" stroke-width="2" stroke-linecap="round"/>
              <path d="M48 50 L56 50" stroke="#FFD4C0" stroke-width="2" stroke-linecap="round"/>
              <circle cx="90" cy="30" r="3" fill="#FFE0CC"/>
              <circle cx="25" cy="70" r="2" fill="#FFE0CC"/>
              <circle cx="95" cy="65" r="2" fill="#FFE0CC"/>
            </svg>
            <!-- No menu data -->
            <svg v-else width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="52" r="40" fill="#FFF3EE" stroke="#FFD4C0" stroke-width="1.5"/>
              <ellipse cx="60" cy="50" rx="24" ry="8" stroke="#FFAB91" stroke-width="2" fill="none"/>
              <path d="M36 50 C36 50 36 68 60 68 C84 68 84 50 84 50" stroke="#FFAB91" stroke-width="2" fill="none"/>
              <path d="M52 38 C52 38 54 28 60 28 C66 28 68 38 68 38" stroke="#FFAB91" stroke-width="2" fill="none" stroke-linecap="round"/>
              <line x1="48" y1="56" x2="72" y2="56" stroke="#FFD4C0" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="52" y1="61" x2="68" y2="61" stroke="#FFD4C0" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="28" cy="38" r="3" fill="#FFE0CC"/>
              <circle cx="92" cy="42" r="2.5" fill="#FFE0CC"/>
              <circle cx="88" cy="72" r="2" fill="#FFE0CC"/>
              <path d="M20 58 L26 58" stroke="#FFE0CC" stroke-width="2" stroke-linecap="round"/>
              <path d="M94 55 L100 55" stroke="#FFE0CC" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <p class="empty-title">{{ searchText.trim() ? '没有找到相关菜品' : '暂无菜品数据' }}</p>
          <p class="empty-hint">{{ searchText.trim() ? '试试换个关键词搜索吧' : '商家正在准备菜单，请稍后再来' }}</p>
          <div v-if="searchText.trim()" class="empty-action" @click="searchText = ''">
            <van-icon name="replay" size="14" />
            <span>清除搜索</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Spec popup -->
    <van-action-sheet
      v-model:show="showSpecPopup"
      :title="currentDish?.name"
      closeable
      round
    >
      <div class="spec-popup">
        <div class="spec-dish-info" v-if="currentDish">
          <div class="spec-image">
            <img v-if="currentDish.image" :src="currentDish.image" :alt="currentDish.name" />
            <div v-else class="dish-placeholder large">{{ currentDish.name[0] }}</div>
          </div>
          <div class="spec-detail">
            <div class="spec-name">{{ currentDish.name }}</div>
            <div class="spec-desc" v-if="currentDish.description">{{ currentDish.description }}</div>
            <div class="spec-price price">{{ currentDish.price }}</div>
          </div>
        </div>
        <!-- Specs -->
        <div v-if="currentDish?.specs?.length" class="spec-section">
          <div v-for="specGroup in currentDish.specs" :key="specGroup.id" class="spec-group">
            <div class="spec-group-name">{{ specGroup.name }}</div>
            <div class="spec-options">
              <div
                v-for="opt in specGroup.options"
                :key="opt.id"
                class="spec-option"
                :class="{ active: selectedSpecs[specGroup.id] === opt.id }"
                @click="selectSpec(specGroup.id, opt.id)"
              >
                {{ opt.name }}
                <span v-if="opt.price" class="spec-price-extra">+¥{{ opt.price }}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Remark -->
        <div class="spec-remark">
          <input v-model="specRemark" placeholder="口味偏好等备注" />
        </div>
        <!-- Quantity & Add -->
        <div class="spec-footer">
          <div class="spec-qty">
            <div class="qty-btn" @click="specQty = Math.max(1, specQty - 1)">
              <van-icon name="minus" size="14" />
            </div>
            <span class="qty-num">{{ specQty }}</span>
            <div class="qty-btn" @click="specQty++">
              <van-icon name="plus" size="14" />
            </div>
          </div>
          <van-button type="primary" round class="add-btn" @click="confirmAdd">
            加入购物车 ¥{{ calcSpecPrice }}
          </van-button>
        </div>
      </div>
    </van-action-sheet>

    <!-- Cart bar -->
    <Cart />

    <!-- Bottom tabbar -->
    <van-tabbar v-model="activeTab" route class="menu-tabbar">
      <van-tabbar-item icon="orders-o" to="/menu">
        <span>点餐</span>
      </van-tabbar-item>
      <van-tabbar-item icon="cart-o" to="/orders">
        <span>订单</span>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { getMenu } from '../api'
import { useCartStore } from '../stores/cart'
import Cart from '../components/Cart.vue'

const cart = useCartStore()
const categories = ref([])
const activeCategory = ref(0)
const restaurantName = ref('扫码点餐')
const searchText = ref('')

const showSpecPopup = ref(false)
const currentDish = ref(null)
const specQty = ref(1)
const specRemark = ref('')
const selectedSpecs = ref({})

const activeTab = ref(0)
const categoryRef = ref(null)
const dishListRef = ref(null)

// Filtered categories based on search
const filteredCategories = computed(() => {
  if (!searchText.value.trim()) return categories.value
  const q = searchText.value.trim().toLowerCase()
  return categories.value
    .map((cat) => ({
      ...cat,
      dishes: (cat.dishes || []).filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.description && d.description.toLowerCase().includes(q))
      ),
    }))
    .filter((cat) => cat.dishes.length > 0)
})

// Calculate price including specs
const calcSpecPrice = computed(() => {
  if (!currentDish.value) return 0
  let extra = 0
  if (currentDish.value.specs) {
    for (const sg of currentDish.value.specs) {
      const selectedId = selectedSpecs.value[sg.id]
      if (selectedId) {
        const opt = sg.options.find((o) => o.id === selectedId)
        if (opt?.price) extra += opt.price
      }
    }
  }
  return ((currentDish.value.price + extra) * specQty.value).toFixed(2)
})

function getDishQuantity(dish) {
  let total = 0
  for (const item of cart.items) {
    if (item.dishId === dish.id) total += item.quantity
  }
  return total
}

function decrease(dish) {
  for (let i = cart.items.length - 1; i >= 0; i--) {
    if (cart.items[i].dishId === dish.id) {
      if (cart.items[i].quantity > 1) {
        cart.items[i].quantity--
      } else {
        cart.items.splice(i, 1)
      }
      break
    }
  }
}

function openSpec(dish) {
  currentDish.value = dish
  specQty.value = 1
  specRemark.value = ''
  selectedSpecs.value = {}
  showSpecPopup.value = true
}

function selectSpec(groupId, optId) {
  selectedSpecs.value = { ...selectedSpecs.value, [groupId]: optId }
}

function confirmAdd() {
  const specIds = []
  const specLabels = []
  if (currentDish.value.specs) {
    for (const sg of currentDish.value.specs) {
      const selectedId = selectedSpecs.value[sg.id]
      if (selectedId) {
        specIds.push(selectedId)
        const opt = sg.options.find((o) => o.id === selectedId)
        if (opt) specLabels.push(`${sg.name}:${opt.name}`)
      }
    }
  }
  let extra = 0
  if (currentDish.value.specs) {
    for (const sg of currentDish.value.specs) {
      const selectedId = selectedSpecs.value[sg.id]
      if (selectedId) {
        const opt = sg.options.find((o) => o.id === selectedId)
        if (opt?.price) extra += opt.price
      }
    }
  }
  cart.addItem(
    { ...currentDish.value, price: currentDish.value.price + extra },
    specQty.value,
    specIds,
    specLabels,
    specRemark.value
  )
  showSpecPopup.value = false
}

function scrollToCategory(index) {
  activeCategory.value = index
  const cat = categories.value[index]
  if (!cat) return
  const el = document.getElementById('cat-' + cat.id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

let observer = null
function setupScrollSpy() {
  nextTick(() => {
    const dishList = dishListRef.value
    if (!dishList) return
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = Number(entry.target.id.replace('cat-', ''))
            const idx = categories.value.findIndex((c) => c.id === id)
            if (idx !== -1) activeCategory.value = idx
          }
        }
      },
      { root: dishList, threshold: 0.1, rootMargin: '-40px 0px -60% 0px' }
    )
    dishList.querySelectorAll('.dish-group').forEach((el) => observer.observe(el))
  })
}

onMounted(async () => {
  try {
    const res = await getMenu(cart.restaurantId)
    categories.value = res.data || []
    if (categories.value.length) {
      restaurantName.value = categories.value[0]?.restaurantName || '扫码点餐'
    }
    setupScrollSpy()
  } catch (e) {
    console.error('Failed to load menu:', e)
  }
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.menu-page {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
}

/* Header */
.menu-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(135deg, #ff6347 0%, #ff8a65 100%);
  padding: 14px 16px;
  color: #fff;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.restaurant-icon {
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.restaurant-name {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.table-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.18);
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  width: fit-content;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.header-right {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
  backdrop-filter: blur(4px);
}

.header-right:active {
  background: rgba(255, 255, 255, 0.3);
}

/* Search bar */
.search-bar {
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid var(--border);
}

.search-input {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg);
  border-radius: 22px;
  padding: 9px 14px;
  border: 1px solid var(--border);
  transition: border-color 0.2s ease;
}

.search-input:focus-within {
  border-color: var(--primary);
  background: #fff;
}

.search-input input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 14px;
  color: var(--text);
}

.search-input input::placeholder {
  color: var(--text3);
}

/* Menu body */
.menu-body {
  display: flex;
  flex: 1;
  height: calc(100vh - 164px);
  overflow: hidden;
}

/* Category sidebar */
.category-sidebar {
  width: 88px;
  flex-shrink: 0;
  background: #fafbfc;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  border-right: 1px solid var(--border);
}

.category-sidebar::-webkit-scrollbar {
  display: none;
}

.category-item {
  padding: 14px 8px 14px 10px;
  font-size: 13px;
  color: var(--text2);
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  position: relative;
}

.category-item:active {
  background: rgba(255, 107, 53, 0.04);
}

.category-item.active {
  background: #fff;
  color: var(--primary);
  border-left-color: var(--primary);
  font-weight: 600;
}

.category-item.active::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 22px;
  background: var(--primary);
  border-radius: 2px 0 0 2px;
}

.category-icon {
  font-size: 18px;
  line-height: 1;
}

.category-name {
  font-size: 12px;
  line-height: 1.3;
}

.category-count {
  font-size: 10px;
  color: var(--text3);
  background: #f0f1f3;
  padding: 1px 7px;
  border-radius: 10px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.category-item.active .category-count {
  background: var(--primary-light);
  color: var(--primary);
}

/* Dish list */
.dish-list {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 12px 120px;
}

.dish-list::-webkit-scrollbar {
  display: none;
}

.dish-group-title {
  padding: 16px 4px 10px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 6px;
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 1;
  letter-spacing: -0.01em;
}

.group-icon {
  font-size: 18px;
}

/* Dish card */
.dish-card {
  display: flex;
  background: var(--surface);
  border-radius: var(--radius);
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  animation: fadeIn 0.3s ease;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dish-card:active {
  transform: scale(0.98);
}

.dish-image {
  width: 92px;
  height: 92px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}

.dish-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dish-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #ffe0cc 0%, #ffb899 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.dish-placeholder.large {
  font-size: 36px;
}

.dish-tag {
  position: absolute;
  top: 4px;
  left: 4px;
  background: var(--red);
  color: #fff;
  font-size: 10px;
  padding: 2px 7px;
  border-radius: var(--radius-xs);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.dish-info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dish-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.dish-desc {
  font-size: 12px;
  color: var(--text3);
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  line-height: 1.4;
}

.dish-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--text3);
  margin-top: 5px;
}

.dish-meta .van-icon {
  margin-right: 2px;
}

.dish-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 6px;
}

.dish-price .price {
  font-size: 17px;
  font-weight: 700;
}

.dish-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:active {
  transform: scale(0.88);
}

.action-btn.minus {
  background: var(--bg);
  color: var(--text2);
  border: 1px solid var(--border-strong);
}

.action-btn.plus {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.28);
}

.quantity {
  font-size: 15px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
  color: var(--text);
  animation: bounceIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-variant-numeric: tabular-nums;
}

.empty-dishes {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px 40px;
}

.empty-illustration {
  margin-bottom: 20px;
  animation: emptyFloat 3s ease-in-out infinite;
}

@keyframes emptyFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 6px;
  text-align: center;
}

.empty-hint {
  font-size: 13px;
  color: var(--text3);
  text-align: center;
  line-height: 1.5;
}

.empty-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 18px;
  padding: 8px 20px;
  background: #fff;
  border: 1.5px solid var(--border-strong);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text2);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.empty-action:active {
  transform: scale(0.95);
  background: var(--bg);
}

/* Spec popup */
.spec-popup {
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0));
}

.spec-dish-info {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.spec-image {
  width: 85px;
  height: 85px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
}

.spec-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.spec-detail {
  margin-left: 14px;
  flex: 1;
}

.spec-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
}

.spec-desc {
  font-size: 13px;
  color: var(--text3);
  margin-top: 4px;
  line-height: 1.5;
}

.spec-price {
  font-size: 20px;
  margin-top: 10px;
}

.spec-section {
  margin-bottom: 18px;
}

.spec-group-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text);
}

.spec-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.spec-option {
  padding: 8px 16px;
  border-radius: 22px;
  background: var(--bg);
  font-size: 13px;
  cursor: pointer;
  border: 1.5px solid var(--border);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--text2);
  font-weight: 500;
}

.spec-option:active {
  transform: scale(0.95);
}

.spec-option.active {
  background: var(--primary-light);
  color: var(--primary);
  border-color: var(--primary);
  font-weight: 600;
}

.spec-price-extra {
  font-size: 11px;
  color: var(--primary);
  margin-left: 3px;
  font-weight: 600;
}

.spec-remark {
  margin-bottom: 16px;
}

.spec-remark input {
  width: 100%;
  border: 1.5px solid var(--border-strong);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease, background 0.2s ease;
  background: var(--bg);
}

.spec-remark input:focus {
  border-color: var(--primary);
  background: #fff;
}

.spec-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.spec-qty {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qty-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  color: var(--text2);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border);
}

.qty-btn:active {
  transform: scale(0.88);
}

.qty-num {
  font-size: 16px;
  font-weight: 700;
  min-width: 24px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.add-btn {
  background: var(--primary) !important;
  border: none !important;
  padding: 0 28px;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(255, 107, 53, 0.3);
  border-radius: 22px !important;
}

/* Tabbar */
.menu-tabbar {
  border-top: 1px solid var(--border);
  box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.02);
}

</style>
