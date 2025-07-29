<template>
  <div class="min-h-screen bg-gray-50">
    <div class="p-3 mx-auto max-w-4xl">
      <!-- Header -->
      <!-- <div class="bg-white rounded-xl p-6 mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <h1 class="mb-2 text-2xl font-bold text-gray-800">大数据胜诉评估报告</h1>
        <p class="text-gray-600">基于大数据分析的案件胜诉率评估和专业建议</p>
      </div> -->
      <!-- Parameters Form -->
      <div class="bg-white rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.05)] mb-4">
        <h3 class="mb-4 text-lg font-semibold text-gray-800">案例参数设置</h3>

        <div class="space-y-4">
          <!-- 案由 -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">
              案由名称 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="parameters.caseCause"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e23338] focus:ring-1 focus:ring-[#e23338]"
              placeholder="例如：离婚纠纷"
            />
          </div>

          <!-- 省份 -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">
              省份 <span class="text-red-500">*</span>
            </label>
            <select
              v-model="parameters.province"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e23338] focus:ring-1 focus:ring-[#e23338]"
            >
              <option value="">请选择省份</option>
              <option value="北京">北京</option>
              <option value="上海">上海</option>
              <option value="广东">广东</option>
              <option value="江苏">江苏</option>
              <option value="浙江">浙江</option>
              <option value="山东">山东</option>
              <option value="河南">河南</option>
              <option value="四川">四川</option>
              <option value="湖北">湖北</option>
              <option value="湖南">湖南</option>
              <option value="河北">河北</option>
              <option value="福建">福建</option>
              <option value="安徽">安徽</option>
              <option value="江西">江西</option>
              <option value="辽宁">辽宁</option>
              <option value="黑龙江">黑龙江</option>
              <option value="吉林">吉林</option>
              <option value="山西">山西</option>
              <option value="陕西">陕西</option>
              <option value="甘肃">甘肃</option>
              <option value="青海">青海</option>
              <option value="新疆">新疆</option>
              <option value="西藏">西藏</option>
              <option value="内蒙古">内蒙古</option>
              <option value="广西">广西</option>
              <option value="宁夏">宁夏</option>
              <option value="海南">海南</option>
              <option value="贵州">贵州</option>
              <option value="云南">云南</option>
              <option value="重庆">重庆</option>
              <option value="天津">天津</option>
            </select>
          </div>

          <!-- 诉讼请求 -->
          <!-- {{ parameters.claim }} -->
          <div class="relative mb-4">
            <label class="block mb-2 text-sm font-medium text-gray-700">
              诉讼请求 <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="parameters.claim"
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-3 pt-2 pb-6 text-sm focus:outline-none focus:border-[#e23338] focus:ring-1 focus:ring-[#e23338]"
              placeholder="例如：请求获得子女抚养权"
            ></textarea>
            <div class="absolute -top-[2px] right-[5px] w-[24px] h-[24px]">
              <!-- 打开文件提取问内容组件按钮 -->
              <FileContentExtractor
                v-model="parameters.claim"
                @file-content-extracted="handleFileContentExtracted"
              />
            </div>
          </div>

          <!-- 争议金额 -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="text-sm font-medium text-gray-700">争议金额</label>
              <div class="flex items-center">
                <button
                  @click="toggleAmountInput"
                  type="button"
                  class="inline-flex relative flex-shrink-0 w-11 h-6 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-2"
                  :class="amountInputEnabled ? 'bg-[#e23338]' : 'bg-gray-200'"
                >
                  <span
                    class="inline-block w-5 h-5 bg-white rounded-full ring-0 shadow transition duration-200 ease-in-out transform pointer-events-none"
                    :class="amountInputEnabled ? 'translate-x-5' : 'translate-x-0'"
                  ></span>
                </button>
              </div>
            </div>
            <input
              v-if="amountInputEnabled"
              v-model="parameters.amount"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e23338] focus:ring-1 focus:ring-[#e23338]"
              placeholder="例如：1.456512345E7"
            />
          </div>

          <!-- 案件要素 -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">
              案件要素 <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="parameters.essentials"
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e23338] focus:ring-1 focus:ring-[#e23338]"
              placeholder="例如：原告是男,重婚或同居"
            ></textarea>
          </div>

          <!-- 排序 -->
          <!-- <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">排序方式</label>
            <select
              v-model="parameters.order"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e23338] focus:ring-1 focus:ring-[#e23338]"
            >
              <option value="desc">降序</option>
              <option value="asc">升序</option>
            </select>
          </div> -->

          <!-- 生成报告按钮 -->
          <button
            @click="generateReport"
            :disabled="isLoading || !isFormValid"
            class="w-full bg-[#e23338] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#d12329] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg
              v-if="isLoading"
              class="mr-3 -ml-1 w-5 h-5 text-white animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ isLoading ? '生成中...' : '生成胜诉评估报告' }}
          </button>

          <!-- 表单验证提示 -->
          <div
            v-if="!isFormValid && showValidationError"
            class="p-3 mt-2 bg-red-50 rounded-lg border border-red-200"
          >
            <div class="flex">
              <svg class="mt-0.5 mr-2 w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <div>
                <h4 class="text-sm font-medium text-red-800">请完善以下必填信息：</h4>
                <ul class="mt-1 text-sm list-disc list-inside text-red-700">
                  <li v-if="!parameters.caseCause.trim()">案由名称</li>
                  <li v-if="!parameters.province">省份</li>
                  <li v-if="!parameters.claim.trim()">诉讼请求</li>
                  <li v-if="!parameters.essentials.trim()">案件要素</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 报告结果展示区域 -->
      <div v-if="reportData && !reportData.error" class="mb-6 space-y-6">
        <!-- 胜诉率统计 -->
        <div class="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <h3 class="flex items-center mb-4 text-lg font-semibold text-gray-800">
            <svg class="w-5 h-5 mr-2 text-[#e23338]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            胜诉率分析
          </h3>
          <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div class="p-4 text-center bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">
                {{ reportData.queryDatas?.aggsDatas?.['W|胜诉率'] || '0%' }}
              </div>
              <div class="text-sm text-gray-600">胜诉率</div>
            </div>
            <div class="p-4 text-center bg-red-50 rounded-lg">
              <div class="text-2xl font-bold text-red-600">
                {{ reportData.queryDatas?.aggsDatas?.['L|败诉率'] || '0%' }}
              </div>
              <div class="text-sm text-gray-600">败诉率</div>
            </div>
            <div class="p-4 text-center bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">
                {{ reportData.queryDatas?.aggsDatas?.['P|部分胜诉率'] || '0%' }}
              </div>
              <div class="text-sm text-gray-600">部分胜诉率</div>
            </div>
            <div class="p-4 text-center bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-600">
                {{ reportData.queryDatas?.aggsDatas?.duration || '0' }}ms
              </div>
              <div class="text-sm text-gray-600">查询耗时</div>
            </div>
          </div>
        </div>

        <!-- 诉讼费用 -->
        <div
          v-if="reportData.fee"
          class="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
        >
          <h3 class="flex items-center mb-4 text-lg font-semibold text-gray-800">
            <svg class="w-5 h-5 mr-2 text-[#e23338]" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
              ></path>
            </svg>
            诉讼费用
          </h3>
          <div class="p-4 bg-yellow-50 rounded-lg">
            <div class="text-lg font-semibold text-yellow-800">
              {{ reportData.fee[0] }}元 - {{ reportData.fee[1] }}元
            </div>
            <div class="mt-1 text-sm text-yellow-600">预估诉讼费用范围</div>
          </div>
        </div>

        <!-- 案件统计详情 -->
        <div
          v-if="reportData.queryDatas?.aggsDatas?.fullstat"
          class="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
        >
          <h3 class="flex items-center mb-4 text-lg font-semibold text-gray-800">
            <svg class="w-5 h-5 mr-2 text-[#e23338]" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
              ></path>
            </svg>
            案件统计详情
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="px-4 py-3 font-medium text-left text-gray-700">类型</th>
                  <th class="px-4 py-3 font-medium text-center text-gray-700">合计</th>
                  <th class="px-4 py-3 font-medium text-center text-green-600">胜诉</th>
                  <th class="px-4 py-3 font-medium text-center text-red-600">败诉</th>
                  <th class="px-4 py-3 font-medium text-center text-blue-600">部分胜诉</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="stat in reportData.queryDatas?.aggsDatas?.fullstat"
                  :key="stat.reference_type"
                  class="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td class="px-4 py-3 font-medium">{{ stat.reference_type }}</td>
                  <td class="px-4 py-3 text-center">{{ stat.合计 }}</td>
                  <td class="px-4 py-3 font-semibold text-center text-green-600">
                    {{ stat['W|胜诉'] }}
                  </td>
                  <td class="px-4 py-3 font-semibold text-center text-red-600">
                    {{ stat['L|败诉'] }}
                  </td>
                  <td class="px-4 py-3 font-semibold text-center text-blue-600">
                    {{ stat['P|部分胜诉'] }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 调解时间统计 -->
        <div
          v-if="reportData.mediateTime"
          class="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
        >
          <h3 class="flex items-center mb-4 text-lg font-semibold text-gray-800">
            <svg class="w-5 h-5 mr-2 text-[#e23338]" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clip-rule="evenodd"
              ></path>
            </svg>
            调解时间统计
          </h3>
          <div class="grid grid-cols-3 gap-4">
            <div class="p-4 text-center bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">
                {{ reportData.mediateTime?.avgmediate }}天
              </div>
              <div class="text-sm text-gray-600">平均调解时间</div>
            </div>
            <div class="p-4 text-center bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">
                {{ reportData.mediateTime?.minmediate }}天
              </div>
              <div class="text-sm text-gray-600">最短调解时间</div>
            </div>
            <div class="p-4 text-center bg-orange-50 rounded-lg">
              <div class="text-2xl font-bold text-orange-600">
                {{ reportData.mediateTime?.maxmediate }}天
              </div>
              <div class="text-sm text-gray-600">最长调解时间</div>
            </div>
          </div>
        </div>

        <!-- 专业建议 -->
        <div
          v-if="reportData.adviceRelations?.rows"
          class="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
        >
          <h3 class="flex items-center mb-4 text-lg font-semibold text-gray-800">
            <svg class="w-5 h-5 mr-2 text-[#e23338]" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd"
              ></path>
            </svg>
            专业建议
          </h3>
          <div class="space-y-4">
            <div
              v-for="advice in reportData.adviceRelations?.rows"
              :key="advice.id"
              class="py-3 pl-4 rounded-r-lg border-l-4"
              :class="
                advice.winRate === 1 ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'
              "
            >
              <div class="flex items-center mb-2">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full"
                  :class="
                    advice.winRate === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  "
                >
                  {{ advice.winRate === 1 ? '胜诉较多' : '败诉较多' }}
                </span>
                <span class="ml-2 text-sm font-medium text-gray-600">{{
                  advice.casecauseName
                }}</span>
              </div>
              <p class="text-sm leading-relaxed text-gray-700">{{ advice.nameProposals }}</p>
              <div class="mt-2 text-xs text-gray-500">诉讼费用：{{ advice.fee }}</div>
            </div>
          </div>
        </div>

        <!-- 法律关系 -->
        <div
          v-if="reportData.lawRelations?.rows"
          class="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
        >
          <h3 class="flex items-center mb-4 text-lg font-semibold text-gray-800">
            <svg class="w-5 h-5 mr-2 text-[#e23338]" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clip-rule="evenodd"
              ></path>
            </svg>
            相关法律条文
          </h3>
          <!-- {{ reportData.lawRelations?.rows }} -->
          <div class="">
            <div
              v-for="law in reportData.lawRelations?.rows"
              :key="law.id"
              class="py-4 rounded-lg transition-colors"
            >
              <div class="mb-2 font-medium text-gray-800">{{ law.nameLaw }}</div>
              <div class="text-sm text-gray-600">{{ law.nameAdvice }}</div>
            </div>
          </div>
        </div>

        <!-- 争议焦点分析 -->
        <div
          v-if="reportData.queryDatas?.aggsDatas?.dispute_focus"
          class="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
        >
          <h3 class="flex items-center mb-4 text-lg font-semibold text-gray-800">
            <svg class="w-5 h-5 mr-2 text-[#e23338]" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              ></path>
            </svg>
            争议焦点分析
          </h3>
          <div class="grid grid-cols-3 gap-3 md:grid-cols-3 lg:grid-cols-4">
            <div
              v-for="(count, focus) in reportData.queryDatas?.aggsDatas?.dispute_focus"
              :key="focus"
              class="p-4 text-center bg-gray-50 rounded-lg transition-colors hover:bg-gray-100"
            >
              <div class="text-xl font-bold text-gray-800">{{ count }}</div>
              <div class="mt-1 text-xs text-gray-600">{{ focus }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div
        v-if="reportData?.error"
        class="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] text-center"
      >
        <div class="mb-2 text-red-500">
          <svg class="mx-auto w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </div>
        <p class="text-gray-600">{{ reportData.error }}</p>
      </div>

      <!-- 加载状态 -->
      <div
        v-if="isLoading"
        class="bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)] text-center"
      >
        <div class="flex justify-center items-center mb-4">
          <svg
            class="animate-spin h-8 w-8 text-[#e23338]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <p class="text-gray-600">正在生成胜诉评估报告...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTitle } from '@/composables/useTitle'
import { BigDataAssessmentService } from '@/servers/aiservisDsjsspgbg'
import FileContentExtractor from '@/components/sendMessages/FileContentExtractor.vue'

// 设置页面标题
useTitle('大数据胜诉评估报告')

// 响应式数据
const parameters = ref({
  amount: '',
  caseCause: '',
  province: '',
  claim: '',
  essentials: '',
  offset: 0,
  limit: 10,
  order: 'desc',
})

const isLoading = ref(false)
const reportData = ref<any>(null)
const amountInputEnabled = ref(false) // 争议金额输入开关
const showValidationError = ref(false) // 是否显示验证错误

// 表单验证计算属性
const isFormValid = computed(() => {
  return (
    parameters.value.caseCause.trim() !== '' &&
    parameters.value.province !== '' &&
    parameters.value.claim.trim() !== '' &&
    parameters.value.essentials.trim() !== ''
  )
})

// 创建服务实例
const bigDataService = new BigDataAssessmentService()

// 切换争议金额输入开关
const toggleAmountInput = () => {
  amountInputEnabled.value = !amountInputEnabled.value
  if (!amountInputEnabled.value) {
    // 关闭开关时清空金额
    parameters.value.amount = ''
  } else {
    // 打开开关时设置默认值
    parameters.value.amount = '1456512345'
  }
}

// 页面加载时的初始化
onMounted(async () => {
  console.log('页面已加载，等待用户生成报告')
})

// 生成报告函数
const generateReport = async () => {
  if (isLoading.value) return

  // 检查表单验证
  if (!isFormValid.value) {
    showValidationError.value = true
    return
  }

  showValidationError.value = false
  isLoading.value = true

  try {
    await bigDataService.sendAssessmentRequest(parameters.value, handleAssessmentCallback)
  } catch (error) {
    console.error('生成报告失败:', error)
    isLoading.value = false
  }
}

// 处理文件内容提取
const handleFileContentExtracted = (content: string, fileName: string) => {
  console.log(`从文件 ${fileName} 提取的内容:`, content)
  // 内容已经通过v-model自动更新到parameters.claim
  // 可以在这里添加额外的处理逻辑，比如显示提示信息
}

// 处理评估回调
const handleAssessmentCallback = async (
  content: string | any,
  isCompleted: boolean,
  error?: string,
) => {
  if (error) {
    console.error('生成报告时出现错误:', error)
    reportData.value = { error: `生成报告时出现错误：${error}` }
    isLoading.value = false
  } else if (isCompleted) {
    try {
      // 处理传入的content数据
      let parsedContent = content

      // 如果content是字符串，尝试解析为JSON
      if (typeof content === 'string') {
        try {
          parsedContent = JSON.parse(content)
        } catch (parseError) {
          console.error('解析content JSON失败:', parseError)
          reportData.value = { error: '数据格式错误，无法解析返回的内容' }
          isLoading.value = false
          return
        }
      }

      console.log('从API回调接收到的数据:', typeof parsedContent)
      reportData.value = parsedContent
    } catch (e) {
      console.error('处理回调数据失败:', e)
      reportData.value = { error: '数据处理失败，请重试' }
    }
    isLoading.value = false
  } else {
    // 如果还没完成，可以显示进度或部分数据
    console.log('接收到部分数据:', content)
  }
}
</script>

<style scoped>
/* 自定义样式 */
.loader_item {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #e23338;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
