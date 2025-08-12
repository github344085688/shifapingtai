<template>
  <div class="w-full min-h-full pb-[68px] bg-gray-50 box-border">
    <SendMessages
      :messagesLength="messages.length"
      v-model:userInput="userInput"
      @sendMessages="sendMessages"
      @newDialogue="newDialogue"
      :title="ConsultationOnLegalIssues.title"
      :placeholder="ConsultationOnLegalIssues.placeholder"
      :note="ConsultationOnLegalIssues.note"
    >
      <template #content>
        <div class="box-border px-6 mb-6 w-full">
          <div class="font-medium text-gray-600">热门问题</div>
          <div class="mt-1">
            <div
              v-for="(example, index) in examples"
              :key="index"
              class="py-2 flex justify-between items-center text-red-600 bg-white border-0 border-b-[1px] border-gray-200 transition-colors duration-200 cursor-pointer hover:bg-gray-50"
              @click="handleExampleClick(example)"
            >
              {{ example }}
              <svg
                t="1753862321982"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="4390"
                width="20"
                height="20"
              >
                <path
                  d="M593.066667 793.6a32.170667 32.170667 0 0 1 0-45.226667L829.44 512 593.066667 275.626667a32.170667 32.170667 0 0 1 0-45.226667c12.373333-12.373333 32.853333-12.373333 45.226666 0l258.986667 258.986667c12.373333 12.373333 12.373333 32.853333 0 45.226666l-258.986667 258.986667c-6.4 6.4-14.506667 9.386667-22.613333 9.386667s-16.213333-2.986667-22.613333-9.386667z"
                  p-id="4391"
                  fill="#bfbfbf"
                ></path>
                <path
                  d="M149.333333 544c-17.493333 0-32-14.506667-32-32s14.506667-32 32-32h718.08c17.493333 0 32 14.506667 32 32s-14.506667 32-32 32H149.333333z"
                  p-id="4392"
                  fill="#bfbfbf"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </template>
    </SendMessages>
    <div class="max-w-[750px] mx-auto px-2.5 bg-gray-50 box-border">
      <!-- <div
        class="flex items-center bg-gradient-to-r from-[#e23338] via-[#f04b4e] to-[#e23338] bg-cover bg-center p-[10px_15px] mt-5 rounded-t-xl"
      > -->
      <!-- <div class="w-[70px] h-[40px] relative mr-[15px]">
          <div class="absolute top-[-30px] left-0 w-[100px]">
            <img src="@img/logo.png" mode="widthFix" alt="" class="object-contain w-full h-auto" />
          </div>
        </div> -->
      <!-- <div class="text-[#ffffff] text-lg flex justify-center w-full font-bold">
          Hi~我是法研智答 助手！
        </div> -->
      <!-- </div> -->

      <!-- Intro Card -->
      <!-- <div class="bg-white rounded-b-xl p-5 mb-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        基于大量通过AI提供专业的司法解答！
        <div
          v-for="(example, index) in examples"
          :key="index"
          class="bg-[#e23338] rounded-lg p-[12px_15px] my-2.5 text-[#ffffff] cursor-pointer"
          @click="handleExampleClick(example)"
        >
          {{ example }}
        </div>
      </div> -->

      <!-- Examples Card -->
      <!-- <div class="bg-white rounded-xl p-5 mb-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        
      </div> -->

      <!-- Chat Container -->
      <div class="pb-5" ref="chatContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['my-[15px] flex', message.sender === 'user' ? 'justify-end' : 'justify-start']"
        >
          <div
            class="relative rounded-xl markdown_text"
            :class="[
              message.sender === 'user'
                ? 'bg-[#e23338] text-[#ffffff] rounded-tr-[4px] max-w-[80%]  px-[15px] markdownUser'
                : 'bg-white text-[#333] rounded-tl-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] max-w-[100%]  p-[15px_15px]',
            ]"
          >
            <div v-if="message.aiLoading" class="">ai思考中...</div>
            <!-- 思考过程显示 -->
            <div
              v-if="message.thinkingProcess"
              class="mb-4 thinking-process"
              v-html="message.thinkingProcess"
            ></div>
            <AiText :popsMessage="message" />
            <!-- 并发结果显示区域 -->
            <div class="grid grid-cols-3 gap-2 mt-4" v-if="message.sender != 'user'">
              <div
                v-for="(result, idx) in message.concurrentResults"
                :key="result.key"
                class="flex relative justify-center"
              >
                <div
                  :class="[
                    'flex items-center text-[14px] px-1.5 py-1 rounded-sm transition-colors',
                    isConcurrentButtonDisabled(message, result.key)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 cursor-pointer hover:bg-gray-200',
                  ]"
                  @click="handleConcurrentResultClick(message, result.key)"
                >
                  {{ concurrentLabels[idx]?.label || result.name }}
                  <div class="w-[20px] h-[20px] ml-1">
                    <!-- {{ result.aiLoading && index === messages.length - 1 }} -->
                    <!-- {{ index }}--{{ messages.length }} -->
                    <!-- 使用result.aiLoading来控制每个API的loading状态 -->
                    <div
                      v-if="result.aiLoading && index === messages.length - 1"
                      class="loader_item"
                    ></div>
                    <!-- 只有在最后一条消息时才显示成功和错误状态 -->
                    <template v-else-if="index === messages.length - 1">
                      <div v-if="result.isCompleted && !result.error" class="text-green-500">✓</div>
                      <div v-else-if="result.error" class="text-red-500">✗</div>
                    </template>
                    <!-- 对于非最后一条消息，保持原有状态显示 -->
                    <template v-else>
                      <div v-if="result.isCompleted && !result.error" class="text-green-500">✓</div>
                      <div v-else-if="result.error" class="text-red-500">✗</div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <!-- <SendMessages
      :messagesLength="messages.length"
      v-model:userInput="userInput"
      :isShalow="true"
      @sendMessages="sendMessages"
      @newDialogue="newDialogue"
    /> -->

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
                  <div
                    class="p-4 mb-6 bg-blue-50 rounded-r-lg"
                    v-if="!parsedModalContent || parsedModalContent.length < 1"
                  >
                    <p class="text-blue-700">没有找到相关信息！</p>
                  </div>

                  <!-- 格式化显示内容 -->
                  <div class="mb-6 space-y-4">
                    <!-- 相似案例特殊处理 -->
                    <template
                      v-if="currentModalKey === 'xsal' && Array.isArray(parsedModalContent)"
                    >
                      <div
                        v-for="(caseItem, index) in parsedModalContent"
                        :key="index"
                        class="p-4 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md"
                      >
                        <!-- 案例标题 -->
                        <div class="pb-3 mb-4 border-b border-gray-100">
                          <h4 class="mb-2 text-lg font-semibold leading-tight text-gray-800">
                            {{ caseItem.title }}
                          </h4>
                          <div class="flex flex-wrap gap-2">
                            <span class="px-2 py-1 text-blue-800 bg-blue-100 rounded-full">
                              {{ caseItem.caseid }}
                            </span>
                            <span class="px-2 py-1 text-green-800 bg-green-100 rounded-full">
                              {{ caseItem.court }}
                            </span>
                            <span class="px-2 py-1 text-purple-800 bg-purple-100 rounded-full">
                              {{ caseItem.judgedate }}
                            </span>
                            <span
                              v-if="caseItem.procedure"
                              class="px-2 py-1 text-orange-800 bg-orange-100 rounded-full"
                            >
                              {{ caseItem.procedure }}
                            </span>
                          </div>
                        </div>

                        <!-- 案例基本信息 -->
                        <div class="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                          <div class="space-y-2">
                            <div class="flex items-start">
                              <span class="flex-shrink-0 w-20 font-medium text-gray-600"
                                >案件性质:</span
                              >
                              <span class="text-gray-800">{{ caseItem.casetype || '民事' }}</span>
                            </div>
                            <div class="flex items-start">
                              <span class="flex-shrink-0 w-20 font-medium text-gray-600"
                                >案由:</span
                              >
                              <span class="text-gray-800">{{ caseItem.casecause }}</span>
                            </div>
                            <div class="flex items-start">
                              <span class="flex-shrink-0 w-20 font-medium text-gray-600"
                                >审理程序:</span
                              >
                              <span class="text-gray-800">{{ caseItem.procedure }}</span>
                            </div>
                            <div class="flex items-start">
                              <span class="flex-shrink-0 w-20 font-medium text-gray-600"
                                >判决年份:</span
                              >
                              <span class="text-gray-800">{{ caseItem.judgeyear }}</span>
                            </div>
                          </div>
                          <div class="space-y-2">
                            <div class="flex items-start">
                              <span class="flex-shrink-0 w-20 font-medium text-gray-600"
                                >审理法院:</span
                              >
                              <span class="text-gray-800">{{ caseItem.court }}</span>
                            </div>
                            <div class="flex items-start">
                              <span class="flex-shrink-0 w-20 font-medium text-gray-600"
                                >判决日期:</span
                              >
                              <span class="text-gray-800">{{ caseItem.judgedate }}</span>
                            </div>
                            <div class="flex items-start">
                              <span class="flex-shrink-0 w-20 font-medium text-gray-600"
                                >所属地区:</span
                              >
                              <span class="text-gray-800">{{ caseItem.province }}</span>
                            </div>
                            <div class="flex items-start">
                              <span class="flex-shrink-0 w-20 font-medium text-gray-600"
                                >数据来源:</span
                              >
                              <span class="text-gray-800">{{ caseItem.database }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- 适用法律条文 -->
                        <div
                          v-if="caseItem.applicablelaw && caseItem.applicablelaw.length > 0"
                          class="mb-4"
                        >
                          <h5 class="mb-2 font-medium text-gray-700">适用法律条文:</h5>
                          <div class="space-y-1">
                            <div
                              v-for="(law, lawIndex) in caseItem.applicablelaw"
                              :key="lawIndex"
                              class="p-2 pl-3 text-gray-600 bg-blue-50 rounded-r border-l-2 border-blue-200"
                            >
                              {{ law }}
                            </div>
                          </div>
                        </div>

                        <!-- 适用法律名称 -->
                        <div
                          v-if="caseItem.applicablelawonly && caseItem.applicablelawonly.length > 0"
                          class="mb-4"
                        >
                          <h5 class="mb-2 font-medium text-gray-700">涉及法律法规:</h5>
                          <div class="flex flex-wrap gap-2">
                            <span
                              v-for="(lawName, lawIndex) in caseItem.applicablelawonly"
                              :key="lawIndex"
                              class="px-2 py-1 text-xs text-indigo-800 bg-indigo-100 rounded-full"
                            >
                              {{ lawName }}
                            </span>
                          </div>
                        </div>

                        <!-- 高亮内容 -->
                        <div
                          v-if="caseItem.highlight_list && caseItem.highlight_list.length > 0"
                          class="mb-4"
                        >
                          <h5 class="mb-2 font-medium text-gray-700">关键内容片段:</h5>
                          <div class="space-y-2">
                            <div
                              v-for="(highlight, highlightIndex) in caseItem.highlight_list"
                              :key="highlightIndex"
                              class="p-3 bg-yellow-50 rounded-r-lg border-l-4 border-yellow-400"
                            >
                              <div class="leading-relaxed text-gray-700" v-html="highlight"></div>
                            </div>
                          </div>
                        </div>

                        <!-- 案例摘要信息 -->
                        <div
                          v-if="
                            caseItem.summyBycm ||
                            caseItem.summyByrw ||
                            caseItem.purpose ||
                            caseItem.chunk
                          "
                          class="mb-4"
                        >
                          <h5 class="mb-2 font-medium text-gray-700">案例摘要:</h5>
                          <div class="space-y-2">
                            <div v-if="caseItem.summyBycm" class="p-3 bg-gray-50 rounded-lg">
                              <div class="mb-1 text-xs text-gray-500">案例摘要(CM):</div>
                              <p class="leading-relaxed text-gray-700">
                                {{ caseItem.summyBycm }}
                              </p>
                            </div>
                            <div v-if="caseItem.summyByrw" class="p-3 bg-gray-50 rounded-lg">
                              <div class="mb-1 text-xs text-gray-500">案例摘要(RW):</div>
                              <p class="leading-relaxed text-gray-700">
                                {{ caseItem.summyByrw }}
                              </p>
                            </div>
                            <div v-if="caseItem.purpose" class="p-3 bg-gray-50 rounded-lg">
                              <div class="mb-1 text-xs text-gray-500">案例目的:</div>
                              <p class="leading-relaxed text-gray-700">
                                {{ caseItem.purpose }}
                              </p>
                            </div>
                            <div v-if="caseItem.chunk" class="p-3 bg-gray-50 rounded-lg">
                              <div class="mb-1 text-xs text-gray-500">案例片段:</div>
                              <p class="leading-relaxed text-gray-700">
                                {{ caseItem.chunk }}
                              </p>
                            </div>
                          </div>
                        </div>

                        <!-- 底部信息 -->
                        <div
                          class="flex justify-between items-center pt-3 border-t border-gray-100"
                        >
                          <div class="flex flex-wrap gap-2 text-xs text-gray-500">
                            <span>案件编号: {{ caseItem.uniqid }}</span>
                            <span>•</span>
                            <span>数据来源: {{ caseItem.database }}</span>
                            <span>•</span>
                            <span>判决年份: {{ caseItem.judgeyear }}</span>
                          </div>
                          <div class="text-xs text-gray-400">
                            {{ caseItem.judgeyear }}年{{ caseItem.procedure }}案例
                          </div>
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
                          <!-- <div class="flex-1">
                            <template v-if="item.url">
                              <div
                                class="flex justify-between items-center p-3 bg-gray-100 rounded-lg"
                              >
                                <div class="flex flex-1 items-center mr-3">
                                  <span class="text-gray-700 break-all line-clamp-1">{{
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
                          </div> -->

                          <!-- 相关性评分 -->
                          <div v-if="item._score" class="flex items-center mt-2 text-gray-500">
                            <svg class="mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                              ></path>
                            </svg>
                            相关性: {{ (item._score * 100).toFixed(1) }}%
                          </div>
                        </div>

                        <!-- 类型标签 -->
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
                              class="inline-flex items-center mr-4 text-blue-600 underline break-all hover:text-blue-800"
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
                            class="flex items-center text-gray-500"
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
                      </div>
                    </template>

                    <!-- 如果是字符串，直接显示 -->
                    <template v-else>
                      <div class="p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div class="leading-relaxed text-gray-700 whitespace-pre-wrap">
                          <div class="" v-html="parsedModalContent"></div>
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
            <div class="text-gray-500">数据来源：AI智能分析</div>
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
      class="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg transition-all duration-300"
    >
      复制成功！
    </div>

    <!-- 没有数据提示 -->
    <div
      v-if="showNoDataTip"
      class="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg transition-all duration-300"
    >
      没有找到相关数据
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, nextTick, onMounted } from 'vue'

import { AiText } from 'juejin-puts'
import { status } from 'juejin-state'
import aiConfig, { api, ConsultationOnLegalIssues } from '@/config/aiConfig'
import AIService from '@/servers/aiservis'
import ConcurrentAIService, { type ConcurrentResult } from '@/servers/concurrentAiService'
import router from '@/router'
import { useTitle } from '@/composables/useTitle'
import SendMessages from '@/components/sendMessages/sendMessages.vue'

const state = status()
const globalState = state.state
const CACHE_DURATION = 12 * 60 * 60 * 1000

// 使用动态title功能
const { title, updateTitle } = useTitle('法研智答')

defineComponent({
  name: 'Ai',
})

const gotopage = () => {
  alert()
  router.push({ name: 'AcrossTheEntireNetwork' })
}

// 自动滚动控制
const autoScroll = ref(true) // 默认开启自动滚动
const userScrolled = ref(false) // 用户是否手动滚动过

onMounted(() => {
  const status = {
    state: {
      state: {
        legalResearchSmartAnswer: {
          aiResults: [
            {
              content: '劳动争议诉讼请求',
              sender: 'user',
            },
            {
              content:
                '<br>劳动争议诉讼请求的提出需严格遵循法定程序和形式要件，具体分析如下<br><br><h3 style="font-size: 1.2em; font-weight: bold; margin: 16px 0 8px 0; color: #333;"></h3>一、诉讼请求的构成要件<br>1.**明确性与具体性**<br>诉讼请求须涵盖给付、确认或变更三类请求，且需具体列明请求事项及计算依据。例如，主张未签劳动合同双倍工资差额时，应明确时段（如2023年1月1日至2023年12月31日）及计算基数（如月工资标准）。<br>-**法律依据**《最高人民法院关于审理劳动争议案件适用法律问题的解释（一）》第14条强调，诉讼请求需与仲裁争议具有不可分性，否则需重新仲裁。<br>2.**仲裁前置原则**<br>诉讼请求必须以劳动争议仲裁为前置程序。未经仲裁的请求（如新增的加班费主张），法院将不予受理。<br>-**例外情形**追索劳动报酬、工伤医疗费等争议，劳动者可持工资欠条直接起诉，法院按普通民事纠纷处理。<br>3.**时效性**<br>对仲裁裁决不服的起诉期限为15日，逾期需提供不可抗力等正当事由。若争议事项未经仲裁，需在知道或应当知道权利受侵害之日起1年内申请仲裁【劳动争议调解仲裁法第5条】。<br><br><h3 style="font-size: 1.2em; font-weight: bold; margin: 16px 0 8px 0; color: #333;"></h3>二、诉讼请求的变更规则<br>1.**仲裁阶段的变更**<br>申请人在仲裁阶段可变更请求，但需在举证期限届满前提出。无正当理由拒不到庭或中途退庭的，视为撤回申请。<br>-**法律依据**《劳动争议调解仲裁法》第41条允许仲裁阶段达成和解协议后撤回申请。<br>2.**诉讼阶段的变更**<br>法院受理后，当事人新增或变更请求的，需满足以下条件<br>-**不可分性**变更请求与原争议具有不可分性（如解除劳动合同的赔偿金与未付工资一并主张），则合并审理；<br>-**独立性**若属独立争议（如新增工伤赔偿请求），需先向仲裁机构申请仲裁。<br>-**案例指引**（2022）闽04民终1294号案中，当事人二审变更请求因未经仲裁被驳回，凸显仲裁前置的强制性。<br><br><h3 style="font-size: 1.2em; font-weight: bold; margin: 16px 0 8px 0; color: #333;"></h3>三、诉讼请求的规范表述<br>1.**确认之诉**<br>明确主体及时段，例如“请求确认原告与被告于2020年1月1日至2022年12月31日期间存在劳动关系”。<br>2.**给付之诉**<br>需列明具体时段、计算方式及金额，例如“请求被告支付2023年1月1日至2023年6月30日期间未签书面劳动合同的双倍工资差额60000元（月工资10000元×6个月）”。<br>3.**变更之诉**<br>明确要求解除或变更劳动合同的具体内容，例如“请求解除原被告之间的劳动合同关系”。<br><br><h3 style="font-size: 1.2em; font-weight: bold; margin: 16px 0 8px 0; color: #333;"></h3>四、实务注意事项<br>1.**管辖法院的选择**<br>劳动争议由用人单位所在地或劳动合同履行地基层法院管辖。若双方约定管辖条款（如约定甲方所在地仲裁委），该约定因违反法定管辖规则而无效。<br>2.**证据要求**<br>诉讼请求需附事实与理由，且与证据链对应。例如，主张加班费需提供考勤记录、工资单等证据。<br>3.**集体争议处理**<br>劳动者一方10人以上且有共同请求的，可推举代表参加诉讼，简化程序。<br><br><h3 style="font-size: 1.2em; font-weight: bold; margin: 16px 0 8px 0; color: #333;"></h3>结语<br>**劳动争议诉讼请求的提出需严格遵循仲裁前置、明确具体及不可分性原则，变更请求时应结合争议性质审慎判断是否需重新仲裁。**实务中建议通过仲裁阶段充分主张权利，避免因程序瑕疵影响实体权益。',
              sender: 'assistant',
              isLoading: false,
              aiLoading: false,
              concurrentResults: [
                {
                  key: 'xsyw',
                  name: '相似疑问',
                  content:
                    '[{"type":"chunk","title":"劳动争议怎样进行诉讼","content":"起诉要件包括：原告与案件有直接利害关系，明确被告，具体诉讼请求和事实理由，案件属于法院受理范围且在受诉法院管辖内。起诉时需提交起诉状及副本，并预交案件受理费，特殊情况可申请缓交、减交、免交。当事人应依法行使诉讼权利，提供必要诉讼材料。举证指南涵盖一般举证范围、特定劳动争议举证范围（如开除、除名、辞退、追索劳动报酬、劳动保险与保护争议），以及管辖规则，劳动争议案件由用人单位或劳动合同履行地基层法院管辖，民事诉讼管辖遵循被告住所地或经常居住地原则。","url":"https://www.66law.cn/laws/276702.aspx","pubdate":"2023-03-08","_score":0.9837968926563606},{"type":"chunk","title":"劳动纠纷申请书","content":"申诉人提出劳动争议仲裁申请，请求裁决被诉人履行劳动合同约定的义务，包括但不限于支付未签订书面劳动合同的双倍工资、加班费、经济补偿金、赔偿金等，解决因工作环境、工资待遇、劳动保护等方面产生的纠纷。申诉人详细列举了具体的请求事项，旨在通过仲裁程序维护自身合法权益。","url":"https://www.lawtime.cn/info/laodong/ldzcsws/2010122989279.html","pubdate":"2020-06-17 00:00:00","_score":0.9813050763261457},{"type":"chunk","title":"劳动争议申请书","content":"在提供的法律问答信息中，主要涉及了劳动争议调解的申请程序。申请人和被申请人基于特定的争议事由，如薪资纠纷、工作条件问题或其他劳动权益争议，向劳动争议调解委员会提出调解请求。双方通过提交事实与理由，详细阐述了争议的具体情况，旨在寻求公正、合理的解决途径。此过程体现了劳动法中对于争议解决机制的重视，强调了通过调解方式和平解决劳资纠纷的重要性，以维护劳动关系的和谐稳定。","url":"https://www.lawtime.cn/info/laodong/ldzcsws/2009091532398.html","pubdate":"2020-06-17 00:00:00","_score":0.9765486096109933},{"type":"chunk","title":"劳动争议能变更诉讼请求吗","content":"在劳动争议案件的一审程序中，当事人有权申请变更诉讼请求，但变更后的请求需与已仲裁的劳动争议具有不可分性。劳动争议遵循仲裁前置原则，需先通过仲裁程序，对仲裁裁决不服时方可向法院提起诉讼。法律依据包括《中华人民共和国民事诉讼法》第五十四条和《劳动争议调解仲裁法》第五条。\\n《中华人民共和国民事诉讼法》第五十四条原告可以放弃或者变更诉讼请求。被告可以承认或者反驳诉讼请求，有权提起反诉。\\n\\n《中华人民共和国劳动争议调解仲裁法》第五条发生劳动争议，当事人不愿协商、协商不成或者达成和解协议后不履行的，可以向调解组织申请调解；不愿调解、调解不成或者达成调解协议后不履行的，可以向劳动争议仲裁委员会申请仲裁；对仲裁裁决不服的，除本法另有规定的外，可以向人民法院提起诉讼。","url":"https://www.lawtime.cn/zhishi/a3944066.html","pubdate":"2022-08-01 00:00:00","_score":0.9689560397568473},{"type":"chunk","title":"劳动争议能变更诉讼请求吗","content":"劳动争议中，当事人有权在仲裁过程中对诉讼请求进行质的变更或量的变更，包括增加、变更诉讼请求或提起反诉，但需在举证期限届满前提出。此外，当事人可自行和解并撤回仲裁申请，而无正当理由拒不到庭或中途退庭的当事人可能被视为撤回申请或接受缺席裁决。\\n《中华人民共和国劳动争议调解仲裁法》第四十一条当事人申请劳动争议仲裁后，可以自行和解。达成和解协议的，可以撤回仲裁申请。\\n《中华人民共和国劳动争议调解仲裁法》第三十六条申请人收到书面通知，无正当理由拒不到庭或者未经仲裁庭同意中途退庭的，可以视为撤回仲裁申请。\\n被申请人收到书面通知，无正当理由拒不到庭或者未经仲裁庭同意中途退庭的，可以缺席裁决。\\n","url":"https://www.lawtime.cn/zhishi/a3815372.html","pubdate":"2022-08-14 00:00:00","_score":0.9448920825644389}]',
                  isLoading: false,
                  isCompleted: true,
                  aiLoading: false,
                },
                {
                  key: 'xgft',
                  name: '相关法条',
                  content:
                    '<div style="  font-weight: bold; margin-bottom: 8px; line-height: 1.4;">最高人民法院关于审理劳动争议案件适用法律问题的解释（一）</div>《最高人民法院关于审理劳动争议案件适用法律问题的解释（一）》<br>第十四条人民法院受理劳动争议案件后，当事人增加诉讼请求的，如该诉讼请求与讼争的劳动争议具有不可分性，应当合并审理；如属独立的劳动争议，应当告知当事人向劳动争议仲裁机构申请仲裁。<div style="color: #666; font-size: 0.9em; margin-top: 8px;">发布机关：最高人民法院</div><div style="color: #666; font-size: 0.9em;">状态：现行有效</div><div style="color: #666; font-size: 0.9em;">类型：国家法律</div><div style="color: #666; font-size: 0.9em;">条文路径：第十四条</div><hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;"><div style="  font-weight: bold; margin-bottom: 8px; line-height: 1.4;">最高人民法院关于审理劳动争议案件适用法律问题的解释（一）</div>《最高人民法院关于审理劳动争议案件适用法律问题的解释（一）》<br>第十五条劳动者以用人单位的工资欠条为证据直接提起诉讼，诉讼请求不涉及劳动关系其他争议的，视为拖欠劳动报酬争议，人民法院按照普通民事纠纷受理。<div style="color: #666; font-size: 0.9em; margin-top: 8px;">发布机关：最高人民法院</div><div style="color: #666; font-size: 0.9em;">状态：现行有效</div><div style="color: #666; font-size: 0.9em;">类型：国家法律</div><div style="color: #666; font-size: 0.9em;">条文路径：第十五条</div><hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;"><div style="  font-weight: bold; margin-bottom: 8px; line-height: 1.4;">中华人民共和国劳动争议调解仲裁法</div>《中华人民共和国劳动争议调解仲裁法》<br>第七条发生劳动争议的劳动者一方在十人以上，并有共同请求的，可以推举代表参加调解、仲裁或者诉讼活动。<div style="color: #666; font-size: 0.9em; margin-top: 8px;">发布机关：全国人大常委会</div><div style="color: #666; font-size: 0.9em;">状态：现行有效</div><div style="color: #666; font-size: 0.9em;">类型：国家法律</div><div style="color: #666; font-size: 0.9em;">条文路径：第一章 总则 > 第七条</div><hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;"><div style="  font-weight: bold; margin-bottom: 8px; line-height: 1.4;">中华人民共和国劳动争议调解仲裁法</div>《中华人民共和国劳动争议调解仲裁法》<br>第五条发生劳动争议，当事人不愿协商、协商不成或者达成和解协议后不履行的，可以向调解组织申请调解；不愿调解、调解不成或者达成调解协议后不履行的，可以向劳动争议仲裁委员会申请仲裁；对仲裁裁决不服的，除本法另有规定的外，可以向人民法院提起诉讼。<div style="color: #666; font-size: 0.9em; margin-top: 8px;">发布机关：全国人大常委会</div><div style="color: #666; font-size: 0.9em;">状态：现行有效</div><div style="color: #666; font-size: 0.9em;">类型：国家法律</div><div style="color: #666; font-size: 0.9em;">条文路径：第一章总则 > 第五条</div><hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;">',
                  isLoading: false,
                  isCompleted: true,
                  aiLoading: false,
                },
                {
                  key: 'wlgd',
                  name: '网络观点',
                  content:
                    '<div style="  font-weight: bold; margin-bottom: 8px; line-height: 1.4;">提起劳动诉讼需要具备哪些条件？_广东法院网</div>根据《劳动法》和《企业劳动争议处理条例》等法律、法规的规定，当事人提起劳动纠纷应当具备以下条件：<br>(1)起诉人必须是劳动争议的一方当事人，即用人单位或劳动者。起诉是与劳动争议有直接利害关系的劳动争议当事人的权利，因此，相互形成劳动法律关系的企业、国家机关、事业单位、社会团体行政和劳动者，都可以作为起诉人提起劳动纠纷诉讼。劳动者在诉讼权利能力和诉讼行为能力相一致时，由劳动者个人作为当事人一方参加诉讼。当事人因故不能起诉的，可以委托代理人代为起诉。其他人员则无权起诉。<br>(2)必须有明确的被告。劳动争议一方当事人向人民法院提起诉讼，必须明确被诉人即对方当事人。如果原告不知道是谁侵犯了自己的合法权益，则会出现无人应诉的情况，也无法进行诉讼，人民法院也无从审理。在明确劳动争议诉讼被告的同时，应当指出，原告不得将劳动争议仲裁委员会和劳动行政部门作为劳动争议诉讼案件的被告或<br>第三人。这主要是由于他们不具有劳动争议诉讼法律关系的主体资格。<br>(3)必须有具体的诉讼请求和事实根据。具体的诉讼请求，是指原告向人民法提起诉讼所要求解决问题<br>提起劳动诉讼需要具备哪些条件？发布时间：2022-03-2223:02:20浏览次数：-次根据《劳动法》和《企业劳动争议处理条例》等法律、法规的规定，当事人提起劳动纠纷应当具备以下条件：<br>(1)起诉人必须是劳动争议的一方当事人，即用人单位或劳动者。起诉是与劳动争议有直接利害关系的劳动争议当事人的权利，因此，相互形成劳动法律关系的企业、国家机关、事业单位、社会团体行政和劳动者，都可以作为起诉人提起劳动纠纷诉讼。劳动者在诉讼权利能力和诉讼行为能力相一致时，由劳动者个人作为当事人一方参加诉讼。当事人因故不能起诉的，可以委托代理人代为起诉。其他人员则无权起诉。<br>(2)必须有明确的被告。劳动争议一方当事人向人民法院提起诉讼，必须明确被诉人即对方当事人。如果原告不知道是谁侵犯了自己的合法权益，则会出现无人应诉的情况，也无法进行诉讼，人民法院也无从审理。在明确劳动争议诉讼被告的同时，应当指出，原告不得将劳动争议仲裁委员会和劳动行政部门作为劳动争议诉讼案件的被告或<br>第三人。这主要是由于他们不具有劳动争议诉讼法律关系的主体资格。<br>(3)必须有具体的诉讼请求和事实根据。具体的诉讼请求，是指原告向人民法提起诉讼所要求解决问题<br>它包括以下三种：一是给付的请求，即请求人民法院认定原告的请求权，责令对方履行义务，如给付工资、劳动保险、资金等;二是确认的请求，即请求人民法院确认原告与被告之间存在或不存在某种实体法律关系，如确认劳动合同关系有效或无效，确认职工与企业存在的劳动关系，企业不得开除、除名、辞退等;三是变更的请求，即请求人民法院改变或消灭当事人之间原有的劳动法律关系，如改变劳动合同的内容，解除劳动合同劳动关系等。当事人提出的诉讼请求要有事实根据，包括劳动争议是如何发生的、争议的内容等，还包括劳动争议的证据事实，即能证明劳动争议案件的一切材料。当事人对自己提出的主张，有责任提供证据。<br>(4)必须经劳动争议仲裁机关仲裁。当事人一方或双方不能就劳动争议直接向人民法院提起诉讼，只有先向劳动争议仲裁机关申请仲裁后，不服仲裁裁决的，才有权起诉。如果当事人就劳动争议问题在仲裁机关的主持下，达成调解协议并已发生法效力，当事人也无权向人民法院提起诉讼。<br>(5)必须在法律规定的时效期限内提起诉讼。当事人对仲裁裁决不服的，应当自收到仲裁裁决之日起15日内，向人民法院起诉，超过期限的，一般不予受理<br><hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;"><div style="  font-weight: bold; margin-bottom: 8px; line-height: 1.4;">\n        小政讲堂-北京政法网\n    </div>农民工朋友可能知道，根据法律规定，劳动争议仲裁是劳动争议诉讼的法定前置程序，即“先裁后审”制。农民工朋友们作为劳动争议当事人，如果对仲裁裁决不服的，应在收到裁决书后十五日内向人民法院提起诉讼。及时起诉后，仲裁裁决不发生法律效力，人民法院应当对该劳动争议进行全面审理，不受已完成的仲裁的影响。向法院提起劳动争议诉讼时您需要准备以下材料<br>1、起诉状（列明原被告信息、案由、诉讼请求、事实理由），份数为被告人数+2份。例如：田某某于2017年1月24日入职某安保公司从事保安工作，月工资3300元，未签订劳动合同。后公司违法解除了劳动关系。因为公司未与其签订劳动合同，工资也是通过现金发放，田某某在仲裁阶段只提供了《工作证》、《上班考勤表》作为证据，但是上述证据未加盖公司公章，所以仲裁认定田某某没有提供足够的证据证明其与安保公司之间存在劳动关系，导致其要求公司支付的未签劳动合同双倍工资差额、违法解除劳动关系的经济赔偿金的请求事项被驳回。田某某不服该裁决，欲向人民法院起诉，他可以参考以下模板撰写起诉状：<br>2、原告的身份证明（身份证、户口本等）。<br>3、被告（公司）身份证明<br>劳动争议案件诉讼阶段起诉状的写法本站发表时间：[2019-02-15]北京法援微信公众号作者：农民工朋友可能知道，根据法律规定，劳动争议仲裁是劳动争议诉讼的法定前置程序，即“先裁后审”制。农民工朋友们作为劳动争议当事人，如果对仲裁裁决不服的，应在收到裁决书后十五日内向人民法院提起诉讼。及时起诉后，仲裁裁决不发生法律效力，人民法院应当对该劳动争议进行全面审理，不受已完成的仲裁的影响。向法院提起劳动争议诉讼时您需要准备以下材料<br>1、起诉状（列明原被告信息、案由、诉讼请求、事实理由），份数为被告人数+2份。例如：田某某于2017年1月24日入职某安保公司从事保安工作，月工资3300元，未签订劳动合同。后公司违法解除了劳动关系。因为公司未与其签订劳动合同，工资也是通过现金发放，田某某在仲裁阶段只提供了《工作证》、《上班考勤表》作为证据，但是上述证据未加盖公司公章，所以仲裁认定田某某没有提供足够的证据证明其与安保公司之间存在劳动关系，导致其要求公司支付的未签劳动合同双倍工资差额、违法解除劳动关系的经济赔偿金的请求事项被驳回<br>农民工朋友可能知道，根据法律规定，劳动争议仲裁是劳动争议诉讼的法定前置程序，即“先裁后审”制。农民工朋友们作为劳动争议当事人，如果对仲裁裁决不服的，应在收到裁决书后十五日内向人民法院提起诉讼。及时起诉后，仲裁裁决不发生法律效力，人民法院应当对该劳动争议进行全面审理，不受已完成的仲裁的影响。<br>1、起诉状（列明原被告信息、案由、诉讼请求、事实理由），份数为被告人数+2份。<br>例如：田某某于2017年1月24日入职某安保公司从事保安工作，月工资3300元，未签订劳动合同。后公司违法解除了劳动关系。因为公司未与其签订劳动合同，工资也是通过现金发放，田某某在仲裁阶段只提供了《工作证》、《上班考勤表》作为证据，但是上述证据未加盖公司公章，所以仲裁认定田某某没有提供足够的证据证明其与安保公司之间存在劳动关系，导致其要求公司支付的未签劳动合同双倍工资差额、违法解除劳动关系的经济赔偿金的请求事项被驳回。田某某不服该裁决，欲向人民法院起诉，他可以参考以下模板撰写起诉状：<br>可以在“北京市企业信用网<br><hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;"><div style="  font-weight: bold; margin-bottom: 8px; line-height: 1.4;">河北电子法院</div>【法律依据】《中华人民共和国劳动合同法》<br>第三十条、<br>第三十一条、<br>第三十六条至<br>第四十二条、<br>第四十四条、<br>第四十六条、<br>第四十七条《中华人民共和国劳动合同法实施条例》<br>第十八条、<br>第十九条、<br>第二十二条、<br>第二十七条《最高人民法院关于审理劳动争议案件适用法律问题的解释（一）》<br>第三条、<br>第十条、<br>第十一条、<br>第十二条、<br>第十四条、<br>第十五条、<br>第十八条、<br>第二十一条、<br>第二十六条至<br>第三十条、<br>第三十六条、<br>第三十七条、<br>第三十九条、<br>第四十二条、<br>第四十五条、<br>第四十八条、<br>第五十条、<br>第五十三条《中华人民共和国劳动争议调解仲裁法》<br>第二十一条、<br>第五十条《劳动和社会保障部关于确立劳动关系有关事项的通知》（劳社部发[2005]12号）【注意事项】<br>1.当事人向人民法院起诉时提出的请求，应当与原仲裁申请事项一致，超出原仲裁申请事项的请求应当与讼争劳动争议具有不可分性，否则应先向劳动争议仲裁机构申请仲裁<br><hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;"><div style="  font-weight: bold; margin-bottom: 8px; line-height: 1.4;">上海一中院</div>《最高人民法院关于审理劳动争议案件适用法律问题的解释（一）》（以下简称《劳动争议司法解释一》）第15条规定，劳动者以用人单位的工资欠条为证据直接提起诉讼，诉讼请求不涉及劳动关系其他争议的，视为拖欠劳动报酬争议，人民法院按照普通民事纠纷受理。第51条第2款亦规定，当事人在特定调解组织主持下仅就劳动报酬争议达成调解协议，用人单位不履行调解协议确定的给付义务，劳动者直接提起诉讼的，人民法院可以按照普通民事纠纷受理。值得注意的是，根据《劳动争议调解仲裁法》第47条规定，若劳动者所提请求属于追索劳动报酬、工伤医疗费、经济补偿或者赔偿金，不超过当地月最低工资标准十二个月金额的争议；或者因执行国家的劳动标准在工作时间、休息休假、社会保险等方面发生的争议，则裁决书自作出之日起发生法律效力，即“一裁终局”。对劳动者与用人单位的救济途径，大致可依是否是“一裁终局”的案件，作出区分。如是一裁终局的案件，劳动者可在收到仲裁裁决书之日起15日内向仲裁委员会所在地的基层人民法院提起诉讼，而用人单位则可在收到仲裁裁决书之日起30天内向仲裁委员会所在地的中级人民法院申请撤销仲裁裁决<br>因此，用人单位在提出相应申请时应紧紧围绕是否符合《劳动争议调解仲裁法》第49条及《劳动争议司法解释一》第24条（相较于《劳动争议调解仲裁法》第49条之规定，增加了人民法院认定执行该劳动争议仲裁裁决违背社会公共利益的情形）规定的撤销仲裁裁决情形予以充分说明并加以举证。一般而言，人民法院审理相应案件亦主要围绕核实裁决是否属于终局裁决、确定劳动者是否就该裁决向法院起诉并被受理、审查用人单位的申请理由是否符合法定撤裁理由等事项予以展开。若当事人申请理由符合该条规定的情形，则法院裁定准予其撤销仲裁裁决的申请，反之则裁定驳回申请。<br>四、劳动争议案件的诉讼请求，如何规范准确陈述？有明确的请求是劳动争议仲裁和诉讼立案受理的要件之一，在劳动争议仲裁及诉讼中提出明确、全面的权利请求，对劳动维权至关重要。由于劳动争议仲裁是劳动争议诉讼的前置程序，故诉讼请求往往是在仲裁请求的基础上提出或转化。当事人在提出诉讼请求时，要结合双方争议事项之焦点加以具体明确。在确认之诉中，要明确主体、具体时段等内容。如：请求确认××（劳动者）与××（用人单位）之间于××××年××月××日至××××年××月××日期间存在劳动关系<br>少数情况下，劳动争议案件不需要仲裁前置，如因支付拖欠劳动报酬、工伤医疗费、经济补偿或者赔偿金事项达成调解协议，用人单位在协议约定期限内不履行的，劳动者持调解协议书依法向法院申请支付令，法院裁定终结督促程序后，劳动者依据调解协议直接提起诉讼的，不需要仲裁前置。《最高人民法院关于审理劳动争议案件适用法律问题的解释（一）》（以下简称《劳动争议司法解释一》）第15条规定，劳动者以用人单位的工资欠条为证据直接提起诉讼，诉讼请求不涉及劳动关系其他争议的，视为拖欠劳动报酬争议，人民法院按照普通民事纠纷受理。第51条第2款亦规定，当事人在特定调解组织主持下仅就劳动报酬争议达成调解协议，用人单位不履行调解协议确定的给付义务，劳动者直接提起诉讼的，人民法院可以按照普通民事纠纷受理。<br>少数情况下，劳动争议案件不需要仲裁前置，如因支付拖欠劳动报酬、工伤医疗费、经济补偿或者赔偿金事项达成调解协议，用人单位在协议约定期限内不履行的，劳动者持调解协议书依法向法院申请支付令，法院裁定终结督促程序后，劳动者依据调解协议直接提起诉讼的，不需要仲裁前置。《最高人民法院关于审理劳动争议案件适用法律问题的解释（一）》（以下简称《劳动争议司法解释一》）第15条规定，劳动者以用人单位的工资欠条为证据直接提起诉讼，诉讼请求不涉及劳动关系其他争议的，视为拖欠劳动报酬争议，人民法院按照普通民事纠纷受理。第51条第2款亦规定，当事人在特定调解组织主持下仅就劳动报酬争议达成调解协议，用人单位不履行调解协议确定的给付义务，劳动者直接提起诉讼的，人民法院可以按照普通民事纠纷受理。<br>值得注意的是，根据《劳动争议调解仲裁法》第47条规定，若劳动者所提请求属于追索劳动报酬、工伤医疗费、经济补偿或者赔偿金，不超过当地月最低工资标准十二个月金额的争议；或者因执行国家的劳动标准在工作时间、休息休假、社会保险等方面发生的争议，则裁决书自作出之日起发生法律效力，即“一裁终局”。<br>有明确的请求是劳动争议仲裁和诉讼立案受理的要件之一，在劳动争议仲裁及诉讼中提出明确、全面的权利请求，对劳动维权至关重要。由于劳动争议仲裁是劳动争议诉讼的前置程序，故诉讼请求往往是在仲裁请求的基础上提出或转化。当事人在提出诉讼请求时，要结合双方争议事项之焦点加以具体明确。<br>在确认之诉中，要明确主体、具体时段等内容。<br>在确认之诉中，要明确主体、具体时段等内容。<br>在给付之诉中，要明确相关的具体时段、计算方式、计算基数等内容。<br>在给付之诉中，要明确相关的具体时段、计算方式、计算基数等内容。<br>关于事实及理由部分，陈述清楚相应内容、抓重点，简要写明发生劳动争议的事实和提起诉讼的理由。<br>关于事实及理由部分，陈述清楚相应内容、抓重点，简要写明发生劳动争议的事实和提起诉讼的理由。<br>劳动争议案件审理过程中，有当事人提出超出原来仲裁申请的诉讼请求，此种情形如何处理？就劳动争议案件而言，对当事人增加的诉讼请求是否应当合并审理，法院一方面会考虑民事诉讼法及审判实践中对合并审理的限制，另一方面会考虑劳动争议案件仲裁前置的原则规定。<br>劳动争议案件审理过程中，有当事人提出超出原来仲裁申请的诉讼请求，此种情形如何处理？<br>就劳动争议案件而言，对当事人增加的诉讼请求是否应当合并审理，法院一方面会考虑民事诉讼法及审判实践中对合并审理的限制，另一方面会考虑劳动争议案件仲裁前置的原则规定。<br>对此，《劳动争议司法解释一》第14条明确了具体处理方式：人民法院受理劳动争议案件后，当事人增加诉讼请求的，如该诉讼请求与讼争的劳动争议具有不可分性，应当合并审理；如属独立的劳动争议，应当告知当事人向劳动争议仲裁机构申请仲裁。<br>对此，《劳动争议司法解释一》第14条明确了具体处理方式：人民法院受理劳动争议案件后，当事人增加诉讼请求的，如该诉讼请求与讼争的劳动争议具有不可分性，应当合并审理；如属独立的劳动争议，应当告知当事人向劳动争议仲裁机构申请仲裁。<br>劳动争议案件的答辩要点，应围绕当事人的诉讼请求，有针对性、明确具体地进行逐一阐述。一审程序中，当事人答辩主要应围绕对方当事人所提出诉讼请求以及该诉讼请求所依据的事实和理由予以反驳、辩解。二审程序中，则应主要围绕上诉人不服一审判决事项所提出诉讼请求所依据的事实和理由加以更具针对性的反驳与辩解。<br><hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;"><div style="  font-weight: bold; margin-bottom: 8px; line-height: 1.4;">中华人民共和国劳动争议调解仲裁法-</div><br>第五条发生劳动争议，当事人不愿协商、协商不成或者达成和解协议后不履行的，可以向调解组织申请调解；不愿调解、调解不成或者达成调解协议后不履行的，可以向劳动争议仲裁委员会申请仲裁；对仲裁裁决不服的，除本法另有规定的外，可以向人民法院提起诉讼。<br>第六条发生劳动争议，当事人对自己提出的主张，有责任提供证据。与争议事项有关的证据属于用人单位掌握管理的，用人单位应当提供；用人单位不提供的，应当承担不利后果。<br>第七条发生劳动争议的劳动者一方在十人以上，并有共同请求的，可以推举代表参加调解、仲裁或者诉讼活动。<br>第八条县级以上人民政府劳动行政部门会同工会和企业方面代表建立协调劳动关系三方机制，共同研究解决劳动争议的重大问题。<br>第九条用人单位违反国家规定，拖欠或者未足额支付劳动报酬，或者拖欠工伤医疗费、经济补偿或者赔偿金的，劳动者可以向劳动行政部门投诉，劳动行政部门应当依法处理。<br>第二章调解<br>第十条发生劳动争议，当事人可以到下列调解组织申请调解：(一)企业劳动争议调解委员会；(二)依法设立的基层人民调解组织；(三)在乡镇、街道设立的具有劳动争议调解职能的组织。企业劳动争议调解委员会由职工代表和企业代表组成<br>劳动争议由劳动合同履行地或者用人单位所在地的劳动争议仲裁委员会管辖。双方当事人分别向劳动合同履行地和用人单位所在地的劳动争议仲裁委员会申请仲裁的，由劳动合同履行地的劳动争议仲裁委员会管辖。<br>劳务派遣单位或者用工单位与劳动者发生劳动争议的，劳务派遣单位和用工单位为共同当事人。<br>第二十三条与劳动争议案件的处理结果有利害关系的<br>第三人，可以申请参加仲裁活动或者由劳动争议仲裁委员会通知其参加仲裁活动。<br>第二十四条当事人可以委托代理人参加仲裁活动。委托他人参加仲裁活动，应当向劳动争议仲裁委员会提交有委托人签名或者盖章的委托书，委托书应当载明委托事项和权限。<br>第二十五条丧失或者部分丧失民事行为能力的劳动者，由其法定代理人代为参加仲裁活动；无法定代理人的，由劳动争议仲裁委员会为其指定代理人。劳动者死亡的，由其近亲属或者代理人参加仲裁活动。<br>第二十六条劳动争议仲裁公开进行，但当事人协议不公开进行或者涉及国家秘密、商业秘密和个人隐私的除外。<br>第二十七条劳动争议申请仲裁的时效期间为一年。仲裁时效期间从当事人知道或者应当知道其权利被侵害之日起计算。<br><hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;"><div style="  font-weight: bold; margin-bottom: 8px; line-height: 1.4;">最高人民法院关于审理劳动争议案件适用法律若干问题的解释（二） - 中华人民共和国最高人民法院公报</div><br>第六条劳动者因为工伤、职业病，请求用人单位依法承担给予工伤保险待遇的争议，经劳动争议仲裁委员会仲裁后，当事人依法起诉的，人民法院应予受理。<br>第八条当事人不服劳动争议仲裁委员会作出的预先支付劳动者部分工资或者医疗费用的裁决，向人民法院起诉的，人民法院不予受理。<br>第八条当事人不服劳动争议仲裁委员会作出的预先支付劳动者部分工资或者医疗费用的裁决，向人民法院起诉的，人民法院不予受理。<br>用人单位不履行上述裁决中的给付义务，劳动者依法向人民法院申请强制执行的，人民法院应予受理。<br>用人单位不履行上述裁决中的给付义务，劳动者依法向人民法院申请强制执行的，人民法院应予受理。<br>第九条劳动者与起有字号的个体工商户产生的劳动争议诉讼，人民法院应当以营业执照上登记的字号为当事人，但应同时注明该字号业主的自然情况。<br>第九条劳动者与起有字号的个体工商户产生的劳动争议诉讼，人民法院应当以营业执照上登记的字号为当事人，但应同时注明该字号业主的自然情况。<br>第十条劳动者因履行劳动力派遣合同产生劳动争议而起诉，以派遣单位为被告；争议内容涉及接受单位的，以派遣单位和接受单位为共同被告。<br>第六条劳动者因为工伤、职业病，请求用人单位依法承担给予工伤保险待遇的争议，经劳动争议仲裁委员会仲裁后，当事人依法起诉的，人民法院应予受理。<br>第七条下列纠纷不属于劳动争议：<br>（一）劳动者请求社会保险经办机构发放社会保险金的纠纷；<br>（二）劳动者与用人单位因住房制度改革产生的公有住房转让纠纷；<br>（三）劳动者对劳动能力鉴定委员会的伤残等级鉴定结论或者对职业病诊断鉴定委员会的职业病诊断鉴定结论的异议纠纷；<br>（四）家庭或者个人与家政服务人员之间的纠纷；<br>（五）个体工匠与帮工、学徒之间的纠纷；<br>（六）农村承包经营户与受雇人之间的纠纷。<br>第八条当事人不服劳动争议仲裁委员会作出的预先支付劳动者部分工资或者医疗费用的裁决，向人民法院起诉的，人民法院不予受理。用人单位不履行上述裁决中的给付义务，劳动者依法向人民法院申请强制执行的，人民法院应予受理。<br>第九条劳动者与起有字号的个体工商户产生的劳动争议诉讼，人民法院应当以营业执照上登记的字号为当事人，但应同时注明该字号业主的自然情况。<br>第十条劳动者因履行劳动力派遣合同产生劳动争议而起诉，以派遣单位为被告；争议内容涉及接受单位的，以派遣单位和接受单位为共同被告<br><hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;"><div style="  font-weight: bold; margin-bottom: 8px; line-height: 1.4;">最高人民法院关于审理劳动争议案件适用法律若干问题的解释 - 中华人民共和国最高人民法院公报</div>首页>司法解释最高人民法院关于审理劳动争议案件适用法律若干问题的解释（2001年3月22日最高人民法院审判委员会第1165次会议通过，自2001年4月30日起施行。）法释〔2001〕14号为正确审理劳动争议案件，根据《中华人民共和国劳动法》（以下简称《劳动法》）和《中华人民共和国民事诉讼法》（以下简称《民事诉讼法》）等相关法律之规定，就适用法律的若干问题，作如下解释。<br>第一条劳动者与用人单位之间发生的下列纠纷，属于《劳动法》<br>第二条规定的劳动争议，当事人不服劳动争议仲裁委员会作出的裁决，依法向人民法院起诉的，人民法院应当受理：<br>（一）劳动者与用人单位在履行劳动合同过程中发生的纠纷；<br>（二）劳动者与用人单位之间没有订立书面劳动合同，但已形成劳动关系后发生的纠纷；<br>（三）劳动者退休后，与尚未参加社会保险统筹的原用人单位因追索养老金、医疗费、工伤保险待遇和其他社会保险费而发生的纠纷<br>（2001年3月22日最高人民法院审判委员会第1165次会议通过，自2001年4月30日起施行。）<br>（2001年3月22日最高人民法院审判委员会第1165次会议通过，自2001年4月30日起施行。）<br>为正确审理劳动争议案件，根据《中华人民共和国劳动法》（以下简称《劳动法》）和《中华人民共和国民事诉讼法》（以下简称《民事诉讼法》）等相关法律之规定，就适用法律的若干问题，作如下解释。<br>为正确审理劳动争议案件，根据《中华人民共和国劳动法》（以下简称《劳动法》）和《中华人民共和国民事诉讼法》（以下简称《民事诉讼法》）等相关法律之规定，就适用法律的若干问题，作如下解释。<br>第一条劳动者与用人单位之间发生的下列纠纷，属于《劳动法》<br>第二条规定的劳动争议，当事人不服劳动争议仲裁委员会作出的裁决，依法向人民法院起诉的，人民法院应当受理：<br>第一条劳动者与用人单位之间发生的下列纠纷，属于《劳动法》<br>第二条规定的劳动争议，当事人不服劳动争议仲裁委员会作出的裁决，依法向人民法院起诉的，人民法院应当受理：<br>（二）劳动者与用人单位之间没有订立书面劳动合同，但已形成劳动关系后发生的纠纷；<br>最高人民法院关于审理劳动争议案件适用法律若干问题的解释（2001年3月22日最高人民法院审判委员会第1165次会议通过，自2001年4月30日起施行。）法释〔2001〕14号为正确审理劳动争议案件，根据《中华人民共和国劳动法》（以下简称《劳动法》）和《中华人民共和国民事诉讼法》（以下简称《民事诉讼法》）等相关法律之规定，就适用法律的若干问题，作如下解释。<br>第一条劳动者与用人单位之间发生的下列纠纷，属于《劳动法》<br>第二条规定的劳动争议，当事人不服劳动争议仲裁委员会作出的裁决，依法向人民法院起诉的，人民法院应当受理：<br>（一）劳动者与用人单位在履行劳动合同过程中发生的纠纷；<br>（二）劳动者与用人单位之间没有订立书面劳动合同，但已形成劳动关系后发生的纠纷；<br>（三）劳动者退休后，与尚未参加社会保险统筹的原用人单位因追索养老金、医疗费、工伤保险待遇和其他社会保险费而发生的纠纷<br><hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;">',
                  isLoading: false,
                  isCompleted: true,
                  aiLoading: false,
                },
                {
                  key: 'cpgdz',
                  name: '裁判观点',
                  content:
                    '[{"type":"chunk","title":"（2020）湘0105民初3622号","caseid":"（2020）湘0105民初3622号","content":"用人单位与劳动者之间的劳动争议,该劳动争议经过了劳动仲裁前置程序,劳动仲裁机关就劳动争议作出了劳动仲裁裁决,用人单位不服该劳动仲裁裁决,向法院提起劳动争议诉讼,劳动者未向法院提起诉讼,故法院的审查范围是用人单位的诉讼请求 。","_score":0.9880071674433341},{"type":"chunk","title":"（2020）津0105民初8427号","caseid":"（2020）津0105民初8427号","content":"用人单位与劳动者发生劳动争议,当事人可以依法申请调解、仲裁、提起诉讼,也可以协商解决 。 当事人对自己提出的诉讼请求所依据的事实或者反驳对方诉讼请求所依据的事实,应当提供证据加以证明,但法律另有规定的除外 。","_score":0.9842283382295335},{"type":"chunk","title":"（2016）黑0103民初6469号","caseid":"（2016）黑0103民初6469号","content":"劳动者主张其与用人单位之间存在劳动关系,要求用人单位支付工资及要求用人单位支付工资、提成奖金、失业金、养老保险的诉请,法院不予支持 。","_score":0.9769592854831004},{"type":"chunk","title":"（2021）粤01民终28207号","caseid":"（2021）粤01民终28207号","content":"劳动者主张是人身损害赔偿纠纷,但依据用人单位诉讼主张,其要求确认双方之间存在非法用工关系,因此本案属于劳动争议 。","_score":0.8801657090375017}]',
                  isLoading: false,
                  isCompleted: true,
                  aiLoading: false,
                },
                {
                  key: 'swyj',
                  name: '实务研究',
                  content:
                    '[{"type":"chunk","title":"劳动争议案件开庭，法官这样建议","url":"http://mp.weixin.qq.com/s?__biz=MjM5MjkwMDkxMA==&mid=2649455542&idx=1&sn=9f3b6d07dd724d2ee2ca6f74e6f1e5d8&chksm=be80e9f789f760e19564719ee4f181a68bed60f08b21697f23e5b2165cd1e33d4593f0ac2925#rd","content":"有明确的请求是劳动争议仲裁和诉讼立案受理的要件之一，在劳动争议仲裁及诉讼中提出明确、全面的权利请求，对劳动维权至关重要。由于劳动争议仲裁是劳动争议诉讼的前置程序，故诉讼请求往往是在仲裁请求的基础上提出或转化。当事人在提出诉讼请求时，要结合双方争议事项之焦点加以具体明确。","_score":0.971945579943629},{"type":"chunk","title":"山东高院召开“构建和谐劳动关系，助推法治营商环境”新闻发布会","url":"http://mp.weixin.qq.com/s?__biz=MzA5MDAxMjk5Ng==&mid=2652374646&idx=1&sn=cabad22f1244f345bc147777f2fe29ce&chksm=8bfe8a5dbc89034bcf65c977960353693fc7be1f9340e534fee7222692024620addbcd028f16#rd","content":"二是提升司法服务。制定劳动争议诉讼指引，引导劳动者防范法律风险、强化证据意识、合理表达诉求。积极落实判后答疑，面对面解答群众法律困惑。制作企业规范用工建议、劳动合同示范文本等，走访用工风险重点企业，指导完善规章制度、规范用工。","_score":0.9395258884808106},{"type":"chunk","title":"合同对履行地点没有约定或者约定不明确情形下如何确定管辖法院？","url":"http://mp.weixin.qq.com/s?__biz=MzA5MDAxMjk5Ng==&mid=2652375600&idx=1&sn=831dd077d40e87a305c497d2596e8688&chksm=8bfe861bbc890f0d5e535a50c686958b1bf4de4e987846c804c606e4ab1c919002fe5bfa4c24#rd","content":"法官说法诉讼请求与争议标的不是同一概念。诉讼请求是指当事人通过法院向对方当事人所主张的具体权利，即一方当事人向法院提出的，要求法院予以判决的具体请求。诉讼请求可以具有多个。","_score":0.8627528619115512},{"type":"chunk","title":"公司财务人员被骗造成公司财产损失，责任由谁承担？","url":"http://mp.weixin.qq.com/s?__biz=MzA5MDAxMjk5Ng==&mid=2652384147&idx=2&sn=86d8188c9ab76d2f58af976c089a18d8&chksm=8bfea7b8bc892eae8a105d511dbe35eb8e220d56d5b7bacdd4a9ed05a4ca9c9d5941d231e0cf#rd","content":"《中华人民共和国劳动争议调解仲裁法》第二条中华人民共和国境内的用人单位与劳动者发生的下列劳动争议，适用本法：（一）因确认劳动关系发生的争议；（二）因订立、履行、变更、解除和终止劳动合同发生的争议（三）因除名、辞退和辞职、离职发生的争议；（四）因工作时间、休息休假、社会保险、福利、培训以及劳动保护发生的争议；（五）因劳动报酬、工伤医疗费、经济补偿或赔偿金等发生的争议；《工资支付暂行规定》第十六条因劳动者本人原因给用人单位造成经济损失的，用人单位可按照劳动合同的约定要求其赔偿经济损失。","_score":0.7299558040259791}]',
                  isLoading: false,
                  isCompleted: true,
                  aiLoading: false,
                },
                {
                  key: 'xsal',
                  name: '相似案例',
                  content:
                    '{"code":666,"data":null,"msg":"java.net.SocketTimeoutException: Read timed out"}',
                  isLoading: false,
                  isCompleted: true,
                  aiLoading: false,
                },
              ],
            },
          ],
          generalAiTime: 1754906517244,
        },
        acrossTheEntireNetwork: {},
      },
    },
  }
  // localStorage.setItem('status', JSON.stringify(status))

  // 3. 页面渲染前判断缓存是否有效
  if (
    globalState.legalResearchSmartAnswer &&
    globalState.legalResearchSmartAnswer.aiResults &&
    globalState.legalResearchSmartAnswer.generalAiTime
  ) {
    const currentTime = Date.now()
    const savedTime = globalState.legalResearchSmartAnswer.generalAiTime
    const timeDifference = currentTime - savedTime
    console.log('timeDifference', timeDifference, CACHE_DURATION, timeDifference < CACHE_DURATION)

    // 如果时间差小于常量（10分钟），则使用缓存
    if (timeDifference < CACHE_DURATION) {
      messages.value = globalState.legalResearchSmartAnswer.aiResults
      // 如果有缓存的对话，更新title显示对话数量
      if (messages.value.length > 0) {
        const userMessages = messages.value.filter((msg) => msg.sender === 'user')
        updateTitle(`法研智答`)
      }
    } else {
      messages.value = []
      delete globalState.legalResearchSmartAnswer.aiResults
      delete globalState.legalResearchSmartAnswer.generalAiTime
    }
    // 如果超过10分钟，不赋值（使用默认空数组）
  }
  if (globalState.legalResearchSmartAnswer && globalState.legalResearchSmartAnswer.aiResults)
    messages.value = globalState.legalResearchSmartAnswer.aiResults

  // 监听用户滚动事件
  window.addEventListener('scroll', handleUserScroll)
  window.addEventListener('touchmove', handleUserScroll)
})

// 处理用户滚动事件
const handleUserScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // 如果用户不在底部，说明用户手动滚动了
  if (scrollTop + windowHeight < documentHeight - 50) {
    userScrolled.value = true
    autoScroll.value = false
  }
}

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

// 没有数据提示
const showNoDataTip = ref(false)

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
  delete globalState.legalResearchSmartAnswer.aiResults
  delete globalState.legalResearchSmartAnswer.generalAiTime
  // 重置title为默认值
  updateTitle('法研智答')
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
  api: ConsultationOnLegalIssues.api,
  apiKey: getApiKeyFromUrl(),
  model: ConsultationOnLegalIssues.model,
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
    thinkingProcess?: string // 新增：思考过程内容
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

  // 重新开启自动滚动
  autoScroll.value = true
  userScrolled.value = false

  // 添加用户消息
  addMessage(message, 'user')

  // 更新title显示对话数量
  // const userMessages = messages.value.filter((msg) => msg.sender === 'user')
  updateTitle(`法研智答`)

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
      globalState.legalResearchSmartAnswer.aiResults = messages.value
    }

    console.log(`API ${key} 状态更新:`, {
      key,
      isCompleted,
      aiLoading: !isCompleted,
      allResults: lastResult,
    })
  }
}

