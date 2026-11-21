export type DetectionBox = {
  x: number
  y: number
  width: number
  height: number
  confidence: number
  class: string
}

export type DetectionResult = {
  boxes: DetectionBox[]
  source: 'roboflow' | 'mock'
  message?: string
}

function mockBoxes(imageWidth: number, imageHeight: number): DetectionBox[] {
  return [
    {
      x: imageWidth * 0.42,
      y: imageHeight * 0.55,
      width: imageWidth * 0.18,
      height: imageHeight * 0.14,
      confidence: 0.91,
      class: 'pothole',
    },
    {
      x: imageWidth * 0.62,
      y: imageHeight * 0.48,
      width: imageWidth * 0.12,
      height: imageHeight * 0.1,
      confidence: 0.78,
      class: 'pothole',
    },
  ]
}

export async function detectPotholes(
  imageBase64: string,
  size: { width: number; height: number },
): Promise<DetectionResult> {
  const apiKey = import.meta.env.VITE_ROBOFLOW_API_KEY as string | undefined
  const model = (import.meta.env.VITE_ROBOFLOW_MODEL as string | undefined) || 'pothole-detection'
  const version = (import.meta.env.VITE_ROBOFLOW_VERSION as string | undefined) || '1'

  if (!apiKey) {
    return {
      boxes: mockBoxes(size.width, size.height),
      source: 'mock',
      message: 'No Roboflow key — using mock boxes',
    }
  }

  try {
    const bare = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const res = await fetch(
      `https://detect.roboflow.com/${model}/${version}?api_key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bare,
      },
    )
    if (!res.ok) throw new Error(`Roboflow ${res.status}`)
    const json = (await res.json()) as {
      predictions?: Array<{
        x: number
        y: number
        width: number
        height: number
        confidence: number
        class?: string
      }>
    }
    const boxes = (json.predictions ?? []).map((p) => ({
      x: p.x,
      y: p.y,
      width: p.width,
      height: p.height,
      confidence: p.confidence,
      class: p.class ?? 'pothole',
    }))
    if (boxes.length === 0) {
      return {
        boxes: mockBoxes(size.width, size.height),
        source: 'mock',
        message: 'No predictions — fell back to mock',
      }
    }
    return { boxes, source: 'roboflow' }
  } catch (err) {
    return {
      boxes: mockBoxes(size.width, size.height),
      source: 'mock',
      message: err instanceof Error ? err.message : 'Roboflow failed — mock used',
    }
  }
}
