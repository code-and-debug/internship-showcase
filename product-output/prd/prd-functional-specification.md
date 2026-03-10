# 产品需求文档 (PRD)

## 智慧医疗服务 H5 应用

**版本**: v3.0  
**编写日期**: 2026年3月6日  
**产品负责人**: 医疗产品团队  

---

## 1. 文档概述

### 1.1 产品背景

本项目是一个基于uni-app开发的智慧医疗服务H5应用，支持多端发布（H5、微信小程序、支付宝小程序等）。旨在为患者提供便捷的线上医疗服务，优化就医流程，提升患者就医体验。

### 1.2 目标用户

- **主要用户**: 患者及其家属
- **次要用户**: 医院工作人员、医生

### 1.3 技术架构

| 技术项 | 说明 |
|--------|------|
| 前端框架 | Vue 3 + TypeScript |
| 跨端框架 | uni-app |
| 构建工具 | Vite |
| 状态管理 | Pinia |
| UI组件 | uni-ui + 自定义组件 |
| 样式方案 | TailwindCSS + SCSS |

### 1.4 运行环境

- **Node版本**: v18.12.0
- **包管理器**: Yarn 4.0.2
- **部署环境**: 
  - 测试环境: https://test.example-hospital.com/patient-app/#/
  - 正式环境: https://h5.example-hospital.com/patient-app/#/

---

## 2. 功能模块

### 2.1 核心功能模块总览

```
├── 首页服务
├── 预约挂号
├── 预问诊系统
├── 健康档案
├── 报告查询
├── 住院服务
├── 用药管理
├── 健康自测
├── 健康资讯
├── 智能导诊
├── 电子发票
├── 服务评价
└── 问卷调查
```

---

## 3. 功能详细说明

### 3.1 首页与基础服务 (pages)

#### 3.1.1 首页 (pages/index/index)
- **功能描述**: 应用入口页面，展示核心服务入口
- **核心功能**:
  - 医院导航与指南
  - 快捷服务入口
  - 消息通知
  - 个人中心入口

#### 3.1.2 服务电话 (pages/helplines/helplines)
- **功能描述**: 展示医院各科室服务电话
- **参数**: `sysCode` - 系统编码
- **功能点**:
  - 电话列表展示
  - 一键拨号
  - 按科室分类

#### 3.1.3 附近停车场 (pages/nearbyParking/nearbyParking)
- **功能描述**: 显示医院周边停车场信息
- **功能点**:
  - 地图展示
  - 停车位余量
  - 导航功能

#### 3.1.4 医院指南 (pages/hospitalGuide/hospitalGuide)
- **功能描述**: 医院导航指南
- **参数**: `sysCode`, `hosId`
- **功能点**:
  - 科室分布
  - 就诊流程
  - 导航路线

---

### 3.2 预问诊系统 (pages/inquiries)

#### 3.2.1 普通预问诊 (pages/inquiries/inquiries)
- **功能描述**: 就诊前的智能问诊系统
- **参数**: `sysCode`, `token`
- **核心功能**:
  - 症状自评
  - 病史采集
  - 智能问答
  - 语音输入
  - 图片上传

#### 3.2.2 AI预问诊 (pages/inquiries/inquiriesAi)
- **功能描述**: 基于AI的智能预问诊
- **特色功能**:
  - AI对话式问诊
  - 智能症状分析
  - 就医建议推荐

#### 3.2.3 MDT预问诊 (pages/inquiries/inquiriesSzMDT)
- **功能描述**: 多学科会诊预问诊
- **适用场景**: 复杂疾病多学科会诊

#### 3.2.4 流调表 (pages/inquiries/flowAdjustable)
- **功能描述**: 流行病学调查表
- **适用场景**: 疫情防控期间的流行病学史筛查

#### 3.2.5 预问诊报告 (pagesC/inquiries/inquiriesRes)
- **功能描述**: 展示预问诊结果报告
- **报告内容**:
  - 症状总结
  - 初步评估
  - 就医建议
  - 医生查看入口

---

### 3.3 预约挂号 (pagesA)

#### 3.3.1 医生详情 (pagesA/MyRegistration/DoctorDetails)
- **功能描述**: 展示医生详细信息和排班
- **功能点**:
  - 医生简介
  - 专业特长
  - 排班信息
  - 在线预约

