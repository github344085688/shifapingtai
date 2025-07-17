<template>
  <div class="w-full h-full pb-[64px] bg-gray-50">
    <div class="max-w-[600px] mx-auto p-2.5 bg-gray-50">
      <div
        class="flex items-center bg-gradient-to-r from-[#e23338] via-[#f04b4e] to-[#e23338] bg-cover bg-center p-[10px_15px] mt-5 rounded-t-xl"
      >
        <!-- <div class="w-[70px] h-[40px] relative mr-[15px]">
          <div class="absolute top-[-30px] left-0 w-[100px]">
            <img src="@img/logo.png" mode="widthFix" alt="" class="object-contain w-full h-auto" />
          </div>
        </div> -->
        <div class="text-[#ffffff] text-lg flex justify-center w-full font-bold">
          Hi~我是法务助手！
        </div>
      </div>

      <!-- Intro Card -->
      <div class="bg-white rounded-b-xl p-5 mb-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        司法研讨大模型服务——快速、准确、便捷的工具，帮助用户查询和获取各类法律法规信息！
      </div>

      <!-- Examples Card -->
      <div class="bg-white rounded-xl p-5 mb-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div
          v-for="(example, index) in examples"
          :key="index"
          class="bg-[#e23338] rounded-lg p-[12px_15px] my-2.5 text-[#ffffff] cursor-pointer"
          @click="handleExampleClick(example)"
        >
          {{ example }}
        </div>
      </div>

      <!-- Chat Container -->
      <div class="mb-[70px] pb-5" ref="chatContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['my-[15px] flex', message.sender === 'user' ? 'justify-end' : 'justify-start']"
        >
          <div
            class="relative rounded-xl"
            :class="[
              message.sender === 'user'
                ? 'bg-[#e23338] text-[#ffffff] rounded-tr-[4px] max-w-[80%]  p-[5px_15px]'
                : 'bg-white text-[#333] rounded-tl-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] max-w-[100%]  p-[15px_15px]',
            ]"
          >
            <div v-if="message.aiLoading" class="">ai思考中...</div>
            <AiText :popsMessage="message" />
            <!-- 并发结果显示区域 -->
            <div class="grid grid-cols-3 gap-2 mt-4" v-if="message.sender != 'user'">
              <div
                v-for="(result, index) in message.concurrentResults"
                :key="result.key"
                class="flex relative justify-center"
              >
                <div
                  class="flex items-center text-[14px] px-1 py-1 bg-gray-100 rounded-sm transition-colors cursor-pointer hover:bg-gray-200"
                  @click="handleConcurrentResultClick(message, result.key)"
                >
                  {{ concurrentLabels[index]?.label || result.name }}
                  <div class="w-[20px] h-[20px] ml-1">
                    <!-- 使用result.aiLoading来控制每个API的loading状态 -->
                    <div v-if="result.aiLoading" class="loader_item"></div>
                    <div v-else-if="result.isCompleted && !result.error" class="text-green-500">
                      ✓
                    </div>
                    <div v-else-if="result.error" class="text-red-500">✗</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div
      class="fixed bottom-0 left-0 right-0 w-full bg-white p-2.5 flex justify-between items-center shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
    >
      <button
        v-if="messages.length > 0"
        type="button"
        class="w-[250rpx] flex items-center justify-center text-gray-500 border-none rounded-[10px] p-[10px_10px] text-sm cursor-pointer mr-2"
        @click="newDialogue()"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          class="icon"
          aria-hidden="true"
        >
          <path
            d="M2.6687 11.333V8.66699C2.6687 7.74455 2.66841 7.01205 2.71655 6.42285C2.76533 5.82612 2.86699 5.31731 3.10425 4.85156L3.25854 4.57617C3.64272 3.94975 4.19392 3.43995 4.85229 3.10449L5.02905 3.02149C5.44666 2.84233 5.90133 2.75849 6.42358 2.71582C7.01272 2.66769 7.74445 2.66797 8.66675 2.66797H9.16675C9.53393 2.66797 9.83165 2.96586 9.83179 3.33301C9.83179 3.70028 9.53402 3.99805 9.16675 3.99805H8.66675C7.7226 3.99805 7.05438 3.99834 6.53198 4.04102C6.14611 4.07254 5.87277 4.12568 5.65601 4.20313L5.45581 4.28906C5.01645 4.51293 4.64872 4.85345 4.39233 5.27149L4.28979 5.45508C4.16388 5.7022 4.08381 6.01663 4.04175 6.53125C3.99906 7.05373 3.99878 7.7226 3.99878 8.66699V11.333C3.99878 12.2774 3.99906 12.9463 4.04175 13.4688C4.08381 13.9833 4.16389 14.2978 4.28979 14.5449L4.39233 14.7285C4.64871 15.1465 5.01648 15.4871 5.45581 15.7109L5.65601 15.7969C5.87276 15.8743 6.14614 15.9265 6.53198 15.958C7.05439 16.0007 7.72256 16.002 8.66675 16.002H11.3337C12.2779 16.002 12.9461 16.0007 13.4685 15.958C13.9829 15.916 14.2976 15.8367 14.5447 15.7109L14.7292 15.6074C15.147 15.3511 15.4879 14.9841 15.7117 14.5449L15.7976 14.3447C15.8751 14.128 15.9272 13.8546 15.9587 13.4688C16.0014 12.9463 16.0017 12.2774 16.0017 11.333V10.833C16.0018 10.466 16.2997 10.1681 16.6667 10.168C17.0339 10.168 17.3316 10.4659 17.3318 10.833V11.333C17.3318 12.2555 17.3331 12.9879 17.2849 13.5771C17.2422 14.0993 17.1584 14.5541 16.9792 14.9717L16.8962 15.1484C16.5609 15.8066 16.0507 16.3571 15.4246 16.7412L15.1492 16.8955C14.6833 17.1329 14.1739 17.2354 13.5769 17.2842C12.9878 17.3323 12.256 17.332 11.3337 17.332H8.66675C7.74446 17.332 7.01271 17.3323 6.42358 17.2842C5.90135 17.2415 5.44665 17.1577 5.02905 16.9785L4.85229 16.8955C4.19396 16.5601 3.64271 16.0502 3.25854 15.4238L3.10425 15.1484C2.86697 14.6827 2.76534 14.1739 2.71655 13.5771C2.66841 12.9879 2.6687 12.2555 2.6687 11.333ZM13.4646 3.11328C14.4201 2.334 15.8288 2.38969 16.7195 3.28027L16.8865 3.46485C17.6141 4.35685 17.6143 5.64423 16.8865 6.53613L16.7195 6.7207L11.6726 11.7686C11.1373 12.3039 10.4624 12.6746 9.72827 12.8408L9.41089 12.8994L7.59351 13.1582C7.38637 13.1877 7.17701 13.1187 7.02905 12.9707C6.88112 12.8227 6.81199 12.6134 6.84155 12.4063L7.10132 10.5898L7.15991 10.2715C7.3262 9.53749 7.69692 8.86241 8.23218 8.32715L13.2791 3.28027L13.4646 3.11328ZM15.7791 4.2207C15.3753 3.81702 14.7366 3.79124 14.3035 4.14453L14.2195 4.2207L9.17261 9.26856C8.81541 9.62578 8.56774 10.0756 8.45679 10.5654L8.41772 10.7773L8.28296 11.7158L9.22241 11.582L9.43433 11.543C9.92426 11.432 10.3749 11.1844 10.7322 10.8271L15.7791 5.78027L15.8552 5.69629C16.185 5.29194 16.1852 4.708 15.8552 4.30371L15.7791 4.2207Z"
          ></path></svg
        >新对话
      </button>
      <input
        type="text"
        class="flex-1 border-none bg-[#f5f7fa] rounded-[20px] p-[12px_15px] text-sm outline-none mr-2.5 text-[#666]"
        v-model="userInput"
        placeholder="向我提出问题吧"
        @keypress.enter="sendMessages()"
      />

      <button
        type="button"
        class="bg-[#e23338] w-[250rpx] text-white border-none rounded-[20px] p-[10px_20px] text-sm cursor-pointer"
        @click="sendMessages()"
      >
        发送
      </button>
    </div>

    <!-- 并发结果弹窗 -->
    <div v-if="showModal" class="flex fixed inset-0 z-50" @click="closeModal">
      <!-- 背景遮罩 -->
      <div
        class="absolute inset-0 bg-black transition-opacity duration-300"
        :class="showModal ? 'opacity-50' : 'opacity-0'"
      ></div>

      <!-- 弹窗内容 -->
      <div
        class="flex flex-col ml-auto h-full bg-white shadow-2xl transition-all duration-300 ease-out"
        :class="showModal ? 'w-[90vw] translate-x-0' : 'w-0 translate-x-full'"
        @click.stop
      >
        <!-- 弹窗头部 -->
        <div
          class="flex justify-between items-center px-4 py-2 bg-[#e23338] from-blue-50 to-indigo-50 border-b border-gray-200"
        >
          <h2 class="text-lg font-semibold text-white">
            {{ currentModalTitle }}
          </h2>
          <button @click="closeModal" class="p-2 rounded-full transition-colors hover:bg-gray-100">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- 弹窗内容区域 -->
        <div class="overflow-hidden flex-1">
          <div class="overflow-y-auto px-2 py-6 h-full">
            <!-- 内容切换动画容器 -->
            <div class="relative">
              <transition
                name="content-fade"
                mode="out-in"
                @enter="onContentEnter"
                @leave="onContentLeave"
              >
                <div :key="currentModalKey" class="max-w-none prose">
                  <div class="p-4 mb-6 bg-blue-50 rounded-r-lg border-l-4 border-blue-500">
                    <h3 class="mb-2 font-medium text-blue-800">{{ currentModalTitle }}</h3>
                    <p class="text-sm text-blue-700">以下是相关的详细信息：</p>
                  </div>

                  <!-- 格式化显示内容 -->
                  <div class="space-y-4">
                    <!-- 相似案例特殊处理 -->
                    <template
                      v-if="currentModalKey === 'xsal' && Array.isArray(parsedModalContent)"
                    >
                      <div
                        v-for="(caseItem, index) in parsedModalContent"
                        :key="index"
                        class="p-3 bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md"
                      >
                        <!-- 案例标题 -->
                        <div class="pb-3 mb-4 border-b border-gray-100">
                          <h4 class="mb-2 text-lg font-semibold leading-tight text-gray-800">
                            {{ caseItem.title }}
                          </h4>
                          <div class="flex flex-wrap gap-2 text-sm">
                            <span class="px-2 py-1 text-blue-800 bg-blue-100 rounded-full">
                              {{ caseItem.caseid }}
                            </span>
                            <span class="px-2 py-1 text-green-800 bg-green-100 rounded-full">
                              {{ caseItem.court }}
                            </span>
                            <span class="px-2 py-1 text-purple-800 bg-purple-100 rounded-full">
                              {{ caseItem.judgedate }}
                            </span>
                          </div>
                        </div>

                        <!-- 案例基本信息 -->
                        <div class="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                          <div class="space-y-2">
                            <div class="flex items-center">
                              <span class="w-20 text-sm font-medium text-gray-600">案件性质:</span>
                              <span class="text-sm text-gray-800">{{
                                caseItem.casetype || '民事'
                              }}</span>
                            </div>
                            <div class="flex items-center">
                              <span class="w-20 text-sm font-medium text-gray-600">案由:</span>
                              <span class="text-sm text-gray-800">{{ caseItem.casecause }}</span>
                            </div>
                            <div class="flex items-center">
                              <span class="w-20 text-sm font-medium text-gray-600">审理程序:</span>
                              <span class="text-sm text-gray-800">{{ caseItem.procedure }}</span>
                            </div>
                          </div>
                          <div class="space-y-2">
                            <div class="flex items-center">
                              <span class="w-20 text-sm font-medium text-gray-600">审理法院:</span>
                              <span class="text-sm text-gray-800">{{ caseItem.court }}</span>
                            </div>
                            <div class="flex items-center">
                              <span class="w-20 text-sm font-medium text-gray-600">判决日期:</span>
                              <span class="text-sm text-gray-800">{{ caseItem.judgedate }}</span>
                            </div>
                            <div class="flex items-center">
                              <span class="w-20 text-sm font-medium text-gray-600">所属地区:</span>
                              <span class="text-sm text-gray-800">{{ caseItem.province }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- 适用法律 -->
                        <div
                          v-if="caseItem.applicablelaw && caseItem.applicablelaw.length > 0"
                          class="mb-4"
                        >
                          <h5 class="mb-2 text-sm font-medium text-gray-700">法律依据条文:</h5>
                          <div class="space-y-1">
                            <div
                              v-for="(law, lawIndex) in caseItem.applicablelaw"
                              :key="lawIndex"
                              class="pl-3 text-sm text-gray-600 border-l-2 border-blue-200"
                            >
                              {{ law }}
                            </div>
                          </div>
                        </div>

                        <!-- 高亮内容 -->
                        <div
                          v-if="caseItem.highlight_list && caseItem.highlight_list.length > 0"
                          class="mb-4"
                        >
                          <h5 class="mb-2 text-sm font-medium text-gray-700">关键内容:</h5>
                          <div class="space-y-2">
                            <div
                              v-for="(highlight, highlightIndex) in caseItem.highlight_list"
                              :key="highlightIndex"
                              class="p-3 bg-yellow-50 rounded-r-lg border-l-4 border-yellow-400"
                            >
                              <div
                                class="text-sm leading-relaxed text-gray-700"
                                v-html="highlight"
                              ></div>
                            </div>
                          </div>
                        </div>

                        <!-- 案例摘要 -->
                        <div v-if="caseItem.purpose || caseItem.chunk" class="mb-4">
                          <h5 class="mb-2 text-sm font-medium text-gray-700">案例要点:</h5>
                          <div class="p-3 bg-gray-50 rounded-lg">
                            <p class="text-sm leading-relaxed text-gray-700">
                              {{ caseItem.purpose || caseItem.chunk }}
                            </p>
                          </div>
                        </div>

                        <!-- 底部信息 -->
                        <div
                          class="flex justify-between items-center pt-3 border-t border-gray-100"
                        >
                          <div class="flex flex-wrap gap-2">
                            <span class="text-xs text-gray-500">
                              案件编号: {{ caseItem.uniqid }}
                            </span>
                            <span class="text-xs text-gray-500">
                              数据来源: {{ caseItem.database }}
                            </span>
                          </div>
                          <div class="text-xs text-gray-400">{{ caseItem.judgeyear }}年案例</div>
                        </div>
                      </div>
                    </template>

                    <!-- 原有的通用格式处理 -->
                    <template v-else-if="Array.isArray(parsedModalContent)">
                      <!-- 如果是数组，遍历显示每个项目 -->
                      <div
                        v-for="(item, index) in parsedModalContent"
                        :key="index"
                        class="p-3 bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md"
                      >
                        <!-- 标题 -->
                        <h4
                          v-if="item.title"
                          class="mb-3 text-lg font-semibold leading-tight text-gray-800 line-clamp-2"
                        >
                          {{ item.title }}
                        </h4>

                        <!-- 内容 -->
                        <div
                          v-if="item.content"
                          class="mb-4 leading-relaxed text-gray-700 whitespace-pre-wrap"
                        >
                          {{ item.content }}
                        </div>

                        <!-- URL链接和评分信息 -->
                        <div class="pt-3 border-t border-gray-100">
                          <div class="flex-1">
                            <!-- 修改后的查看原文逻辑 -->
                            <template v-if="item.url">
                              <!-- 如果是微信公众号链接，显示灰底div -->
                              <div
                                class="flex justify-between items-center p-3 bg-gray-100 rounded-lg"
                              >
                                <div class="flex flex-1 items-center mr-3">
                                  <span class="text-sm text-gray-700 break-all line-clamp-1">{{
                                    cleanUrl(item.url)
                                  }}</span>
                                </div>
                                <button
                                  @click="copyToClipboard(cleanUrl(item.url))"
                                  class="px-3 py-1 text-xs text-white bg-blue-500 rounded transition-colors hover:bg-blue-600"
                                >
                                  复制
                                </button>
                              </div>
                            </template>
                          </div>

                          <!-- 相关性评分 -->
                          <div
                            v-if="item._score"
                            class="flex items-center mt-2 text-sm text-gray-500"
                          >
                            <svg class="mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                              ></path>
                            </svg>
                            相关性: {{ (item._score * 100).toFixed(1) }}%
                          </div>
                        </div>

                        <!-- 类型标签 -->
                        <div v-if="item.type" class="mt-2">
                          <span
                            class="inline-block px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
                          >
                            {{ item.type }}
                          </span>
                        </div>
                      </div>
                    </template>

                    <!-- 如果不是数组，尝试解析为单个对象 -->
                    <template
                      v-else-if="
                        typeof parsedModalContent === 'object' && parsedModalContent !== null
                      "
                    >
                      <div class="p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <!-- 标题 -->
                        <h4
                          v-if="parsedModalContent.title"
                          class="mb-3 text-lg font-semibold leading-tight text-gray-800"
                        >
                          {{ parsedModalContent.title }}
                        </h4>

                        <!-- 内容 -->
                        <div
                          v-if="parsedModalContent.content"
                          class="mb-4 leading-relaxed text-gray-700 whitespace-pre-wrap"
                        >
                          {{ parsedModalContent.content }}
                        </div>

                        <!-- URL链接和评分信息 -->
                        <div
                          class="flex justify-between items-center pt-3 border-t border-gray-100"
                        >
                          <div class="flex-1">
                            <a
                              v-if="parsedModalContent.url"
                              :href="cleanUrl(parsedModalContent.url)"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="inline-flex items-center mr-4 text-sm text-blue-600 underline break-all hover:text-blue-800"
                            >
                              <svg
                                class="flex-shrink-0 mr-1 w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                ></path>
                              </svg>
                              查看原文
                            </a>
                          </div>

                          <!-- 相关性评分 -->
                          <div
                            v-if="parsedModalContent._score"
                            class="flex items-center text-sm text-gray-500"
                          >
                            <svg class="mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                              ></path>
                            </svg>
                            相关性: {{ (parsedModalContent._score * 100).toFixed(1) }}%
                          </div>
                        </div>

                        <!-- 类型标签 -->
                        <div v-if="parsedModalContent.type" class="mt-2">
                          <span
                            class="inline-block px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
                          >
                            {{ parsedModalContent.type }}
                          </span>
                        </div>
                      </div>
                    </template>

                    <!-- 如果是字符串，直接显示 -->
                    <template v-else>
                      <div class="p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div class="leading-relaxed text-gray-700 whitespace-pre-wrap">
                          {{ parsedModalContent }}
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- 弹窗底部操作区 -->
        <div class="p-1 bg-gray-50 border-t border-gray-200">
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-500">数据来源：AI智能分析</div>
            <button
              @click="closeModal"
              class="px-4 py-1 text-white bg-[#e23338] rounded-lg transition-colors hover:bg-[#e23338]"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 复制成功提示 -->
    <div
      v-if="showCopySuccess"
      class="fixed top-4 left-1/2 transform -translate-x-1/2 z-[70] px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg transition-all duration-300"
    >
      复制成功！
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, nextTick, onMounted } from 'vue'

