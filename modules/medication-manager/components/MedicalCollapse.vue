<template>
  <!--
    ============================================================================
    处方折叠面板组件
    ============================================================================
    
    功能说明：
    用于历史处方列表页，展示单条处方信息的可折叠卡片。
    支持懒加载处方详情，点击展开时才加载药品列表。
    
    使用场景：
    - 历史处方页 (MedicationHistory.vue) 中展示处方列表
    - 每条处方使用此组件展示，支持展开/收起查看药品详情
    
    交互逻辑：
    1. 点击头部展开/收起面板
    2. 首次展开时触发 change 事件，父组件调用 API 加载详情
    3. 展开后显示处方下的药品列表
    4. 点击药品的"添加"按钮触发 item-click 事件
    
    样式说明：
    - 白色圆角卡片，带阴影
    - 头部显示处方类型图标和处方号
    - 内容区显示药品列表
    ============================================================================
  -->
  <view v-if="item" class="medical-collapse">
    <!--
      使用第三方折叠组件 c-collapse 实现展开/收起功能
      
      属性说明：
      - offsetContentHeight: 内容高度偏移，用于动画优化
      - open: 是否默认展开
      - borderRadius: 是否显示圆角
      
      事件说明：
      - change: 展开/收起状态变化时触发
    -->
    <c-collapse
      :offset-content-height="15"
      :open="open"
      border-radius
      @change="handleChange"
    >
      <!-- 头部插槽：处方类型 + 处方号 -->
      <template #title>
        <view class="collapse-header">
          <!--
            处方类型图标
            - prescTypeCode === '1'：中药，显示中药图标
            - 其他：西药，显示西药图标
          -->
          <view
            :class="[
              item.prescTypeCode === '1' 
                ? 'icon-chinese-medicine' 
                : 'icon-western-medicine'
            ]"
            class="icon-font"
          />
          
          <!-- 处方号 -->
          <view class="prescription-no">
            <text>处方号：</text>
            <text class="no-value">{{ item.prescNo }}</text>
          </view>
        </view>
      </template>

      <!-- 内容插槽：药品列表 -->
      <template #default>
        <view class="collapse-content">
          <!--
            遍历药品列表
            注意：drugDetailList 是懒加载的，首次展开时可能为空
          -->
          <view
            v-for="(drug, index) in item.drugDetailList"
            :key="index"
            class="drug-item"
          >
            <!-- 药品头部：名称 + 添加按钮 -->
            <view class="drug-header">
              <!--
                药品名称展示
                中药特殊处理：可能包含 drugDetailList（子药品列表）
              -->
              <view class="drug-name">
                <!-- 中药：显示所有子药品名称 -->
                <template v-if="item.prescTypeCode === '1' && drug.drugDetailList">
                  <view class="chinese-drug-list">
                    <text
                      v-for="(subDrug, subIndex) in drug.drugDetailList"
                      :key="subIndex"
                      class="sub-drug-name"
                    >
                      {{ subDrug.drugName }}{{ subDrug.amount }}{{ subDrug.packageUnits || subDrug.units }}
                    </text>
                  </view>
                  <text class="drug-count">共{{ drug.drugDetailList.length }}种</text>
                </template>
                
                <!-- 西药：直接显示药品名 -->
                <text v-else class="western-drug-name">{{ drug.drugName }}</text>
              </view>
              
              <!-- 添加按钮：点击后将药品信息传递到表单页 -->
              <view class="add-btn" @click.stop="handleAddClick(drug)">
                添加
              </view>
            </view>

            <!-- 药品详情：规格 + 用量 + 频次等 -->
            <view class="drug-detail">
              <text v-if="drug.itemSpec" class="detail-item">{{ drug.itemSpec }}</text>
              <text v-if="drug.amount" class="detail-item">
                {{ drug.amount }}{{ drug.units || drug.packageUnits || '' }}
              </text>
              <text v-if="drug.drugUnit" class="detail-item">{{ drug.drugUnit }}</text>
              <text v-if="drug.frequency" class="detail-item">{{ drug.frequency }}</text>
              <text v-if="drug.use" class="detail-item">{{ drug.use }}</text>
              <text v-if="drug.road" class="detail-item">{{ drug.road }}</text>
            </view>
          </view>
          
          <!-- 空状态：详情加载中或无药品 -->
          <view v-if="item.drugDetailList.length === 0" class="empty-detail">
            <text class="empty-text">暂无药品详情</text>
          </view>
        </view>
      </template>
    </c-collapse>
  </view>
