import { ref } from 'vue'

function toBase64(buffer: ArrayBuffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function floatTo16kInt16(float32: Float32Array, fromRate: number) {
  const toRate = 16000
  const ratio = fromRate / toRate
  const length = Math.floor(float32.length / ratio)
  const result = new Int16Array(length)
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(i * ratio)
    let s = Math.max(-1, Math.min(1, float32[idx]))
    result[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return result
}

async function hmacSha256Base64(secret: string, data: string) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return toBase64(sig)
}

async function buildWsUrl() {
  const apiKey = import.meta.env.VITE_XFYUN_API_KEY as string | undefined
  const apiSecret = import.meta.env.VITE_XFYUN_API_SECRET as string | undefined
  const host = 'iat-api.xfyun.cn'
  const date = new Date().toUTCString()
  const requestLine = 'GET /v2/iat HTTP/1.1'
  if (apiKey && apiSecret) {
    const origin = `host: ${host}\ndate: ${date}\n${requestLine}`
    const signature = await hmacSha256Base64(apiSecret, origin)
    const authStr = `api_key=\"${apiKey}\", algorithm=\"hmac-sha256\", headers=\"host date request-line\", signature=\"${signature}\"`
    const authorization = btoa(authStr)
    return `wss://${host}/v2/iat?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`
  }
  throw new Error('xfyun_sign_missing')
}

export function useXFYunIat(opts?: { onText?: (t: string) => void; appId?: string }) {
  const isRecording = ref(false)
  const lastError = ref<string | null>(null)
  let ws: WebSocket | null = null
  let mediaStream: MediaStream | null = null
  let audioCtx: AudioContext | null = null
  let processor: ScriptProcessorNode | null = null
  let firstFrameSent = false
  const appId = (opts && opts.appId) || (import.meta.env.VITE_XFYUN_APP_ID as string | undefined)

  const start = async () => {
    if (isRecording.value) return
    lastError.value = null
    try {
      if (!appId) throw new Error('xfyun_appid_missing')
      const url = await buildWsUrl()
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioCtx.createMediaStreamSource(mediaStream)
      processor = audioCtx.createScriptProcessor(4096, 1, 1)
      ws = new WebSocket(url)
      ws.onopen = () => {
        isRecording.value = true
        source.connect(processor as ScriptProcessorNode)
        processor!.connect(audioCtx!.destination)
      }
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg.code === 0 && msg.data && msg.data.result && msg.data.result.ws) {
            const text = msg.data.result.ws
              .map((w: any) => (w.cw && w.cw[0] ? w.cw[0].w : ''))
              .join('')
            if (text && opts && opts.onText) opts.onText(text)
          }
        } catch {}
      }
      ws.onerror = () => {
        lastError.value = 'xfyun_ws_error'
        stop()
      }
      ws.onclose = () => {
        isRecording.value = false
      }
      processor.onaudioprocess = (e) => {
        if (!ws || ws.readyState !== 1) return
        const input = e.inputBuffer.getChannelData(0)
        const pcm16 = floatTo16kInt16(input, audioCtx!.sampleRate)
        const payload = {
          common: { app_id: appId },
          business: { language: 'zh_cn', domain: 'iat', accent: 'mandarin', vad_eos: 3000 },
          data: {
            status: firstFrameSent ? 1 : 0,
            format: 'audio/L16;rate=16000',
            encoding: 'raw',
            audio: toBase64(pcm16.buffer),
          },
        }
        ws.send(JSON.stringify(payload))
        firstFrameSent = true
      }
    } catch (err: any) {
      try {
        const Speech = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        if (Speech) {
          const rec = new Speech()
          rec.lang = 'zh-CN'
          rec.continuous = true
          rec.interimResults = true
          rec.onresult = (e: any) => {
            let str = ''
            for (let i = e.resultIndex; i < e.results.length; i++) str += e.results[i][0].transcript
            if (str && opts && opts.onText) opts.onText(str)
          }
          rec.onerror = () => {
            lastError.value = 'speech_api_error'
          }
          rec.onend = () => {
            isRecording.value = false
          }
          rec.start()
          isRecording.value = true
          return
        }
      } catch {}
      lastError.value = String(err && err.message ? err.message : 'xfyun_init_failed')
    }
  }

  const stop = () => {
    if (processor) {
      processor.disconnect()
      processor = null
    }
    if (audioCtx) {
      audioCtx.close()
      audioCtx = null
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop())
      mediaStream = null
    }
    if (ws && (ws.readyState === 1 || ws.readyState === 0)) {
      try {
        const endPayload = {
          common: { app_id: appId },
          business: { language: 'zh_cn', domain: 'iat', accent: 'mandarin', vad_eos: 3000 },
          data: { status: 2, format: 'audio/L16;rate=16000', encoding: 'raw', audio: '' },
        }
        ws.send(JSON.stringify(endPayload))
      } catch {}
      ws.close()
    }
    ws = null
    firstFrameSent = false
    isRecording.value = false
  }

  return { isRecording, lastError, start, stop }
}
