# Seed Bottles Script

这个脚本用于清空旧数据并添加新的种子数据到公共瓶子池。

## 准备工作

### 方法 1: 使用 Service Account Key（推荐）

1. 打开 [Firebase Console](https://console.firebase.google.com/)
2. 选择你的项目
3. 点击左侧的 **⚙️ 设置** > **项目设置**
4. 选择 **服务账号** 标签
5. 点击 **生成新的私钥**
6. 下载 JSON 文件
7. 将文件重命名为 `firebase-service-account.json`
8. 将文件放到项目根目录（和 `package.json` 同级）

### 方法 2: 使用 Application Default Credentials

如果你已经安装了 Google Cloud SDK:

```bash
gcloud auth application-default login
```

## 运行脚本

```bash
npm run seed:bottles
```

## 脚本功能

1. **清空旧数据**: 删除 `artifacts/{appId}/public/data/pool_bottles` 中的所有瓶子
2. **添加新数据**: 添加 200 个种子瓶子（100 个中文 + 100 个英文）
3. **显示统计**: 显示每种心情的瓶子数量

## 注意事项

- 这个脚本使用 Firebase Admin SDK，可以绕过 Firestore 安全规则
- 确保你有足够的权限操作 Firestore
- Service account key 文件 (`firebase-service-account.json`) 已经被添加到 `.gitignore`，不会被提交到 Git

## 数据分类

种子数据包含 4 种心情类型：

- **happy**: 快乐与分享 / Joy & Gratitude
- **sad**: 忧伤与倾诉 / Melancholy & Reflection
- **love**: 爱与祝福 / Romance & Kindness
- **talk**: 闲聊与好奇 / Questions & Curiosity

每种类型各有 25 个中文消息和 25 个英文消息。