#### 3.3.2 科室详情 (pagesA/MyRegistration/DepartmentCardDetail)
- **功能描述**: 科室介绍和医生列表
- **功能点**:
  - 科室介绍
  - 医生列表
  - 排班查询

#### 3.3.3 云诊室 (pagesA/MyRegistration/registrationTypeYun)
- **功能描述**: 线上诊疗预约
- **特色**: 互联网医院线上问诊

---

### 3.4 住院服务 (pagesA)

#### 3.4.1 住院管家 (pagesA/1001093/hosButler)
- **功能描述**: 住院期间的一站式服务
- **核心功能**:
  - 住院信息查询
  - 费用清单查看
  - 院前检查预约
  - 住院指南

#### 3.4.2 住院登记 (pagesA/1001057/hospitalizationRegistrationQuestion)
- **功能描述**: 在线办理住院登记
- **流程**:
  - 信息填写
  - 问卷评估
  - 登记确认

#### 3.4.3 入院登记 (pagesA/nanXunRequestion/hosCheckIn)
- **功能描述**: 南浔院区入院登记
- **功能点**:
  - 患者信息录入
  - 核酸结果上传
  - 流调问卷

---

### 3.5 报告查询 (pagesB/reportQuery)

#### 3.5.1 报告查询首页 (pagesB/reportQuery/reportQuery)
- **功能描述**: 检验检查报告统一查询入口
- **支持报告类型**:
  - 检验报告
  - 检查报告
  - 体检报告

#### 3.5.2 检验报告详情 (pagesB/reportQuery/InspectionDetails)
- **功能描述**: 查看检验报告详细内容
- **功能点**:
  - 检验项目列表
  - 结果解读
  - 异常指标标注
  - 历史趋势图

#### 3.5.3 检查报告 (pagesB/reportQuery/inspectionReport)
- **功能描述**: 影像检查报告查看
- **支持类型**: CT、MRI、X光、超声等

#### 3.5.4 PDF报告查看 (pagesB/reportQuery/reportPdf)
- **功能描述**: 原始报告PDF查看
- **功能点**:
  - PDF在线预览
  - 报告下载
  - 分享功能

---

### 3.6 用药管理 (pagesC/medicationManager)

#### 3.6.1 用药提醒列表 (pagesC/medicationManager/medicationList)
- **功能描述**: 管理患者用药计划
- **参数**: `sysCode`, `token`, `patientId`
- **核心功能**:
  - 用药列表
  - 提醒设置
  - 用药记录
  - 药品搜索

#### 3.6.2 添加用药 (pagesC/medicationManager/addMedical)
- **功能描述**: 添加新的用药计划
- **功能点**:
  - 药品搜索
  - 用药剂量设置
  - 用药时间设置
  - 提醒方式配置

#### 3.6.3 用药历史 (pagesC/medicationManager/medicationHistory)
- **功能描述**: 查看历史用药记录

#### 3.6.4 药品查询 (pagesC/medicationQuery/medicationQuery)
- **功能描述**: 药品信息查询
- **功能点**:
  - 药品搜索
  - 药品详情
  - 用法用量
  - 注意事项

---

### 3.7 健康档案 (pagesC/healthRecord)

#### 3.7.1 健康档案首页 (pagesC/healthRecord/healthRecord)
- **功能描述**: 患者健康档案总览
- **核心功能**:
  - 基本信息
  - 就诊历史
  - 检查记录
  - 处方记录
  - 健康指标趋势

#### 3.7.2 就诊史 (pagesC/healthRecord/healthRecordHis)
- **功能描述**: 历史就诊记录
- **功能点**:
  - 就诊时间线
  - 就诊详情
  - 医生信息
  - 诊断信息

#### 3.7.3 就诊详情 (pagesC/healthRecord/healthRecordDetail)
- **功能描述**: 单次就诊详细信息
- **内容包括**:
  - 诊断结果
  - 处方信息
  - 检查建议
  - 费用明细

---

### 3.8 健康自测 (pagesA/healthSelfTest)

#### 3.8.1 自测首页 (pagesA/healthSelfTest/healthSelfTest)
- **功能描述**: 健康自评工具集合
- **自测项目**:

