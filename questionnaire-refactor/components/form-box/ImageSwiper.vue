<template>
  <view v-if="images.length > 0" class="image-swiper">
    <swiper
      class="swiper"
      :style="{ height: `${height}rpx` }"
      :circular="swiperConfig.CIRCULAR"
      :indicator-dots="swiperConfig.INDICATOR_DOTS"
      :autoplay="autoplay"
      :interval="swiperConfig.INTERVAL"
      :duration="swiperConfig.DURATION"
    >
      <swiper-item
        v-for="(img, index) in images"
        :key="index"
        class="swiper-item"
        @click="handlePreview(index)"
      >
        <image
          :src="img"
          mode="widthFix"
          class="swiper-image"
          @error="handleImageError(index)"
        />
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup lang="ts">
/**
 * 图片轮播组件
 * @description 问卷顶部的图片轮播展示
 */

import { computed } from 'vue';
import { SWIPER_CONFIG } from '../../constants/questionnaire';

// ==================== 类型定义 ====================

interface Props {
  /** 图片URL列表 */
  images: string[];
  /** 轮播高度（rpx） */
  height?: number;
  /** 是否自动播放 */
  autoplay?: boolean;
}

interface Emits {
  (e: 'preview', index: number): void;
  (e: 'error', index: number): void;
}

// ==================== Props & Emits ====================

const props = withDefaults(defineProps<Props>(), {
  height: 208,
  autoplay: true,
});

const emit = defineEmits<Emits>();

// ==================== 常量 ====================

const swiperConfig = SWIPER_CONFIG;

// ==================== 方法 ====================

const handlePreview = (index: number): void => {
  emit('preview', index);
};

const handleImageError = (index: number): void => {
  console.warn(`[ImageSwiper] 图片加载失败: ${props.images[index]}`);
  emit('error', index);
};
</script>

<style lang="scss" scoped>
.image-swiper {
  width: 100%;
  
  .swiper {
    width: 100%;
    
    &-item {
      width: 100%;
      height: 100%;
    }
    
    &-image {
      width: 100%;
      display: block;
    }
  }
}
</style>
