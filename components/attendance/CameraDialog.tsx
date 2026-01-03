"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, RotateCcw } from "lucide-react"

interface CameraDialogProps {
  isOpen: boolean
  onCapture: (photoData: string) => void
  onCancel: () => void
  action: "checkin" | "checkout"
}

export function CameraDialog({ isOpen, onCapture, onCancel, action }: CameraDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasCamera, setHasCamera] = useState(true)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const startCamera = async () => {
      try {
        setIsLoading(true)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setHasCamera(true)
      } catch (error) {
        console.error("[v0] Camera error:", error)
        setHasCamera(false)
      } finally {
        setIsLoading(false)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [isOpen])

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return

    const context = canvasRef.current.getContext("2d")
    if (!context) return

    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    context.drawImage(videoRef.current, 0, 0)

    const imageData = canvasRef.current.toDataURL("image/jpeg")
    setCapturedImage(imageData)
  }

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="camera-dialog-description">
        <DialogHeader>
          <DialogTitle id="camera-dialog-title">
            {action === "checkin" ? "Verify Your Identity - Check In" : "Verify Your Identity - Check Out"}
          </DialogTitle>
          <p id="camera-dialog-description" className="sr-only">
            Camera dialog for identity verification during {action}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {capturedImage ? (
            <div className="space-y-3">
              <div className="relative bg-muted rounded-lg overflow-hidden">
                <img src={capturedImage || "/placeholder.svg"} alt="Captured photo" className="w-full h-auto" />
              </div>
              <p className="text-sm text-muted-foreground text-center">Please verify your photo looks good</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleRetake} className="flex-1 gap-2 bg-transparent">
                  <RotateCcw className="h-4 w-4" />
                  Retake
                </Button>
                <Button onClick={handleConfirm} className="flex-1">
                  Confirm & {action === "checkin" ? "Check In" : "Check Out"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {hasCamera ? (
                <>
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Position yourself in the frame and click capture
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                      Cancel
                    </Button>
                    <Button onClick={handleCapture} className="flex-1 gap-2">
                      <Camera className="h-4 w-4" />
                      Capture Photo
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-destructive font-semibold mb-2">Camera Access Denied</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please enable camera access in your browser settings to continue
                  </p>
                  <Button variant="outline" onClick={onCancel} className="w-full bg-transparent">
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  )
}
