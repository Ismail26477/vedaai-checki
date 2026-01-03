"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, MapPin, AlertCircle, CheckCircle2 } from "lucide-react"

interface PermissionDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function PermissionDialog({ isOpen, onConfirm, onCancel, isLoading = false }: PermissionDialogProps) {
  const [permissionsGranted, setPermissionsGranted] = useState({
    camera: false,
    location: false,
  })

  const handleRequestPermissions = async () => {
    try {
      // Request camera permission
      await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })
      setPermissionsGranted((prev) => ({ ...prev, camera: true }))
    } catch (error) {
      console.error("[v0] Camera permission denied:", error)
    }

    try {
      // Request location permission
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissionsGranted((prev) => ({ ...prev, location: true }))
        },
        (error) => {
          console.error("[v0] Location permission denied:", error)
        },
      )
    } catch (error) {
      console.error("[v0] Location error:", error)
    }
  }

  const handleProceed = async () => {
    if (!permissionsGranted.camera || !permissionsGranted.location) {
      await handleRequestPermissions()
      return
    }
    onConfirm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Verify Your Identity</DialogTitle>
          <DialogDescription>We need camera access and location to securely record your attendance</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Permission */}
          <div
            className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
              permissionsGranted.camera ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {permissionsGranted.camera ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Camera className="h-5 w-5 text-warning" />
                )}
                <span className="font-semibold text-sm">
                  {permissionsGranted.camera ? "Camera Access Granted" : "Camera Access Required"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                We'll take a photo of you during check-in for verification
              </p>
            </div>
          </div>

          {/* Location Permission */}
          <div
            className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
              permissionsGranted.location ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {permissionsGranted.location ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <MapPin className="h-5 w-5 text-warning" />
                )}
                <span className="font-semibold text-sm">
                  {permissionsGranted.location ? "Location Access Granted" : "Location Access Required"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">We'll verify you're at the office location</p>
            </div>
          </div>

          {/* Info Alert */}
          <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Your privacy is important. All data is encrypted and stored securely.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleProceed} disabled={isLoading} className="flex-1">
              {permissionsGranted.camera && permissionsGranted.location ? "Proceed" : "Request Permissions"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
