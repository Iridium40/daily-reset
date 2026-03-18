'use client'
// components/LogoUploader.tsx
// Drag-and-drop logo upload component used in the admin panel.

import { useState, useCallback, useRef } from 'react'

interface Props {
  orgSlug:    string
  currentUrl: string
  accent:     string
  onUploaded: (url: string) => void
}

export default function LogoUploader({ orgSlug, currentUrl, accent, onUploaded }: Props) {
  const [dragging,   setDragging]   = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const [preview,    setPreview]    = useState(currentUrl)
  const [error,      setError]      = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(async (file: File) => {
    setError('')
    setUploading(true)

    // Local preview immediately
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    const form = new FormData()
    form.append('file',    file)
    form.append('orgSlug', orgSlug)

    const res  = await fetch('/api/upload/logo', { method: 'POST', body: form })
    const data = await res.json()
    setUploading(false)

    if (!res.ok) { setError(data.error || 'Upload failed'); return }

    setPreview(data.logoUrl)
    onUploaded(data.logoUrl)
  }, [orgSlug, onUploaded])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }, [upload])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
  }

  const borderColor = dragging ? accent : '#E2D9C5'

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border:        `2px dashed ${borderColor}`,
          borderRadius:  12,
          padding:       '28px 20px',
          textAlign:     'center',
          cursor:        'pointer',
          background:    dragging ? '#F0EBE0' : '#F7F2E8',
          transition:    'all 0.2s',
          position:      'relative',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          style={{ display: 'none' }}
          onChange={onFileChange}
        />

        {uploading ? (
          <div>
            <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
            <p style={{ fontSize: 13, color: '#7A6E5C' }}>Uploading...</p>
          </div>
        ) : preview ? (
          <div>
            <img src={preview} alt="Logo preview" style={{ height: 56, objectFit: 'contain', marginBottom: 12, borderRadius: 6 }} />
            <p style={{ fontSize: 12, color: '#7A6E5C' }}>Click or drag to replace</p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#2C2416', marginBottom: 4 }}>Drop your logo here</p>
            <p style={{ fontSize: 12, color: '#7A6E5C' }}>or click to browse · PNG, JPG, SVG, WebP · max 2MB</p>
          </div>
        )}
      </div>

      {error && (
        <p style={{ fontSize: 12, color: '#C43B3B', marginTop: 6 }}>⚠ {error}</p>
      )}

      {preview && !uploading && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            onClick={() => { setPreview(''); onUploaded('') }}
            style={{ fontSize: 11, color: '#C43B3B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Remove logo
          </button>
        </div>
      )}
    </div>
  )
}
