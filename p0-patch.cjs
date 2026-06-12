const fs = require('fs');
const path = require('path');
const base = 'D:/restaurantProject/restaurant-order-frontend/admin/src';

// ===== 1. Tables.vue - Add QR Code =====
{
  const p = base + '/views/Tables.vue';
  let c = fs.readFileSync(p, 'utf8');

  // Add QR import
  c = c.replace(
    "import { getTables, createTable, updateTable, deleteTable, resetTable } from '../api'",
    "import { getTables, createTable, updateTable, deleteTable, resetTable } from '../api'\nimport QRCode from 'qrcode'"
  );

  // Add state vars after form ref
  c = c.replace(
    "const form = ref({ tableNo: '', seats: 4 })",
    "const form = ref({ tableNo: '', seats: 4 })\nconst qrDialogVisible = ref(false)\nconst qrTableNo = ref('')\nconst qrDataUrl = ref('')\nconst qrUrl = ref('')"
  );

  // Add QR button in card actions - find by ASCII pattern
  c = c.replace(
    /(<el-button text size="small" type="danger" @click\.stop>\u5220\u9664<\/el-button>)/,
    `$1\n            <el-button text size="small" type="success" @click.stop="showQR(table)">\u4e8c\u7ef4\u7801</el-button>`
  );

  // Add QR dialog before closing </div></template>
  const qrDialog = `
    <!-- QR Code Dialog -->
    <el-dialog v-model="qrDialogVisible" :title="'\u684c\u53f0 ' + qrTableNo + ' \u4e8c\u7ef4\u7801'" width="360">
      <div style="text-align: center">
        <img v-if="qrDataUrl" :src="qrDataUrl" style="width: 260px; height: 260px" />
        <p style="margin-top: 12px; color: #909399; font-size: 12px; word-break: break-all">{{ qrUrl }}</p>
      </div>
      <template #footer>
        <el-button @click="downloadQR">\u4e0b\u8f7d</el-button>
        <el-button type="primary" @click="printQR">\u6253\u5370</el-button>
      </template>
    </el-dialog>`;
  c = c.replace(
    /(    <\/el-dialog>\n  <\/div>\n<\/template>)/,
    `    </el-dialog>\n${qrDialog}\n  </div>\n</template>`
  );

  // Add QR functions before onMounted
  const qrFuncs = `
const showQR = async (table) => {
  qrTableNo.value = table.tableNo
  const origin = window.location.origin
  qrUrl.value = origin + '/customer/menu?restaurantId=1&tableId=' + table.id
  try {
    qrDataUrl.value = await QRCode.toDataURL(qrUrl.value, { width: 260, margin: 2 })
    qrDialogVisible.value = true
  } catch (e) { ElMessage.error('\u751f\u6210\u4e8c\u7ef4\u7801\u5931\u8d25') }
}

const downloadQR = () => {
  const a = document.createElement('a')
  a.href = qrDataUrl.value
  a.download = 'table-' + qrTableNo.value + '-qr.png'
  a.click()
}

const printQR = () => {
  const w = window.open('', '_blank')
  w.document.write('<html><body style="text-align:center"><img src="' + qrDataUrl.value + '" style="width:300px" /><p>' + qrUrl.value + '</p></body></html>')
  w.document.close()
  w.print()
}

`;
  c = c.replace('onMounted(loadTables)', qrFuncs + 'onMounted(loadTables)');

  fs.writeFileSync(p, c, 'utf8');
  console.log('[OK] Tables.vue - QR code feature added');
}