| 自测项目 | 页面路径 | 说明 |
|---------|---------|------|
| 血压指数 | healthxyzs | 血压健康评估 |
| 肥胖指数 | healthfpzs | BMI计算与评估 |
| 心脏功能 | healthxzgn | 心脏健康自测 |
| 肺功能 | healthfgn | 肺健康评估 |
| 动脉血管 | healthdmxg | 血管健康评估 |
| 2型糖尿病 | health2xtnb | 糖尿病风险评估 |
| 心理年龄 | healthxlnl | 心理健康评估 |
| 心理压力 | healthxlyl | 压力水平测试 |
| 老年痴呆 | healthlncd | 认知功能筛查 |
| 跌倒评估 | healthddpg | 跌倒风险评估 |
| 胃癌筛查 | healthwasc | 胃癌风险筛查 |
| 认知功能自评 | healthrzzp | 认知能力测试 |

#### 3.8.2 自测结果展示
- **功能描述**: 展示自测结果和健康建议
- **功能点**:
  - 分数计算
  - 结果解读
  - 改善建议
  - 就医指导

---

### 3.9 健康资讯 (pagesA/healthAdvisory)

#### 3.9.1 资讯列表 (pagesA/healthAdvisory/healthAdvisory)
- **功能描述**: 健康科普文章列表
- **参数**: `sysCode`
- **功能点**:
  - 文章分类
  - 搜索功能
  - 推荐阅读
  - 收藏功能

#### 3.9.2 资讯详情 (pagesA/healthAdvisory/healthAdvisoryDetail)
- **功能描述**: 文章详情页
- **功能点**:
  - 富文本内容
  - 视频播放
  - 分享功能
  - 相关推荐

#### 3.9.3 健康教育处方 (pagesA/healthAdvisory/healthAdvisoryWz)
- **功能描述**: 医生开具的健康教育处方
- **内容包括**:
  - 疾病知识
  - 用药指导
  - 饮食建议
  - 运动指导

---

### 3.10 智能导诊 (pagesC/IntelligentGuidance)

#### 3.10.1 智能导诊选择 (pagesC/IntelligentGuidance/select)
- **功能描述**: 根据症状推荐就诊科室
- **功能点**:
  - 症状选择
  - 部位选择
  - 科室推荐
  - 医生推荐

#### 3.10.2 推荐结果 (pagesC/IntelligentGuidance/moreSelect)
- **功能描述**: 展示导诊推荐结果

---

### 3.11 电子发票 (pagesA/eletronicInvoice)

#### 3.11.1 发票列表 (pagesA/eletronicInvoice/eletronicInvoice)
- **功能描述**: 电子发票查询与管理
- **功能点**:
  - 发票列表
  - 发票下载
  - 发票验真
  - 邮件发送

#### 3.11.2 发票详情 (pagesA/eletronicInvoice/invoiceDetail)
- **功能描述**: 发票详细信息
- **内容包括**:
  - 发票抬头
  - 费用明细
  - 开票时间
  - 下载功能

#### 3.11.3 医保结算清单 (pagesA/eletronicInvoice/settleList)
- **功能描述**: 医保结算信息查询

---

### 3.12 手术查询 (pagesC/operationRes)

#### 3.12.1 手术查询 (pagesC/operationRes/operationRes)
- **功能描述**: 手术状态实时查询
- **功能点**:
  - 手术状态
  - 等待时间
  - 消息推送

#### 3.12.2 手术记录 (pagesC/operationRes/operationList)
- **功能描述**: 历史手术记录查询

---

### 3.13 排队叫号 (pagesC/queueNumber)

#### 3.13.1 排队叫号 (pagesC/queueNumber/queueNumber)
- **功能描述**: 实时排队叫号信息
- **参数**: `sysCode`, `token`, `patientId`
- **功能点**:
  - 当前叫号
  - 我的排队
  - 等待人数
  - 预计时间

---

### 3.14 问卷调查系统 (pagesC/question)

#### 3.14.1 满意度调查
- **门诊满意度**: wzzxyQuestion1
- **住院满意度**: wzzxyQuestion2
- **通用满意度**: dzQuestion, hkmydQuestion

#### 3.14.2 专科问卷
- **MDT问卷**: hhMDTQuestion, hhZLMDTQuestion
- **Kupperman评分**: kuppermanQuestion
- **术后随访**: questionAfterVisit