</template>

<script setup lang="ts">
/**
 * ============================================================================
 * 处方折叠面板组件 - 脚本部分
 * ============================================================================
 * 
 * 组件职责：
 * 1. 展示处方基本信息（类型、处方号）
 * 2. 支持展开/收起查看药品详情
 * 3. 触发事件供父组件懒加载详情
 * 4. 触发药品选择事件供父组件处理跳转
 * 
 * 使用示例：
 * ```vue
 * <template>
 *   <view v-for="group in listData" :key="group.date">
 *     <view class="date-title">{{ group.date }}</view>
 *     <MedicalCollapse
 *       v-for="prescription in group.prescList"
 *       :key="prescription.prescId"
 *       :item="prescription"
 *       :open="isFirst(group, prescription)"
 *       @change="handleCollapseChange"
 *       @item-click="handleDrugSelect"
 *     />
 *   </view>
 * </template>
 * 
 * <script setup>
 * import MedicalCollapse from './components/MedicalCollapse.vue';
 * import { useMedicationStore } from '../store/medicationStore';
 * 
 * const medicationStore = useMedicationStore();
 * 
 * // 展开时加载详情
 * const handleCollapseChange = async (event) => {
 *   const { item, isShow, init } = event;
 *   if (isShow && !item.drugDetailList.length) {
 *     await loadPrescriptionDetail(item);
 *     init(); // 通知折叠组件重新计算高度
 *   }
 * };
 * 
 * // 选择药品
 * const handleDrugSelect = (drug) => {
 *   medicationStore.changeAddItem(drug);
 *   uni.navigateTo({ url: '.../MedicationForm' });
 * };
 * </script>
 * ```
 * ============================================================================
 */

import { ref } from 'vue';
import type { TMedicalDrugHisListItem, TDrugDetailItem } from '../types';

// 模拟导入第三方折叠组件（实际应从正确路径导入）
const cCollapse = {
  name: 'c-collapse',
  // 实际使用时这里应该是真实的组件
};

// ============================================
// Props 定义
// ============================================

/**
 * 组件 Props
 * 
 * @property item - 处方数据（必填）
 * @property open - 是否默认展开（可选，默认 false）
 */
interface Props {
  item: TMedicalDrugHisListItem;
  open?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
});

// ============================================
// Emits 定义
// ============================================

/**
 * 组件事件
 * 
 * @event change - 展开/收起状态变化时触发
 * @param { isShow: boolean, item: TMedicalDrugHisListItem, init: Function }
 *        isShow: 是否展开
 *        item: 处方数据
 *        init: 回调函数，加载完详情后调用以刷新折叠面板高度
 * 
 * @event item-click - 点击药品的"添加"按钮时触发
 * @param drug - 药品详情数据
 */
const emit = defineEmits<{
  (
    e: 'change',
    payload: {
      isShow: boolean;
      item: TMedicalDrugHisListItem;
      init: () => void;
    }
  ): void;
  (e: 'item-click', drug: TDrugDetailItem): void;
}>();

// ============================================
// 状态和方法
// ============================================

/**
 * 折叠组件引用
 * 用于调用内部方法重新计算高度
 */
const collapseRef = ref<any>(null);