import { AiText } from 'juejin-puts'
import { status } from 'juejin-state'
import aiConfig, { api } from '@/config/aiConfig'
import AIService from '@/servers/aiservis'
import ConcurrentAIService, { type ConcurrentResult } from '@/servers/concurrentAiService'

const state = status()
const globalState = state.state
const CACHE_DURATION = 12 * 60 * 60 * 1000
defineComponent({
  name: 'Ai',
})

onMounted(() => {
  // 3. 页面渲染前判断缓存是否有效
  if (globalState.aiResults && globalState.generalAiTime) {
    const currentTime = Date.now()
    const savedTime = globalState.generalAiTime
    const timeDifference = currentTime - savedTime
    console.log('timeDifference', timeDifference, CACHE_DURATION, timeDifference < CACHE_DURATION)

    // 如果时间差小于常量（10分钟），则使用缓存
    if (timeDifference < CACHE_DURATION) {
      messages.value = globalState.aiResults
    } else {
      messages.value = []
      delete globalState.aiResults
      delete globalState.generalAiTime
    }
    // 如果超过10分钟，不赋值（使用默认空数组）
  }
  if (globalState.aiResults) messages.value = globalState.aiResults
})

// 并发标签配置
const concurrentLabels = ref([
  { key: 'xsyw', label: '1.相似疑问' },
  { key: 'xgft', label: '2.相关法条' },
  { key: 'wlgd', label: '3.网络观点' },
  { key: 'cpgdz', label: '4.裁判观点' },
  { key: 'swyj', label: '5.实务研究' },
  { key: 'xsal', label: '6.相似案例' },
])

