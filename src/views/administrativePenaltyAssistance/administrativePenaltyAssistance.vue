<template>
  <div class="w-full min-h-full pb-[68px] bg-gray-50 box-border">
    <SendMessages
      :messagesLength="messages.length"
      v-model:userInput="userInput"
      @sendMessages="sendMessages"
      @newDialogue="newDialogue"
      :title="administrativePenaltyAssistance.title"
      :placeholder="administrativePenaltyAssistance.placeholder"
      :note="administrativePenaltyAssistance.note"
    >
    </SendMessages>

    <div class="box-border px-2.5 mx-auto w-full bg-gray-50">
      <div class="pb-5 w-full" ref="chatContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['my-[15px] flex ', message.sender === 'user' ? 'justify-end' : 'justify-start']"
        >
          <div
            class="relative !w-full rounded-xl markdown_text"
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
              class="mb-4 w-full thinking-process"
              v-html="message.thinkingProcess"
            ></div>
            <AiText :popsMessage="message" />

            <!-- 并发结果显示区域：卡片折叠 -->
            <div class="mt-4" v-if="message.sender != 'user' && message.concurrentResults?.length">
              <div
                v-for="(result, idx) in message.concurrentResults"
                :key="result.key"
                class="mb-2 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <button
                  type="button"
                  class="flex justify-between items-center px-3 py-2 w-full text左"
                  :class="
                    isConcurrentButtonDisabled(message, result.key)
                      ? 'cursor-not-allowed text-gray-400'
                      : 'cursor-pointer hover:bg-gray-50'
                  "
                  @click="toggleConcurrentCard(message, result.key)"
                >
                  <span>{{
                    getConcurrentLabelByKey(result.key) ||
                    concurrentLabels[idx]?.label ||
                    result.name
                  }}</span>
                  <!-- 状态标识：加载中 / 错误 / 无数据 -->
                  <!-- result.aiLoading -->
                  <span
                    v-if="result.aiLoading"
                    class="flex items-center ml-2 text-xs text-gray-500"
                  >
                    <span class="mr-1 loader_item"></span>加载中
                  </span>
                  <span v-else-if="result.error" class="ml-2 text-xs text-red-600"> 接口错误 </span>
                  <span v-else-if="isSectionNoData(result)" class="ml-2 text-xs text-gray-400">
                    暂无数据 </span
                  ><template>
                    <div class="w-full min-h-full pb-[68px] bg-gray-50 box-border">
                      <SendMessages
                        :messagesLength="messages.length"
                        v-model:userInput="userInput"
                        @sendMessages="sendMessages"
                        @newDialogue="newDialogue"
                        :title="administrativePenaltyAssistance.title"
                        :placeholder="administrativePenaltyAssistance.placeholder"
                        :note="administrativePenaltyAssistance.note"
                      >
                        <template #content>
                          <div class="box-border px-6 mb-6 w-full">
                            <div class="font-medium text-gray-600">热门问题</div>
                            <div class="mt-1">
                              <div
                                v-for="(example, index) in examples"
                                :key="index"
                                class="py-2 flex justify之间 items-center text-red-600 bg-white border-0 border-b-[1px] border-gray-200 transition-colors duration-200 cursor-pointer hover:bg-gray-50"
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

                      <div class="box-border px-2.5 mx-auto w-full bg-gray-50">
                        <div class="pb-5 w-full" ref="chatContainer">
                          <div
                            v-for="(message, index) in messages"
                            :key="index"
                            :class="[
                              'my-[15px] flex ',
                              message.sender === 'user' ? 'justify-end' : 'justify-start',
                            ]"
                          >
                            <div
                              class="relative !w-full rounded-xl markdown_text"
                              :class="[
                                message.sender === 'user'
                                  ? 'bg-[#e23338] text-[#ffffff] rounded-tr-[4px] max-w-[80%]  px-[15px] markdownUser'
                                  : 'bg白 text-[#333] rounded-tl-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] max-w-[100%]  p-[15px_15px]',
                              ]"
                            >
                              <div v-if="message.aiLoading" class="">ai思考中...</div>
                              <!-- 思考过程显示 -->
                              <div
                                v-if="message.thinkingProcess"
                                class="mb-4 w-full thinking-process"
                                v-html="message.thinkingProcess"
                              ></div>
                              <AiText :popsMessage="message" />

                              <!-- 并发结果显示区域：卡片折叠 -->
                              <div
                                class="mt-4"
                                v-if="message.sender != 'user' && message.concurrentResults?.length"
                              >
                                <div
                                  v-for="(result, idx) in message.concurrentResults"
                                  :key="result.key"
                                  class="mb-2 bg-white rounded-lg border border-gray-200 shadow-sm"
                                >
                                  <button
                                    type="button"
                                    class="flex justify-between items-center px-3 py-2 w-full text-left"
                                    :class="
                                      isConcurrentButtonDisabled(message, result.key)
                                        ? 'cursor-not-allowed text-gray-400'
                                        : 'cursor-pointer hover:bg-gray-50'
                                    "
                                    @click="toggleConcurrentCard(message, result.key)"
                                  >
                                    <span>{{
                                      getConcurrentLabelByKey(result.key) ||
                                      concurrentLabels[idx]?.label ||
                                      result.name
                                    }}</span>
                                    <!-- 状态标识：加载中 / 错误 / 无数据 -->
                                    <span
                                      v-if="result.aiLoading"
                                      class="flex items-center ml-2 text-xs text-gray-500"
                                    >
                                      <span class="mr-1 loader_item"></span>正在加载...
                                    </span>
                                    <span
                                      v-else-if="result.error"
                                      class="ml-2 text-xs text-red-600"
                                    >
                                      接口错误
                                    </span>
                                    <span
                                      v-else-if="isSectionNoData(result)"
                                      class="ml-2 text-xs text-gray-400"
                                    >
                                      暂无数据
                                    </span>
                                    <svg
                                      class="w-4 h-4 text-gray-500"
                                      viewBox="0 0 20 20"
                                      :class="
                                        message.selectedConcurrentResult === result.key
                                          ? 'transform rotate-180'
                                          : ''
                                      "
                                    >
                                      <path
                                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
                                      ></path>
                                    </svg>
                                  </button>

                                  <transition name="content-fade">
                                    <div
                                      v-if="message.selectedConcurrentResult === result.key"
                                      class="px-3 pb-3"
                                    >
                                      <!-- 展开区统一状态提示 -->
                                      <div
                                        v-if="result.aiLoading"
                                        class="flex items-center p-3 text-gray-600"
                                      >
                                        <span class="mr-2 loader_item"></span>正在加载...
                                      </div>
                                      <div v-else-if="result.error" class="p-3 text-red-600">
                                        请求失败：{{ result.error }}
                                      </div>
                                      <div
                                        v-else-if="isSectionNoData(result)"
                                        class="p-3 text-gray-500"
                                      >
                                        暂无数据
                                      </div>

                                      <!-- 内容仅在有数据且无错误时展示 -->
                                      <template v-else>
                                        <!-- 专用：相关法条（data.laws） -->
                                        <template
                                          v-if="
                                            result.key === 'xgft' &&
                                            Array.isArray(getParsedContent(result.content)?.laws)
                                          "
                                        >
                                          <div
                                            v-for="(law, lawIndex) in getParsedContent(
                                              result.content,
                                            ).laws"
                                            :key="lawIndex"
                                            class="mb-2 bg-white rounded-lg border border-gray-200"
                                          >
                                            <details>
                                              <summary
                                                class="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50"
                                              >
                                                <div class="flex-1">
                                                  <div
                                                    class="text-[15px] font-medium text-gray-800"
                                                  >
                                                    {{ law.title }}
                                                  </div>
                                                  <div class="flex flex-wrap gap-2 mt-1">
                                                    <span
                                                      v-for="(dir, dIdx) in law.directory || []"
                                                      :key="dIdx"
                                                      class="px-2 py-0.5 text-xs text蓝-800 bg蓝-100 rounded-full"
                                                      >{{ dir }}</span
                                                    >
                                                  </div>
                                                </div>
                                                <span class="ml-2 text-xs text-gray-500">{{
                                                  law.status
                                                }}</span>
                                              </summary>
                                              <div class="px-3 pb-3">
                                                <div
                                                  class="mt-2 leading-relaxed text-gray-700 whitespace-pre-wrap"
                                                >
                                                  {{ law.content }}
                                                </div>
                                                <div class="mt-2 text-xs text-gray-500">
                                                  相关性:
                                                  {{ (Number(law._score || 0) * 100).toFixed(1) }}%
                                                </div>
                                              </div>
                                            </details>
                                          </div>
                                        </template>

                                        <!-- 新增：网络观点（data.web） -->
                                        <template
                                          v-else-if="
                                            result.key === 'wlgd' &&
                                            Array.isArray(getParsedContent(result.content)?.web)
                                          "
                                        >
                                          <div
                                            v-for="(webItem, wIdx) in getParsedContent(
                                              result.content,
                                            ).web"
                                            :key="wIdx"
                                            class="mb-2 bg-white rounded-lg border border-gray-200"
                                          >
                                            <details>
                                              <summary
                                                class="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50"
                                              >
                                                <div class="flex-1">
                                                  <div
                                                    class="text-[15px] font-medium text-gray-800"
                                                  >
                                                    {{ webItem.title || '网络观点' }}
                                                  </div>
                                                  <div
                                                    class="mt-1 text-xs text-gray-600 break-all"
                                                    v-if="
                                                      globalState.environment === 'h5' &&
                                                      webItem.url
                                                    "
                                                  >
                                                    {{ cleanUrl(webItem.url) }}
                                                  </div>
                                                </div>
                                                <span
                                                  v-if="webItem.score"
                                                  class="ml-2 text-xs text-gray-500"
                                                >
                                                  相关性:
                                                  {{
                                                    (Number(webItem.score || 0) * 100).toFixed(1)
                                                  }}%
                                                </span>
                                              </summary>
                                              <div class="px-3 pb-3">
                                                <div
                                                  class="mt-2 leading-relaxed text-gray-700 whitespace-pre-wrap"
                                                >
                                                  {{ webItem.content }}
                                                </div>
                                                <div class="mt-2">
                                                  <a
                                                    v-if="
                                                      globalState.environment === 'h5' &&
                                                      webItem.url
                                                    "
                                                    :href="cleanUrl(webItem.url)"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="inline-flex items-center mr-4 text-blue-600 underline break-all hover:text-blue-800"
                                                    >查看原文</a
                                                  >
                                                </div>
                                              </div>
                                            </details>
                                          </div>
                                        </template>

                                        <!-- 专用：裁判观点（data.expertview） -->
                                        <template
                                          v-else-if="
                                            result.key === 'cpgdz' &&
                                            Array.isArray(
                                              getParsedContent(result.content)?.expertview,
                                            )
                                          "
                                        >
                                          <div
                                            v-for="(viewItem, vIdx) in getParsedContent(
                                              result.content,
                                            ).expertview"
                                            :key="vIdx"
                                            class="mb-2 bg-white rounded-lg border border-gray-200"
                                          >
                                            <details>
                                              <summary
                                                class="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50"
                                              >
                                                <div class="flex-1">
                                                  <div
                                                    class="text-[15px] font-medium text-gray-800"
                                                  >
                                                    {{ viewItem.title }}
                                                  </div>
                                                  <div class="mt-1 text-xs text-gray-600">
                                                    {{ viewItem.caseid }}
                                                  </div>
                                                </div>
                                                <span class="ml-2 text-xs text-gray-500"
                                                  >相关性:
                                                  {{
                                                    (Number(viewItem._score || 0) * 100).toFixed(1)
                                                  }}%</span
                                                >
                                              </summary>
                                              <div class="px-3 pb-3">
                                                <div
                                                  class="mt-2 leading-relaxed text-gray-700 whitespace-pre-wrap"
                                                >
                                                  {{ viewItem.content }}
                                                </div>
                                              </div>
                                            </details>
                                          </div>
                                        </template>

                                        <!-- 更新：相似案例（按内容分块折叠） -->
                                        <template
                                          v-else-if="
                                            result.key === 'xsal' &&
                                            Array.isArray(getParsedContent(result.content))
                                          "
                                        >
                                          <div
                                            v-for="(caseItem, index) in getParsedContent(
                                              result.content,
                                            )"
                                            :key="index"
                                            class="mb-2 bg-white rounded-lg border border-gray-200"
                                          >
                                            <details>
                                              <summary
                                                class="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50"
                                              >
                                                <div class="flex-1">
                                                  <div
                                                    class="text-[15px] font-medium text-gray-800"
                                                  >
                                                    {{ caseItem.title }}
                                                  </div>
                                                </div>
                                              </summary>

                                              <div class="px-3 pb-3">
                                                <div class="mb-4">
                                                  <div class="flex flex-wrap gap-2 m2-1">
                                                    <span
                                                      v-if="caseItem.caseid"
                                                      class="px-2 py-1 text-blue-800 bg-blue-100 rounded-full"
                                                      >{{ caseItem.caseid }}</span
                                                    >
                                                    <span
                                                      v-if="caseItem.court"
                                                      class="px-2 py-1 text-green-800 bg-green-100 rounded-full"
                                                      >{{ caseItem.court }}</span
                                                    >
                                                    <span
                                                      v-if="caseItem.judgedate"
                                                      class="px-2 py-1 text-purple-800 bg-purple-100 rounded-full"
                                                      >{{ caseItem.judgedate }}</span
                                                    >
                                                    <span
                                                      v-if="caseItem.procedure"
                                                      class="px-2 py-1 text-pink-800 bg-pink-100 rounded-full"
                                                      >{{ caseItem.procedure }}</span
                                                    >
                                                  </div>
                                                  <div class="flex flex-wrap gap-2">
                                                    <span
                                                      v-if="caseItem.typeofcase"
                                                      class="px-2 py-1 text-gray-800 bg-gray-100 rounded-full"
                                                      >{{ caseItem.typeofcase }}</span
                                                    >
                                                    <span
                                                      v-if="caseItem.causeofaction"
                                                      class="px-2 py-1 text-gray-800 bg-gray-100 rounded-full"
                                                      >{{ caseItem.causeofaction }}</span
                                                    >
                                                    <span
                                                      v-if="caseItem.level"
                                                      class="px-2 py-1 text-gray-800 bg-gray-100 rounded-full"
                                                      >{{ caseItem.level }}</span
                                                    >
                                                  </div>
                                                </div>

                                                <div v-if="caseItem.abstract" class="mb-3">
                                                  <details>
                                                    <summary
                                                      class="px-3 py-2 rounded cursor-pointer hover:bg-gray-50"
                                                    >
                                                      <span
                                                        class="text-[15px] font-medium text-gray-800"
                                                        >案件摘要</span
                                                      >
                                                    </summary>
                                                    <div
                                                      class="px-3 pb-2 leading-relaxed text-gray-700 whitespace-pre-wrap"
                                                    >
                                                      {{ caseItem.abstract }}
                                                    </div>
                                                  </details>
                                                </div>

                                                <div
                                                  v-if="
                                                    caseItem.applicablelaw &&
                                                    caseItem.applicablelaw.length > 0
                                                  "
                                                  class="mb-3"
                                                >
                                                  <details>
                                                    <summary
                                                      class="px-3 py-2 rounded cursor-pointer hover:bg-gray-50"
                                                    >
                                                      <span
                                                        class="text-[15px] font-medium text-gray-800"
                                                        >适用法律条文</span
                                                      >
                                                    </summary>
                                                    <div class="px-3 pb-2 space-y-1">
                                                      <div
                                                        v-for="(
                                                          law, lawIndex
                                                        ) in caseItem.applicablelaw"
                                                        :key="lawIndex"
                                                        class="p-2 pl-3 text-gray-600 bg蓝-50 rounded-r border-l-2 border蓝-200"
                                                      >
                                                        {{ law }}
                                                      </div>
                                                    </div>
                                                  </details>
                                                </div>

                                                <div
                                                  v-if="
                                                    caseItem.applicablelawonly &&
                                                    caseItem.applicablelawonly.length > 0
                                                  "
                                                  class="mb-3"
                                                >
                                                  <details>
                                                    <summary
                                                      class="px-3 py-2 rounded cursor-pointer hover:bg-gray-50"
                                                    >
                                                      <span
                                                        class="text-[15px] font-medium text-gray-800"
                                                        >涉及法律法规</span
                                                      >
                                                    </summary>
                                                    <div class="flex flex-wrap gap-2 px-3 pb-2">
                                                      <span
                                                        v-for="(
                                                          lawName, lawIndex
                                                        ) in caseItem.applicablelawonly"
                                                        :key="lawIndex"
                                                        class="px-2 py-1 text-blue-800 bg-blue-100 rounded-full"
                                                        >{{ lawName }}</span
                                                      >
                                                    </div>
                                                  </details>
                                                </div>

                                                <div
                                                  v-if="
                                                    caseItem.highlight_list &&
                                                    caseItem.highlight_list.length > 0
                                                  "
                                                  class="mb-3"
                                                >
                                                  <details>
                                                    <summary
                                                      class="px-3 py-2 rounded cursor-pointer hover:bg-gray-50"
                                                    >
                                                      <span
                                                        class="text-[15px] font-medium text-gray-800"
                                                        >高亮节选</span
                                                      >
                                                    </summary>
                                                    <div class="px-3 pb-2 space-y-2">
                                                      <div
                                                        v-for="(
                                                          hl, hIdx
                                                        ) in caseItem.highlight_list"
                                                        :key="hIdx"
                                                        class="leading-relaxed text-gray-700"
                                                      >
                                                        <span v-html="hl"></span>
                                                      </div>
                                                    </div>
                                                  </details>
                                                </div>

                                                <div
                                                  class="flex justify-between items-center pt-3 border-t border-gray-100"
                                                >
                                                  <div
                                                    class="flex flex-wrap gap-2 text-xs text-gray-500"
                                                  >
                                                    <span>案件编号: {{ caseItem.uniqid }}</span>
                                                    <span>•</span>
                                                    <span>数据来源: {{ caseItem.database }}</span>
                                                    <span v-if="caseItem.judgeyear">•</span>
                                                    <span v-if="caseItem.judgeyear"
                                                      >判决年份: {{ caseItem.judgeyear }}</span
                                                    >
                                                  </div>
                                                </div>
                                              </div>
                                            </details>
                                          </div>
                                        </template>

                                        <!-- 通用：数组/对象/字符串 -->
                                        <template
                                          v-else-if="
                                            Array.isArray(getParsedContent(result.content))
                                          "
                                        >
                                          <div
                                            v-for="(item, index) in getParsedContent(
                                              result.content,
                                            )"
                                            :key="index"
                                            class="mb-2 bg-white rounded-lg border border-gray-200"
                                          >
                                            <details>
                                              <summary
                                                class="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50"
                                              >
                                                <div class="flex-1">
                                                  <div
                                                    class="text-[15px] font-medium text-gray-800"
                                                    v-if="item.title"
                                                  >
                                                    {{ item.title }}
                                                  </div>
                                                  <div class="text-xs text-gray-600" v-else>
                                                    详细信息
                                                  </div>
                                                </div>
                                                <span
                                                  v-if="item._score"
                                                  class="ml-2 text-xs text-gray-500"
                                                >
                                                  相关性: {{ (item._score * 100).toFixed(1) }}%
                                                </span>
                                              </summary>
                                              <div class="px-3 pb-3">
                                                <div
                                                  v-if="item.content"
                                                  class="leading-relaxed text-gray-700 whitespace-pre-wrap"
                                                >
                                                  {{ item.content }}
                                                </div>
                                                <div class="mt-2">
                                                  <a
                                                    v-if="
                                                      globalState.environment === 'h5' && item.url
                                                    "
                                                    :href="cleanUrl(item.url)"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="inline-flex items-center mr-4 text-blue-600 underline break-all hover:text-blue-800"
                                                    >查看原文</a
                                                  >
                                                </div>
                                              </div>
                                            </details>
                                          </div>
                                        </template>
                                        <template
                                          v-else-if="
                                            typeof getParsedContent(result.content) === 'object' &&
                                            getParsedContent(result.content) !== null
                                          "
                                        >
                                          <div
                                            class="mb-2 bg-white rounded-lg border border-gray-200"
                                          >
                                            <details>
                                              <summary
                                                class="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50"
                                              >
                                                <div class="flex-1">
                                                  <div
                                                    class="text-[15px] font-medium text-gray-800"
                                                    v-if="getParsedContent(result.content).title"
                                                  >
                                                    {{ getParsedContent(result.content).title }}
                                                  </div>
                                                  <div class="text-xs text-gray-600" v-else>
                                                    详细信息
                                                  </div>
                                                </div>
                                                <span
                                                  v-if="getParsedContent(result.content)._score"
                                                  class="ml-2 text-xs text-gray-500"
                                                >
                                                  相关性:
                                                  {{
                                                    (
                                                      getParsedContent(result.content)._score * 100
                                                    ).toFixed(1)
                                                  }}%
                                                </span>
                                              </summary>
                                              <div class="px-3 pb-3">
                                                <div
                                                  v-if="getParsedContent(result.content).content"
                                                  class="leading-relaxed text-gray-700 whitespace-pre-wrap"
                                                >
                                                  {{ getParsedContent(result.content).content }}
                                                </div>
                                                <div class="mt-2">
                                                  <a
                                                    v-if="
                                                      globalState.environment === 'h5' &&
                                                      getParsedContent(result.content).url
                                                    "
                                                    :href="
                                                      cleanUrl(getParsedContent(result.content).url)
                                                    "
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="inline-flex items-center mr-4 text蓝-600 underline break-all hover:text蓝-800"
                                                    >查看原文</a
                                                  >
                                                </div>
                                              </div>
                                            </details>
                                          </div>
                                        </template>

                                        <template v-else>
                                          <div
                                            class="p-3 bg白 rounded-lg border border-gray-200 shadow-sm"
                                          >
                                            <div
                                              class="leading-relaxed text-gray-700 whitespace-pre-wrap"
                                            >
                                              <div v-html="getParsedContent(result.content)"></div>
                                            </div>
                                          </div>
                                        </template>
                                      </template>
                                    </div>
                                  </transition>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>

                  <svg
                    class="w-4 h-4 text-gray-500"
                    viewBox="0 0 20 20"
                    :class="
                      message.selectedConcurrentResult === result.key ? 'transform rotate-180' : ''
                    "
                  >
                    <path
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
                    ></path>
                  </svg>
                </button>

                <transition name="content-fade">
                  <div v-if="message.selectedConcurrentResult === result.key" class="px-3 pb-3">
                    <!-- 展开区统一状态提示 -->
                    <!-- ! -->
                    <div v-if="result.aiLoading" class="flex items-center p-3 text-gray-600">
                      <span class="mr-2 loader_item"></span>正在加载...
                    </div>
                    <div v-else-if="result.error" class="p-3 text-red-600">
                      请求失败：{{ result.error }}
                    </div>
                    <div v-else-if="isSectionNoData(result)" class="p-3 text-gray-500">
                      暂无数据
                    </div>

                    <!-- 内容仅在有数据且无错误时展示 -->

                    <template v-else>
                      <!-- 专用：相关法条（data.laws） -->
                      <!-- involvedDepartments -->
                      <template v-if="result.key === 'involvedDepartments'">
                        <div
                          v-for="(dept, idx) in getParsedContent(result.content)"
                          :key="idx"
                          class="mb-2 bg白 rounded-lg border border-gray-200"
                        >
                          <details>
                            <summary
                              class="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50"
                            >
                              <div class="flex-1">
                                <div class="font-bold text-gray-800">
                                  {{ dept.name || '未命名部门' }}
                                </div>
                              </div>
                              <!-- 可选：若有状态字段则显示 -->
                              <span v-if="dept.status" class="ml-2 text-xs text-gray-500">{{
                                dept.status
                              }}</span>
                            </summary>
                            <div class="px-3 pb-3">
                              <div class="mt-2 leading-relaxed text-gray-700 whitespace-pre-wrap">
                                <span class="font-semibold">部门简介：</span>{{ dept.introduction }}
                              </div>
                              <div class="mt-2 leading-relaxed text-gray-700 whitespace-pre-wrap">
                                <span class="font-semibold">主要职责：</span>{{ dept.function }}
                              </div>
                              <div class="mt-2 leading-relaxed text-gray-700 whitespace-pre-wrap">
                                <span class="font-semibold">管辖范围：</span>{{ dept.jurisdiction }}
                              </div>
                              <div class="mt-2 leading-relaxed text-gray-700 whitespace-pre-wrap">
                                <span class="font-semibold">监督处理程序：</span
                                >{{ dept.procedure }}
                              </div>
                              <div
                                v-if="dept._score !== undefined"
                                class="mt-2 text-xs text-gray-500"
                              >
                                相关性: {{ (Number(dept._score || 0) * 100).toFixed(1) }}%
                              </div>
                            </div>
                          </details>
                        </div>
                      </template>

                      <!-- 新增：网络观点（data.web） -->
                      <!-- xgft -->
                      <template v-else-if="result.key === 'xgft'">
                        <div class="w-full" v-html="result.content"></div>
                      </template>

                      <!-- 专用：裁判观点（data.expertview） -->
                      <!-- xsalgnfx -->
                      <template
                        v-else-if="
                          result.key === 'xsalgnfx' &&
                          Array.isArray(getParsedContent(result.content)?.expertview)
                        "
                      >
                        <div
                          v-for="(viewItem, vIdx) in getParsedContent(result.content).expertview"
                          :key="vIdx"
                          class="mb-2 bg白 rounded-lg border border-gray-200"
                        >
                          <details>
                            <summary
                              class="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50"
                            >
                              <div class="flex-1">
                                <div class="text-[15px] font-medium text-gray-800">
                                  {{ viewItem.title }}
                                </div>
                                <div class="mt-1 text-xs text-gray-600">{{ viewItem.caseid }}</div>
                              </div>
                              <span class="ml-2 text-xs text-gray-500"
                                >相关性:
                                {{ (Number(viewItem._score || 0) * 100).toFixed(1) }}%</span
                              >
                            </summary>
                            <div class="px-3 pb-3">
                              <div class="mt-2 leading-relaxed text-gray-700 whitespace-pre-wrap">
                                {{ viewItem.content }}
                              </div>
                            </div>
                          </details>
                        </div>
                      </template>

                      <!-- 更新：相似案例（按内容分块折叠） -->

                      <!-- 通用：数组/对象/字符串 -->
                    </template>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineComponent, nextTick, onMounted } from 'vue'