#### 3.14.3 特殊问卷
- **候补加号预问诊**: srmAlternatePreQues
- **母乳录入**: breastMilkCollocet
- **病情描述**: alternatePreQues

---

### 3.15 病历档案 (pagesC/periodArchives)

#### 3.15.1 周期性档案 (pagesC/periodArchives/periodArchives)
- **功能描述**: 孕期、育儿等周期性健康管理
- **功能点**:
  - 档案建立
  - 记录管理
  - 提醒服务

#### 3.15.2 诊断详情 (pagesC/periodArchives/diagnosisDetail)
- **功能描述**: 诊断记录详情

---

### 3.16 我的医生 (pagesC/myDoctor)

#### 3.16.1 我的医生 (pagesC/myDoctor/myDoctor)
- **功能描述**: 管理关注的医生
- **参数**: `sysCode`, `token`, `patientId`
- **功能点**:
  - 医生列表
  - 医生主页
  - 快速预约

#### 3.16.2 我的收藏 (pagesC/myDoctor/myCollect)
- **功能描述**: 收藏的医生和文章

---

### 3.17 便民服务 (pagesA/yiwu)

#### 3.17.1 陪诊服务
- **服务列表**: accompanyConsultationList
- **服务详情**: accompanyConsultationDetail
- **志愿者陪诊**: accompanyConsultationDetail2
- **服务声明**: accompanyConsultationStatement1/2

#### 3.17.2 非急救转运 (pagesA/yiwu/nonEmergencyTransport)
- **功能描述**: 非急救医疗转运预约
- **功能点**:
  - 预约申请
  - 服务说明
  - 费用查询

---

### 3.18 特色专窗 (pagesA/dongzong)

#### 3.18.1 警员专窗 (PoliceWindow)
- **功能描述**: 公安系统人员就医绿色通道

#### 3.18.2 人才专窗 (TalentWindow)
- **功能描述**: 高层次人才就医服务

#### 3.18.3 院校专窗 (schoolWindow)
- **功能描述**: 高校师生就医服务

#### 3.18.4 检查预约 (checkList)
- **功能描述**: 各类检查项目预约
- **功能点**:
  - 检查项目选择
  - 时间预约
  - 地点选择

---

### 3.19 电子锦旗 (pagesB/praise)

#### 3.19.1 锦旗大厅 (pagesB/praise/praiseHall)
- **功能描述**: 展示患者赠送的电子锦旗
- **功能点**:
  - 锦旗展示
  - 按科室筛选
  - 锦旗详情

#### 3.19.2 赠送锦旗 (pagesB/praise/praiseSubmit)
- **功能描述**: 向医生赠送电子锦旗
- **流程**:
  - 选择医生
  - 选择模板
  - 填写赠言
  - 确认赠送

---

### 3.20 价格查询 (pagesC/priceInquiry)

#### 3.20.1 价格查询 (pagesC/priceInquiry/priceInquiry)
- **功能描述**: 医疗服务价格公开查询
- **功能点**:
  - 项目搜索
  - 价格列表
  - 分类浏览

---

### 3.21 病案查询 (pagesC/queryCase)

#### 3.21.1 病案列表 (pagesC/queryCase/queryCase)
- **功能描述**: 住院病案查询
- **功能点**:
  - 病案列表
  - 身份验证
  - 病案详情
  - PDF下载

---

### 3.22 出生医学证明 (pagesC/birthCertificate)

#### 3.22.1 出生证明 (pagesC/birthCertificate/birthCertificate)
- **功能描述**: 出生医学证明办理
- **功能点**:
  - 在线申请
  - 进度查询
  - 电子证明

---

### 3.23 快递服务 (pagesC/myExpress)

#### 3.23.1 我的快递 (pagesC/myExpress/myExpress)
- **功能描述**: 病历、报告等邮寄服务
- **功能点**:
  - 快递列表
  - 下单申请
  - 物流跟踪

---

### 3.24 会员权益 (pagesB/discount)

#### 3.24.1 会员中心 (pagesB/discount/discount)
- **功能描述**: 医院会员权益展示
- **功能点**:
  - 会员等级
  - 权益说明
  - 优惠券

---

### 3.25 临床试验招募 (pagesA/srm)