// 弹窗相关状态
const showModal = ref(false)
const currentModalKey = ref('')
const currentModalContent = ref('')
const currentModalTitle = ref('')

// URL弹窗相关状态
const showUrlModal = ref(false)
const currentUrl = ref('')

// 复制成功提示
const showCopySuccess = ref(false)

// 解析弹窗内容
const parsedModalContent = computed(() => {
  if (!currentModalContent.value) return ''

  try {
    // 尝试解析为JSON
    const parsed = JSON.parse(currentModalContent.value)
    return parsed
  } catch (error) {
    // 如果不是JSON，返回原始字符串
    return currentModalContent.value
  }
})

// 开启新对话
const newDialogue = () => {
  messages.value = []
  delete globalState.aiResults
  delete globalState.generalAiTime
}
// 判断是否为微信公众号URL
const isWeixinUrl = (url: string): boolean => {
  if (!url) return false
  return url.startsWith('http://mp.weixin.qq.com') || url.includes('https://mp.weixin.qq.com/')
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
    }, 2000)
  }
}

// 打开URL弹窗
const openUrlModal = (url: string) => {
  currentUrl.value = url
  showUrlModal.value = true
}

// 关闭URL弹窗
const closeUrlModal = () => {
  showUrlModal.value = false
  currentUrl.value = ''
}

