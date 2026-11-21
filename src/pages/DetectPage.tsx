import { useRef, useState } from 'react'
import { Upload, Sparkles } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { detectPotholes, type DetectionBox } from '../lib/roboflow'
import { dbSeverityFromConfidence } from '../lib/mapPothole'
import { supabase } from '../lib/supabase'
import { usePotholesContext } from '../context/PotholesProvider'

const KAMPALA = { lat: 0.3476, lng: 32.5825 }

export function DetectPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { refresh } = usePotholesContext()

  const [preview, setPreview] = useState<string | null>(null)
  const [boxes, setBoxes] = useState<DetectionBox[]>([])
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [note, setNote] = useState('Upload a road photo to run detection.')
  const [topConfidence, setTopConfidence] = useState<number | null>(null)

  function draw(imageUrl: string, nextBoxes: DetectionBox[]) {
    const canvas = canvasRef.current
    if (!canvas) return
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      ctx.lineWidth = Math.max(2, img.width / 200)
      ctx.font = `${Math.max(14, img.width / 40)}px IBM Plex Sans, sans-serif`
      for (const b of nextBoxes) {
        const x = b.x - b.width / 2
        const y = b.y - b.height / 2
        ctx.strokeStyle = '#22c55e'
        ctx.fillStyle = 'rgba(34,197,94,0.15)'
        ctx.fillRect(x, y, b.width, b.height)
        ctx.strokeRect(x, y, b.width, b.height)
        const label = `${b.class} ${Math.round(b.confidence * 100)}%`
        ctx.fillStyle = '#14532d'
        ctx.fillRect(x, y - 22, ctx.measureText(label).width + 10, 22)
        ctx.fillStyle = '#ecfdf5'
        ctx.fillText(label, x + 5, y - 6)
      }
    }
    img.src = imageUrl
  }

  function onFile(file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = String(reader.result)
      setPreview(url)
      setBoxes([])
      setTopConfidence(null)
      setNote('Preview ready. Run detection.')
      draw(url, [])
    }
    reader.readAsDataURL(file)
  }

  async function runDetect() {
    if (!preview) return
    setBusy(true)
    setNote('Detecting…')
    const img = new Image()
    await new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.src = preview
    })
    const result = await detectPotholes(preview, {
      width: img.width,
      height: img.height,
    })
    setBoxes(result.boxes)
    const top = Math.max(...result.boxes.map((b) => b.confidence), 0)
    setTopConfidence(top)
    draw(preview, result.boxes)
    setNote(
      `${result.source === 'roboflow' ? 'Roboflow' : 'Mock'} · ${result.boxes.length} box(es)` +
        (result.message ? ` · ${result.message}` : ''),
    )
    setBusy(false)
  }

  async function savePin() {
    if (!preview || boxes.length === 0 || topConfidence == null) return
    setSaving(true)
    const confidence = topConfidence
    const severity = dbSeverityFromConfidence(confidence)
    const jitter = () => (Math.random() - 0.5) * 0.01
    const potholeId = Date.now() % 1_000_000_000

    // Ensure a default dataset exists for inserts
    await supabase.from('datasets').upsert(
      {
        id: 'default',
        name: 'Default',
        description: 'ViaSight uploads',
        is_default: true,
      },
      { onConflict: 'id' },
    )

    const photoUrl = preview.length < 1800 ? preview : null
    const { error } = await supabase.from('potholes').insert({
      pothole_id: potholeId,
      dataset_id: 'default',
      latitude: KAMPALA.lat + jitter(),
      longitude: KAMPALA.lng + jitter(),
      width_m: 40 + Math.random() * 40,
      length_m: 30 + Math.random() * 40,
      depth_m: 3 + Math.random() * 6,
      confidence,
      severity,
      status: 'detected',
      detection_timestamp: new Date().toISOString(),
      detection_method: 'upload',
      photo_url: photoUrl,
      road_name: 'Upload pin',
      district: 'Kampala',
      metadata: {
        boxes: boxes.map((b) => ({
          confidence: b.confidence,
          class: b.class,
          width: b.width,
          height: b.height,
        })),
        source: 'detect-page',
      },
    })

    if (error) {
      setNote(`Save failed: ${error.message}`)
    } else {
      setNote(`Saved pin PH-${potholeId} · ${severity} · ${Math.round(confidence * 100)}%`)
      await refresh()
    }
    setSaving(false)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Detect"
        subtitle="Upload → detect (Roboflow or mock) → save pin to Supabase"
      />
      <div className="vs-scroll flex-1 overflow-y-auto p-6">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-[var(--vs-line)] bg-white p-5">
            <h2 className="mb-3 text-[14px] font-semibold text-slate-900">
              Upload road photo
            </h2>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-slate-500 hover:border-slate-400 hover:bg-slate-100"
            >
              <Upload className="h-7 w-7" />
              <span className="text-[13px] font-medium">
                Drop image or click to browse
              </span>
              <span className="text-[12px] text-slate-400">JPG / PNG</span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={!preview || busy}
                onClick={() => void runDetect()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-40"
              >
                <Sparkles className="h-4 w-4" />
                {busy ? 'Running…' : 'Run detection'}
              </button>
              <button
                type="button"
                disabled={!boxes.length || saving}
                onClick={() => void savePin()}
                className="rounded-lg border border-[var(--vs-line)] px-4 py-2.5 text-[13px] font-semibold text-slate-600 disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Save pin'}
              </button>
            </div>
            <p className="mt-3 text-[12px] text-slate-500">{note}</p>
            {topConfidence != null ? (
              <p className="mt-1 text-[12px] font-semibold text-slate-700">
                Confidence {Math.round(topConfidence * 100)}% · severity{' '}
                {dbSeverityFromConfidence(topConfidence)}
              </p>
            ) : null}
          </section>

          <section className="overflow-hidden rounded-2xl border border-[var(--vs-line)] bg-slate-900">
            <canvas ref={canvasRef} className="aspect-[4/3] w-full object-contain" />
          </section>
        </div>
      </div>
    </div>
  )
}