#### 3.25.1 试验招募 (pagesA/srm/clinicTest)
- **功能描述**: 临床试验患者招募
- **功能点**:
  - 项目列表
  - 项目详情
  - 在线报名

---

### 3.26 消息中心 (pagesB/historicalMess)

#### 3.26.1 历史消息 (pagesB/historicalMess/historicalMess)
- **功能描述**: 系统消息和通知管理

---

### 3.27 快速处方 (pagesB/quickPrescription)

#### 3.27.1 便捷开药 (pagesB/quickPrescription/quickPrescription)
- **功能描述**: 复诊患者的便捷开药服务

---

### 3.28 医疗助手 (pagesC/medicalAssistant)

#### 3.28.1 就诊助手 (pagesC/medicalAssistant/medicalAssistant)
- **功能描述**: 智能就诊辅助工具

---

### 3.29 自助服务 (pagesC/selfService)

#### 3.29.1 我的订单 (pagesC/selfService/myOrder)
- **功能描述**: 各类服务订单管理

#### 3.29.2 核酸开单 (pagesC/selfService/nucleicBilling)
- **功能描述**: 核酸检测在线开单

---

### 3.30 客服中心 (pagesC/serviceCenter)

#### 3.30.1 在线客服 (pagesC/serviceCenter/serviceChat)
- **功能描述**: 在线客服咨询
- **功能点**:
  - 智能客服
  - 人工客服
  - 投诉建议

---

### 3.31 消息订阅 (pagesC/subMsgs)

#### 3.31.1 订阅管理 (pagesC/subMsgs/subMsgs)
- **功能描述**: 消息订阅设置
- **功能点**:
  - 订阅类型选择
  - 推送设置

---

### 3.32 病历借阅 (pagesA/1001067)

#### 3.32.1 切片借阅 (sliceBorrowingHome)
- **功能描述**: 病理切片借阅服务
- **功能点**:
  - 借阅申请
  - 数字切片查看
  - 订单管理

---

### 3.33 治疗预约 (pagesA/1001085)

#### 3.33.1 治疗预约 (treatAppoint)
- **功能描述**: 各类治疗项目预约

---

### 3.34 病房预约 (pagesA/wzrm)

#### 3.34.1 LDR病房预约 (ldrWardReservation)
- **功能描述**: LDR一体化产房预约

#### 3.34.2 母婴友好病房 (friendlyWardReservation)
- **功能描述**: 智慧母婴友好病房预约

#### 3.34.3 高压氧治疗 (hyperbaricOxygenOrder)
- **功能描述**: 高压氧治疗预约与缴费

---

### 3.35 手术预约 (pagesA/surgeryAppointment)

#### 3.35.1 日间手术预约 (surgeryAppointment)
- **功能描述**: 日间手术在线预约

---

### 3.36 失物招领 (pagesA/lostAndFound)

#### 3.36.1 失物列表 (lostItmeList)
- **功能描述**: 医院失物招领信息

---

### 3.37 产科预约 (pagesA/ckBooking)

#### 3.37.1 产科住院预约 (ckBooking)
- **功能描述**: 产科住院床位预约

---

### 3.38 服务评价 (pagesA/1001099)

#### 3.38.1 满意度调查 (serviceEvaluation)
- **功能描述**: 医疗服务满意度评价

---

### 3.39 牙科档案 (pagesB/toothRecord)

#### 3.39.1 种植档案 (pagesB/toothRecord/index)
- **功能描述**: 牙科种植病例管理
- **功能点**:
  - 牙齿图示
  - 种植记录
  - 影像资料

---

### 3.40 健康积分 (pagesC/healthPoints)

#### 3.40.1 积分中心 (healthPoints)
- **功能描述**: 健康行为积分管理

#### 3.40.2 AED查询 (aedInquiry)
- **功能描述**: AED设备位置查询

---

### 3.41 医生签约 (pagesC/doctorSign)

#### 3.41.1 签约服务 (doctorSign)
- **功能描述**: 家庭医生签约服务

---

### 3.42 知情同意 (pagesC/consentCheck)

#### 3.42.1 同意书确认 (consentCheck)
- **功能描述**: 各类知情同意书在线签署

---

### 3.43 疾病管理 (src/mDisease)

#### 3.43.1 疾病管理首页 (mDisease/index/index)
- **功能描述**: 慢病管理总览
- **功能点**:
  - 疾病列表
  - 管理计划
  - 健康指标