// 清理URL，移除反引号和多余的空格
const cleanUrl = (url: string): string => {
  if (!url) return ''
  return url.replace(/`/g, '').trim()
}

// 从URL参数获取apiKey的函数
const getApiKeyFromUrl = (): string => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('apiKey') || aiConfig.apiKey
}

// 创建AIService实例时传入配置
const aiConfigs = {
  api: aiConfig.api,
  apiKey: getApiKeyFromUrl(),
  model: aiConfig.model,
}

const aiService = new AIService(aiConfigs)
// 创建ConcurrentAIService实例
const concurrentAiService = new ConcurrentAIService(getApiKeyFromUrl())

// 预设问题示例
const examples = ref(['离婚纠纷诉讼请求', '民间借贷纠纷诉讼请求', '劳动争议诉讼请求'])

// 聊天消息
const messages = ref<
  {
    content: string
    sender: 'user' | 'assistant'
    isLoading?: boolean
    aiLoading?: boolean
    concurrentResults?: ConcurrentResult[]
    selectedConcurrentResult?: string // 新增：选中的并发结果key
  }[]
>([])

const userInput = ref('')
const chatContainer = ref<HTMLElement | null>(null)

// 并发请求结果
const concurrentResults = ref<ConcurrentResult[]>([])

// 处理示例问题点击
const handleExampleClick = (question: string) => {
  userInput.value = question
  sendMessages()
}

// 发送消息
const sendMessages = async () => {
  const message = userInput.value

  if (message === '') return

  // 添加用户消息
  addMessage(message, 'user')

  const newMessage = {
    role: 'user',
    content: message,
  }

  // 添加助手消息，包含并发结果
  const assistantMessage = {
    content: '',
    sender: 'assistant' as const,
    isLoading: true, // 整体加载状态
    aiLoading: true, // AI思考状态，初始设为true
    concurrentResults: concurrentAiService.getAllResults(),
  }
  messages.value.push(assistantMessage)

  // 启动主要AI服务
  aiService.sendToAI(newMessage, setMessage)

  // 启动并发AI服务
  await concurrentAiService.sendConcurrentRequests(newMessage, handleConcurrentCallback)

  userInput.value = ''
}

// 处理并发请求的回调
const handleConcurrentCallback = (
  key: string,
  content: string,
  isCompleted: boolean,
  error?: string,
) => {
  // 更新最后一条助手消息中的并发结果
  const lastMessage = messages.value[messages.value.length - 1]
  if (lastMessage && lastMessage.sender === 'assistant') {
    // 获取最新的结果
    const lastResult = concurrentAiService.getAllResults()

    // 更新并发结果
    lastMessage.concurrentResults = lastResult

    // 针对每个API，分别处理aiLoading
    lastResult.forEach((result) => {
      // aiLoading 为未完成时 true，完成时 false
      result.aiLoading = !result.isCompleted
    })

    // 检查是否所有并发请求都完成了
    const allCompleted = lastResult.every((result) => result.isCompleted)

    // 如果所有并发请求都完成了，并且主要AI也完成了，则设置整体加载完成
    if (allCompleted && !lastMessage.aiLoading) {
      lastMessage.isLoading = false
      globalState.aiResults = messages.value
    }

    console.log(`API ${key} 状态更新:`, {
      key,
      isCompleted,
      aiLoading: !isCompleted,
      allResults: lastResult,
    })
  }
}

const setMessage = (message: string, isDone: boolean, aiLoading: boolean) => {
  const lastMessage = messages.value[messages.value.length - 1]

  // 确保最后一条消息存在且是助手消息
  if (!lastMessage || lastMessage.sender !== 'assistant') {
    return
  }

  if (isDone) {
    lastMessage.aiLoading = false // AI思考完成

    // 检查并发请求是否也都完成了
    const allConcurrentCompleted =
      lastMessage.concurrentResults?.every((result) => result.isCompleted) ?? true

    if (allConcurrentCompleted) {
      lastMessage.isLoading = false // 整体加载完成
      globalState.aiResults = messages.value
      globalState.generalAiTime = Date.now()
    }
    return
  }

  // 更新AI思考状态和内容
  lastMessage.aiLoading = aiLoading
  lastMessage.content = `${lastMessage.content}${message}`
  scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, document.body.scrollHeight)
    }
  })
}

const addMessage = (content: string, sender: 'user' | 'assistant') => {
  messages.value.push({ content, sender })
  scrollToBottom()
}

// 获取并发结果的辅助函数
const getConcurrentResult = (
  aiLoading: boolean,
  results: ConcurrentResult[] | undefined,
  key: string,
): ConcurrentResult | undefined => {
  if (!aiLoading) false
  return results?.find((result) => result.key === key)
}

// 处理并发结果点击
const handleConcurrentResultClick = (message: any, key: string) => {
  console.log('handleConcurrentResultClick', message.concurrentResults, key)
  const result = getConcurrentResult(message.aiLoading, message.concurrentResults, key)

  // 只有当结果完成且有内容时才显示
  if (result && result.isCompleted && result.content) {
    currentModalKey.value = key
    currentModalContent.value = result.content
    currentModalTitle.value = getConcurrentLabelByKey(key)
    showModal.value = true
  }
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
}

// 根据key获取标签名称
const getConcurrentLabelByKey = (key: string): string => {
  const label = concurrentLabels.value.find((item) => item.key === key)
  return label ? label.label : key
}

// 根据key获取并发结果内容
const getConcurrentContentByKey = (
  results: ConcurrentResult[] | undefined,
  key: string,
): string => {
  if (!results) return ''
  const result = results.find((item) => item.key === key)
  return result ? result.content : ''
}
</script>
<style scoped>
/* 内容切换动画 */
.content-fade-enter-active,
.content-fade-leave-active {
  transition: all 0.3s ease;
}

.content-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.content-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.content-fade-enter-to,
.content-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>

// 并发结果显示区域的模板也需要更新 // 在模板中使用 result.aiLoading 来控制每个API的loading状态
