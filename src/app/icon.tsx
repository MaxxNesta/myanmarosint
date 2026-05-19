import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32, height: 32,
          background: '#0a0e17',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
          color: '#ef4444',
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        ▲
      </div>
    ),
    { ...size },
  )
}