// ===== 2. Router - Add new routes =====
{
  const p = base + '/router/index.js';
  let c = fs.readFileSync(p, 'utf8');

  // Add two new routes before the closing bracket of routes array
  const newRoutes = `  { path: '/settings', name: 'RestaurantSettings', component: () => import('../views/RestaurantSettings.vue'), meta: { title: '\u9910\u5385\u8bbe\u7f6e', icon: 'Setting' } },\n  { path: '/users', name: 'AdminUsers', component: () => import('../views/AdminUsers.vue'), meta: { title: '\u7ba1\u7406\u5458', icon: 'User' } },\n`;
  c = c.replace(
    /( { path: '\/tables'[^}]+},)\n(\])/,
    `$1\n${newRoutes}]`
  );

  fs.writeFileSync(p, c, 'utf8');
  console.log('[OK] router/index.js - new routes added');
}

// ===== 3. App.vue - Add Setting & User icons =====
{
  const p = base + '/App.vue';
  let c = fs.readFileSync(p, 'utf8');

  // Add Setting and User SVG icons to the icons object
  const newIcons = `  Setting: \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>\`,\n  User: \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>\`,\n`;
  // Insert after Bell icon
  c = c.replace(
    /(Bell: `<svg[^`]+<\/svg>`,)\n/,
    `$1\n${newIcons}`
  );

  fs.writeFileSync(p, c, 'utf8');
  console.log('[OK] App.vue - Setting & User icons added');
}

// ===== 4. Create RestaurantSettings.vue =====
{
  const content = `<template>
  <div>
    <div class="page-header">
      <h2>\u9910\u5385\u8bbe\u7f6e</h2>
    </div>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" style="max-width: 600px">
      <el-form-item label="\u9910\u5385\u540d\u79f0" prop="name">
        <el-input v-model="form.name" placeholder="\u8bf7\u8f93\u5165\u9910\u5385\u540d\u79f0" />
      </el-form-item>
      <el-form-item label="\u8054\u7cfb\u7535\u8bdd" prop="phone">
        <el-input v-model="form.phone" placeholder="\u8bf7\u8f93\u5165\u8054\u7cfb\u7535\u8bdd" />
      </el-form-item>
      <el-form-item label="\u9910\u5385\u5730\u5740" prop="address">
        <el-input v-model="form.address" type="textarea" :rows="2" placeholder="\u8bf7\u8f93\u5165\u9910\u5385\u5730\u5740" />
      </el-form-item>
      <el-form-item label="\u8425\u4e1a\u65f6\u95f4">
        <el-input v-model="form.businessHours" placeholder="\u5982: 09:00-22:00" />
      </el-form-item>
      <el-form-item label="\u9910\u5385\u63cf\u8ff0">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="\u9910\u5385\u7b80\u4ecb" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSave" :loading="saving">\u4fdd\u5b58\u8bbe\u7f6e</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getRestaurantInfo, updateRestaurantInfo } from '../api'

const formRef = ref(null)
const saving = ref(false)
const form = ref({ name: '', phone: '', address: '', businessHours: '', description: '' })
const rules = {
  name: [{ required: true, message: '\u8bf7\u8f93\u5165\u9910\u5385\u540d\u79f0', trigger: 'blur' }]
}

const loadInfo = async () => {
  try {
    const data = await getRestaurantInfo()
    if (data) {
      form.value = { ...form.value, ...data }
    }
  } catch (e) { console.error(e) }
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  saving.value = true
  try {
    await updateRestaurantInfo(form.value)
    ElMessage.success('\u4fdd\u5b58\u6210\u529f')
  } catch (e) { ElMessage.error(e.message) }
  saving.value = false
}

onMounted(loadInfo)
<\/script>
`;
  fs.writeFileSync(base + '/views/RestaurantSettings.vue', content, 'utf8');
  console.log('[OK] RestaurantSettings.vue created');
}

// ===== 5. Create AdminUsers.vue =====
{
  const content = `<template>
  <div>
    <div class="page-header">
      <h2>\u7ba1\u7406\u5458\u7ba1\u7406</h2>
      <el-button type="success" @click="openDialog()">\u65b0\u589e\u7ba1\u7406\u5458</el-button>
    </div>

    <el-table :data="users" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="\u7528\u6237\u540d" />
      <el-table-column prop="role" label="\u89d2\u8272" width="120">
        <template #default="{ row }">
          <el-tag :type="row.role === 'admin' ? 'primary' : 'warning'" size="small">
            {{ row.role === 'admin' ? '\u7ba1\u7406\u5458' : '\u8d85\u7ea7\u7ba1\u7406\u5458' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="\u72b6\u6001" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '\u6b63\u5e38' : '\u7981\u7528' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="\u521b\u5efa\u65f6\u95f4" width="180" />
      <el-table-column label="\u64cd\u4f5c" width="200" fixed="right">
        <template #default="{ row }">
          <el-button text size="small" type="primary" @click="openDialog(row)">\u7f16\u8f91</el-button>
          <el-popconfirm title="\u786e\u5b9a\u5220\u9664\uff1f" @confirm="handleDelete(row)">
            <template #reference>
              <el-button text size="small" type="danger">\u5220\u9664</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingUser ? '\u7f16\u8f91\u7ba1\u7406\u5458' : '\u65b0\u589e\u7ba1\u7406\u5458'" width="420">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="\u7528\u6237\u540d" prop="username">
          <el-input v-model="form.username" placeholder="\u8bf7\u8f93\u5165\u7528\u6237\u540d" />
        </el-form-item>
        <el-form-item :label="\u5bc6\u7801" :prop="editingUser ? '' : 'password'">
          <el-input v-model="form.password" type="password" show-password :placeholder="editingUser ? '\u7559\u7a7a\u8868\u793a\u4e0d\u4fee\u6539' : '\u8bf7\u8f93\u5165\u5bc6\u7801'" />
        </el-form-item>
        <el-form-item label="\u89d2\u8272" prop="role">
          <el-select v-model="form.role" style="width: 100%">
            <el-option label="\u7ba1\u7406\u5458" value="admin" />
            <el-option label="\u8d85\u7ea7\u7ba1\u7406\u5458" value="super_admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">\u53d6\u6d88</el-button>
        <el-button type="primary" @click="saveUser">\u4fdd\u5b58</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from '../api'

const users = ref([])
const dialogVisible = ref(false)
const editingUser = ref(null)
const formRef = ref(null)
const form = ref({ username: '', password: '', role: 'admin' })
const rules = {
  username: [{ required: true, message: '\u8bf7\u8f93\u5165\u7528\u6237\u540d', trigger: 'blur' }],
  password: [{ required: true, message: '\u8bf7\u8f93\u5165\u5bc6\u7801', trigger: 'blur' }],
  role: [{ required: true, message: '\u8bf7\u9009\u62e9\u89d2\u8272', trigger: 'change' }]
}

const loadUsers = async () => {
  try { users.value = await getAdminUsers() } catch (e) { console.error(e) }
}

const openDialog = (user) => {
  if (user) {
    editingUser.value = user
    form.value = { username: user.username, password: '', role: user.role || 'admin' }
  } else {
    editingUser.value = null
    form.value = { username: '', password: '', role: 'admin' }
  }
  dialogVisible.value = true
}

const saveUser = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  try {
    const data = { ...form.value }
    if (editingUser.value && !data.password) delete data.password
    if (editingUser.value) {
      await updateAdminUser(editingUser.value.id, data)
      ElMessage.success('\u7f16\u8f91\u6210\u529f')
    } else {
      await createAdminUser(data)
      ElMessage.success('\u65b0\u589e\u6210\u529f')
    }
    dialogVisible.value = false
    loadUsers()
  } catch (e) { ElMessage.error(e.message) }
}

const handleDelete = async (user) => {
  try { await deleteAdminUser(user.id); ElMessage.success('\u5220\u9664\u6210\u529f'); loadUsers() } catch (e) { ElMessage.error(e.message) }
}

onMounted(loadUsers)
<\/script>
`;
  fs.writeFileSync(base + '/views/AdminUsers.vue', content, 'utf8');
  console.log('[OK] AdminUsers.vue created');
}

console.log('\n=== All P0 patches applied ===');