const setMessage = (
  message: string,
  isDone: boolean,
  isThinking: boolean,
  isError: boolean = false,
) => {
  const lastMessage = messages.value[messages.value.length - 1]

  // 确保最后一条消息存在且是助手消息
  if (!lastMessage || lastMessage.sender !== 'assistant') {
    return
  }

  if (isDone) {
    if (isError) {
      lastMessage.content = `${lastMessage.content}${message}`
    }
    lastMessage.aiLoading = false // AI思考完成

    // 检查并发请求是否也都完成了
    const allConcurrentCompleted =
      lastMessage.concurrentResults?.every((result) => result.isCompleted) ?? true

    if (allConcurrentCompleted) {
      lastMessage.isLoading = false // 整体加载完成
      globalState.legalResearchSmartAnswer = {}
      globalState.legalResearchSmartAnswer.aiResults = messages.value
      globalState.legalResearchSmartAnswer.generalAiTime = Date.now()
    }
    return
  }

  // 根据isThinking参数决定更新思考过程还是正常内容
  if (isThinking) {
    // 更新思考过程
    lastMessage.thinkingProcess = `${lastMessage.thinkingProcess || ''}${message}`
  } else {
    // 更新正常内容和AI思考状态
    lastMessage.aiLoading = false // 当开始输出正常内容时，思考状态结束
    lastMessage.content = `${lastMessage.content}${message}`
  }

  // 只有在自动滚动开启且用户没有手动滚动时才自动滚动
  if (autoScroll.value && !userScrolled.value) {
    scrollToBottom()
  }
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

  // 只有在自动滚动开启且用户没有手动滚动时才自动滚动
  if (autoScroll.value && !userScrolled.value) {
    scrollToBottom()
  }
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

// 检查并发结果按钮是否应该被禁用
const isConcurrentButtonDisabled = (message: any, key: string): boolean => {
  // 如果没有并发结果数据，禁用按钮
  if (!message.concurrentResults || message.concurrentResults.length === 0) {
    return true
  }

  // 查找对应key的结果
  const result = message.concurrentResults.find((item: any) => item.key === key)

  // 如果没有找到对应的结果，或者结果为空，禁用按钮
  console.log('result---------------------------', key, result)
  if (!result || !result.content) {
    return true
  }

  // 针对不同key的特定逻辑判断
  switch (key) {
    case 'xsyw': // 刑事业务
      // content 不是数组，或为空数组
      try {
        const content = JSON.parse(result.content)
        if (!Array.isArray(content) || content.length === 0) {
          return true
        }
      } catch (e) {
        // 如果不是有效的JSON，说明不是数组
        return true
      }
      break

    case 'xgft': // 相关法条
      // content 没有内容
      if (!result.content || result.content.trim() === '') {
        return true
      }
      break

    case 'wlgd': // 网络观点
      // content 没有内容，或者不是数组，或为空数组
      if (!result.content || result.content.trim() === '') {
        return true
      }
      break

    case 'swyj': // 审务意见
      // content 不是数组，或为空数组
      try {
        const content = JSON.parse(result.content)
        if (!Array.isArray(content) || content.length === 0) {
          return true
        }
      } catch (e) {
        // 如果不是有效的JSON，说明不是数组
        return true
      }
      break

    case 'xsal': // 相似案例
      // content 不是数组，或为空数组
      try {
        const content = JSON.parse(result.content)
        if (!Array.isArray(content) || content.length === 0) {
          return true
        }
      } catch (e) {
        // 如果不是有效的JSON，说明不是数组
        return true
      }
      break

    default:
      // 其他key保持原有逻辑
      break
  }

  return false
}

// 处理并发结果点击
const handleConcurrentResultClick = (message: any, key: string) => {
  if (isConcurrentButtonDisabled(message, key)) {
    // 显示没有找到相关数据的提示
    showNoDataTip.value = true
    setTimeout(() => {
      showNoDataTip.value = false
    }, 2000)
    return
  }
  const result: any = getConcurrentResult(message.aiLoading, message.concurrentResults, key)
  console.log('handleConcurrentResultClick---------------', result.content, key)
  if (!result.isCompleted) return

  // 只有当结果完成且有内容时才显示
  if (result && result.isCompleted && result.content) {
    currentModalKey.value = key
    currentModalContent.value = result.content
    currentModalTitle.value = getConcurrentLabelByKey(key)
    showModal.value = true
  } else {
    showModal.value = false
    // 显示没有找到相关数据的提示
    showNoDataTip.value = true
    setTimeout(() => {
      showNoDataTip.value = false
    }, 2000)
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