/**
 * 处理展开/收起变化
 * 
 * 逻辑：
 * 1. 触发 change 事件通知父组件
 * 2. 父组件可以在此过程中加载详情
 * 3. 提供 init 回调函数供父组件加载完详情后刷新高度
 * 
 * @param isShow - 是否展开
 */
const handleChange = (isShow: boolean): void => {
  emit('change', {
    isShow,
    item: props.item,
    init: () => {
      // 父组件加载完详情后调用此方法刷新折叠面板高度
      collapseRef.value?.init?.();
    },
  });
};

/**
 * 处理添加按钮点击
 * 
 * 逻辑：
 * 触发 item-click 事件，将药品数据传递给父组件
 * 父组件通常会将数据存入 store 并跳转到表单页
 * 
 * @param drug - 药品详情
 */
const handleAddClick = (drug: TDrugDetailItem): void => {
  emit('item-click', drug);
};
</script>

<style lang="scss" scoped>
/**
 * ============================================================================
 * 样式说明
 * ============================================================================
 * 
 * 设计规范：
 * - 白色背景圆角卡片
 * - 中药/西药使用不同图标区分
 * - 药品信息横向排列，超出换行
 * - 添加按钮高亮显示
 * ============================================================================
 */

.medical-collapse {
  font-size: 28rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 16rpx rgba(215, 215, 215, 0.6);
  margin-bottom: 16rpx;

  // 头部样式
  .collapse-header {
    display: flex;
    align-items: center;
    padding: 24rpx 32rpx;

    // 图标
    .icon-font {
      font-size: 28rpx;
      margin-right: 16rpx;
      
      &.icon-chinese-medicine {
        // 中药图标样式（如绿色）
        color: #52c41a;
      }
      
      &.icon-western-medicine {
        // 西药图标样式（如蓝色）
        color: #1890ff;
      }
    }

    // 处方号
    .prescription-no {
      color: var(--hr-neutral-color-10);
      
      .no-value {
        font-weight: 600;
      }
    }
  }

  // 内容区样式
  .collapse-content {
    padding: 0 32rpx 24rpx;

    // 单个药品项
    .drug-item {
      padding: 24rpx 0;
      border-bottom: 1rpx solid var(--hr-neutral-color-2);
      
      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      // 药品头部：名称 + 添加按钮
      .drug-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        // 药品名称区
        .drug-name {
          flex: 1;
          margin-right: 16rpx;

          // 中药列表
          .chinese-drug-list {
            display: flex;
            flex-wrap: wrap;
            gap: 12rpx;
            
            .sub-drug-name {
              font-weight: 600;
              font-size: 32rpx;
              color: var(--hr-neutral-color-10);
            }
          }

          // 药品数量标签
          .drug-count {
            display: inline-block;
            margin-top: 8rpx;
            padding: 4rpx 12rpx;
            background: var(--hr-neutral-color-1);
            border-radius: 8rpx;
            font-size: 24rpx;
            color: var(--hr-neutral-color-7);
          }

          // 西药名称
          .western-drug-name {
            font-weight: 600;
            font-size: 32rpx;
            color: var(--hr-neutral-color-10);
          }
        }

        // 添加按钮
        .add-btn {
          padding: 10rpx 24rpx;
          background: var(--hr-brand-color-1);
          border-radius: 12rpx;
          font-size: 26rpx;
          color: var(--hr-brand-color-6);
          white-space: nowrap; // 不换行
          
          &:active {
            opacity: 0.8;
          }
        }
      }

      // 药品详情
      .drug-detail {
        margin-top: 16rpx;
        font-size: 26rpx;
        color: var(--hr-neutral-color-7);
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;
        
        .detail-item {
          margin-right: 12rpx;
        }
      }
    }
    
    // 空状态
    .empty-detail {
      padding: 48rpx 0;
      text-align: center;
      
      .empty-text {
        font-size: 28rpx;
        color: var(--hr-neutral-color-6);
      }
    }
  }
}
</style>