#### 3.43.2 血糖管理 (mDisease/detail/blood)
- **功能描述**: 血糖监测与管理
- **功能点**:
  - 血糖记录
  - 趋势图表
  - 异常提醒

#### 3.43.3 饮食管理 (mDisease/detail/diet)
- **功能描述**: 饮食记录与建议

#### 3.43.4 用药管理 (mDisease/medicationUse/index)
- **功能描述**: 慢病用药管理

---

## 4. 通用组件说明

### 4.1 基础组件

| 组件名 | 路径 | 功能说明 |
|--------|------|----------|
| g-choose-pat | components/g-choose-pat | 患者选择组件 |
| g-empty | components/g-empty | 空状态组件 |
| g-flag | components/g-flag | 角标组件 |
| g-grid | components/g-grid | 网格布局组件 |
| g-popup | components/g-popup | 弹窗组件 |
| g-select | components/g-select | 选择器组件 |
| g-step | components/g-step | 步骤条组件 |
| g-tabs | components/g-tabs | 标签页组件 |
| g-tag | components/g-tag | 标签组件 |
| g-message | components/g-message | 消息提示组件 |

### 4.2 业务组件

| 组件名 | 路径 | 功能说明 |
|--------|------|----------|
| orderRegConfirm | components/orderRegConfirm | 预约确认组件 |
| refresh-qrcode | components/refresh-qrcode | 刷新二维码组件 |
| scroll-list | components/scroll-list | 滚动列表组件 |
| page-state | components/page-state | 页面状态组件 |
| lun-collapse | components/lun-collapse | 折叠面板组件 |

---

## 5. 接口规范

### 5.1 通用参数

所有页面默认携带以下参数进行记录和身份识别：

| 参数名 | 说明 | 必填 |
|--------|------|------|
| sysCode | 系统编码 | 是 |
| patientId | 患者ID | 部分页面 |
| patientId | 就诊人ID | 部分页面 |
| token | 登录令牌 | 需要登录的页面 |

### 5.2 API模块

主要API模块位于 `src/api/api.ts`，包括：

- 用户相关接口
- 预约挂号接口
- 报告查询接口
- 支付相关接口
- 消息推送接口

---

## 6. 权限与安全

### 6.1 页面权限

| 权限类型 | 说明 |
|----------|------|
| 公开访问 | 医院指南、健康资讯等 |
| 登录访问 | 个人中心、报告查询等 |
| 实名认证 | 预约、缴费等敏感操作 |

### 6.2 数据安全

- 敏感数据加密传输
- 本地存储加密
- 接口防重放攻击

---

## 7. 性能要求

### 7.1 加载性能

- 首屏加载时间 < 3秒
- 页面切换时间 < 1秒
- 图片懒加载

### 7.2 兼容性

- iOS 9.0+
- Android 5.0+
- 微信内置浏览器
- 主流手机浏览器

---

## 8. 埋点与统计

### 8.1 埋点事件

- 页面访问 (PV/UV)
- 按钮点击
- 功能使用时长
- 错误日志

### 8.2 关键指标

- 功能使用率
- 用户留存率
- 转化率
- 用户满意度

---

## 9. 迭代计划

### 9.1 已完成功能

- [x] 基础框架搭建
- [x] 预问诊系统
- [x] 报告查询
- [x] 用药管理
- [x] 健康自测
- [x] 电子发票
- [x] 智能导诊
- [x] 健康档案

### 9.2 规划中功能

- [ ] 互联网医院视频问诊
- [ ] 药品配送
- [ ] AI健康助手
- [ ] 家庭健康管理
- [ ] 健康商城 (OTC)

---

## 10. 附录

### 10.1 页面路由表

详见 `src/pages.json` 完整配置。

### 10.2 开发规范

- 使用 Vue 3 Composition API
- TypeScript 类型定义
- 组件命名规范
- 代码提交规范 (使用 commitizen)

### 10.3 第三方服务

| 服务 | 用途 |
|------|------|
| 阿里云OSS | 文件存储 |
| 微信JSSDK | 微信功能 |
| 百度地图 | 位置服务 |
| echarts | 数据可视化 |

---

**文档版本**: v1.0  
**最后更新**: 2026-03-06  
**编写人**: AI产品助手