import { AiText } from 'juejin-puts'
import { status } from 'juejin-state'
import aiConfig, { administrativePenaltyAssistance, CACHE_DURATION } from '@/config/aiConfig'
import AIService from '@/servers/aiservis'
import ConcurrentAIService, { type ConcurrentResult } from '@/servers/concurrentAiService'
import router from '@/router'
import { useTitle } from '@/composables/useTitle'
import SendMessages from '@/components/sendMessages/sendMessages.vue'

const state = status()
const globalState = state.state

const { title, updateTitle } = useTitle('行政处罚辅助')

defineComponent({ name: 'Ai' })

const gotopage = () => {
  alert()
  router.push({ name: 'AcrossTheEntireNetwork' })
}

const autoScroll = ref(true)
const userScrolled = ref(false)

onMounted(() => {
  if (
    globalState.administrativePenaltyAssistance &&
    globalState.administrativePenaltyAssistance.aiResults &&
    globalState.administrativePenaltyAssistance.generalAiTime
  ) {
    const currentTime = Date.now()
    const savedTime = globalState.administrativePenaltyAssistance.generalAiTime
    const timeDifference = currentTime - savedTime

    if (timeDifference < CACHE_DURATION) {
      messages.value = globalState.administrativePenaltyAssistance.aiResults
      if (messages.value.length > 0) updateTitle(`行政处罚辅助`)
    } else {
      messages.value = []
      delete globalState.administrativePenaltyAssistance.aiResults
      delete globalState.administrativePenaltyAssistance.generalAiTime
    }
  }
  if (
    globalState.administrativePenaltyAssistance &&
    globalState.administrativePenaltyAssistance.aiResults
  )
    messages.value = globalState.administrativePenaltyAssistance.aiResults

  window.addEventListener('scroll', handleUserScroll)
  window.addEventListener('touchmove', handleUserScroll)
})

const handleUserScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  if (scrollTop + windowHeight < documentHeight - 50) {
    userScrolled.value = true
    autoScroll.value = false
  }
}

const concurrentLabels = ref([
  { key: 'involvedDepartments', label: '相关事件涉及部门' },
  { key: 'xgft', label: '相关问题涉及到的法律法规' },
  { key: 'xsalgnfx', label: '相似案例' },
])

// 复制成功提示/无数据提示
const showCopySuccess = ref(false)
const showNoDataTip = ref(false)

const isWeixinUrl = (url: string): boolean => {
  if (!url) return false
  return url.startsWith('http://mp.weixin.qq.com') || url.includes('https://mp.weixin.qq.com/')
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showCopySuccess.value = true
    setTimeout(() => (showCopySuccess.value = false), 2000)
  } catch {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    showCopySuccess.value = true
    setTimeout(() => (showCopySuccess.value = false), 2000)
  }
}

const cleanUrl = (url: string): string => (url ? url.replace(/`/g, '').trim() : '')

const getApiKeyFromUrl = (): string => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('apiKey') || aiConfig.apiKey
}

const aiConfigs = {
  api: administrativePenaltyAssistance.api,
  apiKey: getApiKeyFromUrl(),
  model: administrativePenaltyAssistance.model,
  isTimer: true,
}
const aiService = new AIService(aiConfigs)
const concurrentAiService = new ConcurrentAIService(getApiKeyFromUrl())

const examples = ref([])

const messages = ref<
  {
    content: string
    sender: 'user' | 'assistant'
    isLoading?: boolean
    aiLoading?: boolean
    concurrentResults?: ConcurrentResult[]
    selectedConcurrentResult?: string
    thinkingProcess?: string
  }[]
>([])

const userInput = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const concurrentResults = ref<ConcurrentResult[]>([])

const handleExampleClick = (question: string) => {
  userInput.value = question
  sendMessages()
}

const sendMessages = async () => {
  const message = userInput.value
  if (!message) return

  autoScroll.value = true
  userScrolled.value = false

  addMessage(message, 'user')
  updateTitle(`行政处罚辅助`)

  const newMessage = { role: 'user', content: message }

  const assistantMessage = {
    content: '',
    sender: 'assistant' as const,
    isLoading: true,
    aiLoading: true,
    concurrentResults: concurrentAiService.getAllResults(),
  }
  messages.value.push(assistantMessage)

  aiService.sendToAI(newMessage, setMessage)
  await concurrentAiService.sendConcurrentRequests(
    newMessage,
    handleConcurrentCallback,
    concurrentLabels.value,
  )

  userInput.value = ''
}

// const handleConcurrentCallback = (
//   key: string,
//   content: string,
//   isCompleted: boolean,
//   error?: string,
// ) => {
//   const lastMessage = messages.value[messages.value.length - 1]
//   if (lastMessage && lastMessage.sender === 'assistant') {
//     const lastResult = concurrentAiService.getAllResults()
//     lastMessage.concurrentResults = lastResult
//     lastResult.forEach((result) => (result.aiLoading = !result.isCompleted))
//     const allCompleted = lastResult.every((result) => result.isCompleted)
//     if (allCompleted && !lastMessage.aiLoading) {
//       lastMessage.isLoading = false
//       globalState.administrativePenaltyAssistance.aiResults = messages.value
//     }
//   }
// }
const handleConcurrentCallback = (
  key: string,
  content: string,
  isCompleted: boolean,
  error?: string,
) => {
  const currentMessages = messages.value
  const lastIndex = currentMessages.length - 1
  const lastMessage = currentMessages[lastIndex]

  // 仅处理最后一条且是 assistant 的消息
  if (!lastMessage || lastMessage.sender !== 'assistant') return

  // 从服务获取结果，但做不可变克隆与更新
  const serviceResults = concurrentAiService.getAllResults()
  const updatedResults = serviceResults.map((r: any) => {
    console.log('handleConcurrentCallback', r, r.key)
    if (r.key === 'involvedDepartments') {
      const contentData = r.content.replace(/\r?\n/g, '\\n')
      r.content = contentData
    }
    if (r.key === key) {
      return {
        ...r,
        // content: content ?? r.content,
        isCompleted: isCompleted ?? r.isCompleted,
        error: error ?? r.error,
        aiLoading: !(isCompleted ?? r.isCompleted),
      }
    }
    return {
      ...r,
      aiLoading: !r.isCompleted,
    }
  })

  const allCompleted = updatedResults.every((r: any) => r.isCompleted)

  // 只更新最后一条消息的内容与状态（不可变替换）
  const updatedLastMessage = {
    ...lastMessage,
    concurrentResults: updatedResults,
    isLoading: !allCompleted,
    aiLoading: !allCompleted,
  }

  // 不改变原有数据结构，只替换最后一条
  messages.value = [...currentMessages.slice(0, lastIndex), updatedLastMessage]

  // 全部完成后再写入全局结果
  if (allCompleted) {
    globalState.legalResearchSmartAnswer.aiResults = messages.value
  }
}

const setMessage = (
  message: string,
  isDone: boolean,
  isThinking: boolean,
  isError: boolean = false,
) => {
  const lastMessage = messages.value[messages.value.length - 1]
  if (!lastMessage || lastMessage.sender !== 'assistant') return

  if (isDone) {
    if (isError) lastMessage.content = `${lastMessage.content}${message}`
    lastMessage.aiLoading = false
    const allConcurrentCompleted =
      lastMessage.concurrentResults?.every((result) => result.isCompleted) ?? true
    if (allConcurrentCompleted) {
      lastMessage.isLoading = false
      globalState.administrativePenaltyAssistance = {}
      globalState.administrativePenaltyAssistance.aiResults = messages.value
      globalState.administrativePenaltyAssistance.generalAiTime = Date.now()
    }
    return
  }

  if (isThinking) {
    lastMessage.thinkingProcess = `${lastMessage.thinkingProcess || ''}${message}`
  } else {
    lastMessage.aiLoading = false
    lastMessage.content = `${lastMessage.content}${message}`
  }

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
  if (autoScroll.value && !userScrolled.value) {
    scrollToBottom()
  }
}

const getConcurrentResult = (
  aiLoading: boolean,
  results: ConcurrentResult[] | undefined,
  key: string,
): ConcurrentResult | undefined => {
  if (!aiLoading) false
  return results?.find((result) => result.key === key)
}

const isConcurrentButtonDisabled = (message: any, key: string): boolean => {
  if (!message.concurrentResults || message.concurrentResults.length === 0) return true
  const result = message.concurrentResults.find((item: any) => item.key === key)
  if (!result || !result.content) return true

  switch (key) {
    case 'involvedDepartments':
    case 'xgft':
    case 'xsalgnfx':
      if (!result.content || result.content.trim() === '') return true
      break
    default:
      break
  }
  return false
}

// 新增：解析包含加粗标题的 HTML 为分段数组
const htmlToText = (s: string): string => {
  return s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<hr[^>]*>/gi, '\n----------------\n')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const parseHtmlSections = (html: string): Array<{ title: string; content: string }> => {
  if (!html) return []
  const normalized = String(html)
  const titleRegex = /<div[^>]*style="[^"]*font-weight:\s*bold[^"]*"[^>]*>([\s\S]*?)<\/div>/gi

  const sections: Array<{ title: string; contentStart: number }> = []
  let match: RegExpExecArray | null
  titleRegex.lastIndex = 0

  while ((match = titleRegex.exec(normalized)) !== null) {
    const rawTitle = match[1]
    const title = htmlToText(rawTitle)
    const contentStart = titleRegex.lastIndex
    sections.push({ title, contentStart })
  }

  const results: Array<{ title: string; content: string }> = []
  for (let i = 0; i < sections.length; i++) {
    const { title, contentStart } = sections[i]
    const nextStart = i + 1 < sections.length ? sections[i + 1].contentStart : normalized.length
    const rawContent = normalized.slice(contentStart, nextStart)
    const content = htmlToText(rawContent)
    if (title || content) {
      results.push({ title, content })
    }
  }

  // 若未匹配到任何加粗标题，但仍有内容，则尝试用第一行作为标题
  if (results.length === 0) {
    const asText = htmlToText(normalized)
    const lines = asText.split('\n').filter((l) => l.trim() !== '')
    if (lines.length > 0) {
      const title = lines[0]
      const content = lines.slice(1).join('\n')
      results.push({ title, content })
    }
  }

  return results
}

// 新增：解析并发内容（容错）
const getParsedContent = (content: string) => {
  if (!content) return ''
  const str = String(content).trim()

  // 1) 尝试直接 JSON
  try {
    return JSON.parse(str)
  } catch {}

  // 2) 提取包裹的 JSON（如 “xxx { ... } yyy”）
  const start = str.indexOf('{')
  const end = str.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    const jsonPart = str.slice(start, end + 1)
    try {
      return JSON.parse(jsonPart)
    } catch {}
  }

  // 3) 提取 “data=” 后的 JSON
  const eqIdx = str.indexOf('data=')
  if (eqIdx !== -1) {
    const maybe = str.slice(eqIdx + 5).trim()
    try {
      return JSON.parse(maybe)
    } catch {}
  }

  // 4) 解析包含加粗标题的 HTML 为数组（用于 wlgd / xgft 等）
  if (/<div[^>]*style="[^"]*font-weight:\s*bold/i.test(str)) {
    const sections = parseHtmlSections(str)
    if (sections.length > 0) return sections
  }

  // 5) 返回原始字符串（模板中以 v-html 或纯文本展示）
  return str
}

// 新增：切换折叠卡片
const toggleConcurrentCard = (message: any, key: string) => {
  if (isConcurrentButtonDisabled(message, key)) {
    showNoDataTip.value = true
    setTimeout(() => (showNoDataTip.value = false), 2000)
    return
  }
  message.selectedConcurrentResult = message.selectedConcurrentResult === key ? '' : key
}

const newDialogue = () => {
  messages.value = []
  delete globalState.administrativePenaltyAssistance.aiResults
  delete globalState.administrativePenaltyAssistance.generalAiTime
  updateTitle('行政处罚辅助')
}

const getConcurrentLabelByKey = (key: string): string => {
  const label = concurrentLabels.value.find((item) => item.key === key)
  return label ? label.label : key
}

const getConcurrentContentByKey = (
  results: ConcurrentResult[] | undefined,
  key: string,
): string => {
  if (!results) return ''
  const result = results.find((item) => item.key === key)
  return result ? result.content : ''
}

const groupCasesByDate = (
  list: Array<Record<string, any>>,
): Array<{ date: string; cases: Array<Record<string, any>> }> => {
  if (!Array.isArray(list)) return []
  const groups: Record<string, Array<Record<string, any>>> = {}
  const order: string[] = []

  for (const item of list) {
    const raw = String(item?.judgedate || '').trim()
    // 规范到 yyyy-mm-dd（若为空则归类到 '未知日期'）
    const key = raw ? raw.slice(0, 10) : '未知日期'
    if (!groups[key]) {
      groups[key] = []
      order.push(key)
    }
    groups[key].push(item)
  }

  return order.map((date) => ({ date, cases: groups[date] }))
}

// 新增：统一的无数据判断（结合 aiLoading / error / 内容结构）
const isSectionNoData = (result: ConcurrentResult): boolean => {
  if (!result) return true
  if (result.error) return false
  if (result.aiLoading || result.isLoading) return false
  // 针对 xsal 为 JSON 数组字符串的情况
  if (result.key === 'xsal') {
    try {
      const arr = JSON.parse(result.content)
      return !Array.isArray(arr) || arr.length === 0
    } catch {
      return !result.content || result.content.trim() === ''
    }
  }
  // 其他栏目：内容为空或仅空白
  return !result.content || result.content.trim() === ''
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

/* 旋转加载样式 */

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
