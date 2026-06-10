<template>
  <div class="menu-page">
    <!-- Restaurant Header -->
    <div class="menu-header">
      <div class="header-content">
        <div class="header-left">
          <div class="restaurant-icon">🍜</div>
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
          <span class="category-icon">{{ cat.icon || '📋' }}</span>
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
            <span class="group-icon">{{ cat.icon || '🍽️' }}</span>
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
          <van-empty description="没有找到相关菜品" image="search" />
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
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%);
  padding: 12px 16px;
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
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.restaurant-name {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.table-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  width: fit-content;
}

.header-right {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Search bar */
.search-bar {
  padding: 10px 16px;
  background: #fff;
}

.search-input {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg);
  border-radius: 20px;
  padding: 8px 14px;
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
  height: calc(100vh - 160px);
  overflow: hidden;
}

/* Category sidebar */
.category-sidebar {
  width: 85px;
  flex-shrink: 0;
  background: #fafafa;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.category-sidebar::-webkit-scrollbar {
  display: none;
}

.category-item {
  padding: 14px 8px 14px 12px;
  font-size: 13px;
  color: var(--text2);
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  position: relative;
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
  height: 20px;
  background: var(--primary);
  border-radius: 2px 0 0 2px;
}

.category-icon {
  font-size: 18px;
}

.category-name {
  font-size: 12px;
  line-height: 1.3;
}

.category-count {
  font-size: 10px;
  color: var(--text3);
  background: #f0f0f0;
  padding: 1px 6px;
  border-radius: 8px;
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

.dish-group-title {
  padding: 14px 4px 10px;
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
  box-shadow: var(--shadow-sm);
  animation: fadeIn 0.3s ease;
  transition: transform 0.15s ease;
}

.dish-card:active {
  transform: scale(0.98);
}

.dish-image {
  width: 90px;
  height: 90px;
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
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dish-placeholder.large {
  font-size: 38px;
}

.dish-tag {
  position: absolute;
  top: 4px;
  left: 4px;
  background: var(--red);
  color: #fff;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 500;
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
}

.dish-desc {
  font-size: 12px;
  color: var(--text3);
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.dish-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--text3);
  margin-top: 4px;
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
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;
}

.action-btn:active {
  transform: scale(0.9);
}

.action-btn.minus {
  background: #f0f0f0;
  color: var(--text2);
}

.action-btn.plus {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.quantity {
  font-size: 15px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
  color: var(--text);
  animation: bounceIn 0.2s ease;
}

.empty-dishes {
  padding: 40px 0;
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
}

.spec-desc {
  font-size: 13px;
  color: var(--text3);
  margin-top: 4px;
  line-height: 1.4;
}

.spec-price {
  font-size: 20px;
  margin-top: 8px;
}

.spec-section {
  margin-bottom: 16px;
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
  border-radius: 20px;
  background: var(--bg);
  font-size: 13px;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: all 0.2s ease;
  color: var(--text2);
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
  margin-left: 2px;
}

.spec-remark {
  margin-bottom: 16px;
}

.spec-remark input {
  width: 100%;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
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
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  color: var(--text2);
  cursor: pointer;
  transition: all 0.15s ease;
}

.qty-btn:active {
  transform: scale(0.9);
}

.qty-num {
  font-size: 16px;
  font-weight: 700;
  min-width: 24px;
  text-align: center;
}

.add-btn {
  background: var(--primary) !important;
  border: none !important;
  padding: 0 28px;
  height: 42px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

/* Tabbar */
.menu-tabbar {
  border-top: 1px solid var(--border);
}

/* Empty state */
.empty-dishes :deep(.van-empty) {
  padding-top: 60px;
}
</style>
