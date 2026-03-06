<template>
  <view class="form-renderer">
    <!-- 图片轮播插槽 -->
    <slot name="header" />
    
    <!-- 前言 -->
    <view v-if="preface" class="form-preface">
      {{ preface }}
    </view>
    
    <!-- 表单内容 -->
    <view class="form-content">
      <slot />
    </view>
    
    <!-- 底部插槽 -->
    <slot name="footer" />
  </view>
</template>

<script setup lang="ts">
/**
 * 表单渲染容器
 * @description 统一的表单布局容器，提供前言、内容区、底部区域
 */

// ==================== 类型定义 ====================

interface Props {
  /** 前言内容 */
  preface?: string;
}

// ==================== Props ====================

defineProps<Props>();
</script>

<style lang="scss" scoped>
.form-renderer {
  width: 100%;
  
  .form-preface {
    padding: 24rpx 32rpx;
    font-size: 28rpx;
    line-height: 1.6;
    color: #666;
    background-color: #f5f5f5;
    border-radius: 8rpx;
    margin: 16rpx 0;
  }
  
  .form-content {
    padding: 16rpx 0;
  }
}
</style>
