"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/app/contexts/AuthContext"
import { useAttendance } from "@/app/contexts/AttendanceContext"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useToast } from "@/hooks/use-toast"
import { isAtOffice } from "@/app/config/officeLocation"
import {
  LogIn,
  LogOut,
  MapPin,
  Loader2,
  Target,
  Building2,
  MapPinOff,
  Camera,
  X,
  Check,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"

interface CheckInData {
  photoData?: string
  locationVerified: boolean
  gpsAccuracy: number | null
  timestamp: Date
}

export function SecurityCheckIn() {
  const { user } = useAuth()
  const { checkIn, checkOut, getTodayRecordForEmployee } = useAttendance()
  const { getCurrentLocation, isLoading: isLoadingLocation, accuracy, location } = useGeolocation()
  const { toast } = useToast()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [isProcessing, setIsProcessing] = useState(false)
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)
  const [checkInMode, setCheckInMode] = useState<"in" | "out" | null>(null)
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [checkInDetails, setCheckInDetails] = useState<CheckInData | null>(null)

  const todayRecord = user ? getTodayRecordForEmployee(user.id) : null
  const isCheckedIn = todayRecord?.status === "checked-in"
  const isCheckedOut = todayRecord?.status === "checked-out"

  // Initialize camera
  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (error) {
      console.error("[v0] Camera error:", error)
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d")
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
        const imageData = canvasRef.current.toDataURL("image/jpeg", 0.9)
        setPhotoData(imageData)
      }
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      setIsCameraActive(false)
    }
  }

  // Handle check-in/out with security verification
  const handleSecureCheckIn = async (mode: "in" | "out") => {
    if (!user) return

    setCheckInMode(mode)
    setShowPhotoDialog(true)
    await initializeCamera()
  }

  // Finalize check-in
  const finalizeCheckIn = async () => {
    if (!user || !photoData) return

    setIsProcessing(true)
    try {
      console.log("[v0] SecurityCheckIn - Starting finalizeCheckIn")
      console.log("[v0] SecurityCheckIn - PhotoData length:", photoData?.length || 0)
      console.log("[v0] SecurityCheckIn - PhotoData preview:", photoData?.substring(0, 50))
      console.log("[v0] SecurityCheckIn - Mode:", checkInMode)

      const location = await getCurrentLocation()

      const locationData = location || {
        latitude: 0,
        longitude: 0,
        address: "Location not available",
        accuracy: null,
      }

      // Check office location
      const officeCheck = location ? isAtOffice(location.latitude, location.longitude) : { isWithinGeofence: false }

      const details: CheckInData = {
        photoData,
        locationVerified: officeCheck.isWithinGeofence,
        gpsAccuracy: accuracy,
        timestamp: new Date(),
      }

      setCheckInDetails(details)

      // Store photo data in device info
      const deviceInfo = {
        photoTimestamp: new Date().toISOString(),
        isAtOffice: officeCheck.isWithinGeofence,
        gpsAccuracy: accuracy,
        browser: navigator.userAgent.split(" ").pop() || "Unknown",
      }

      if (checkInMode === "in") {
        console.log("[v0] SecurityCheckIn - Calling checkIn with photoData")
        const record = await checkIn(user.id, user.name, locationData, photoData)
        console.log("[v0] SecurityCheckIn - CheckIn response received, photoData saved:", !!record.photoData)

        toast({
          title: "Security Check-in Successful",
          description: `Checked in at ${format(record.checkInTime!, "h:mm a")} ${officeCheck.isWithinGeofence ? "✓" : "⚠"}`,
        })
      } else if (checkInMode === "out") {
        if (!todayRecord) return
        console.log("[v0] SecurityCheckIn - Calling checkOut with photoData")
        const record = await checkOut(todayRecord.id, locationData, photoData)
        console.log(
          "[v0] SecurityCheckIn - CheckOut response received, checkOutPhotoData saved:",
          !!record.checkOutPhotoData,
        )

        toast({
          title: "Security Check-out Successful",
          description: `Checked out at ${format(record.checkOutTime!, "h:mm a")} • ${record.totalHours?.toFixed(1)} hours`,
        })
      }

      stopCamera()
      setShowPhotoDialog(false)
      setPhotoData(null)
    } catch (error: any) {
      console.error("[v0] SecurityCheckIn - Error during finalize:", error)
      toast({
        title: `${checkInMode === "in" ? "Check-in" : "Check-out"} Failed`,
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const isLoading = isProcessing || isLoadingLocation

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Check In Button */}
        <Button
          variant="checkin"
          size="jumbo"
          onClick={() => handleSecureCheckIn("in")}
          disabled={isLoading || isCheckedIn || isCheckedOut}
          className="relative overflow-hidden group"
        >
          {isLoading && !isCheckedIn ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-success-foreground/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <LogIn className="h-8 w-8 mr-3" />
              <span>CHECK IN</span>
            </>
          )}
        </Button>

        {/* Check Out Button */}
        <Button
          variant="checkout"
          size="jumbo"
          onClick={() => handleSecureCheckIn("out")}
          disabled={isLoading || !isCheckedIn || isCheckedOut}
          className="relative overflow-hidden group"
        >
          {isLoading && isCheckedIn ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-warning-foreground/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <LogOut className="h-8 w-8 mr-3" />
              <span>CHECK OUT</span>
            </>
          )}
        </Button>
      </div>

      {/* Location & Security Info */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Security Verification
          </CardTitle>
          <CardDescription>Location and photo verification enabled</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Office Location Status */}
          {location &&
            (() => {
              const officeCheck = isAtOffice(location.latitude, location.longitude)
              return (
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg border ${
                    officeCheck.isWithinGeofence ? "bg-success/10 border-success/30" : "bg-warning/10 border-warning/30"
                  }`}
                >
                  {officeCheck.isWithinGeofence ? (
                    <Building2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                  ) : (
                    <MapPinOff className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-semibold text-sm ${officeCheck.isWithinGeofence ? "text-success" : "text-warning"}`}
                    >
                      {officeCheck.isWithinGeofence ? "At Office Location" : "Outside Office Area"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {officeCheck.distanceFromOffice < 1000
                        ? `${officeCheck.distanceFromOffice}m from office`
                        : `${(officeCheck.distanceFromOffice / 1000).toFixed(1)}km from office`}
                    </p>
                  </div>
                  <Badge
                    className={
                      officeCheck.isWithinGeofence ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                    }
                  >
                    {officeCheck.isWithinGeofence ? "Verified" : "Alert"}
                  </Badge>
                </div>
              )
            })()}

          {/* GPS Accuracy Indicator */}
          {accuracy !== null && location && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2">
                <Target
                  className={`h-4 w-4 ${
                    accuracy <= 50 ? "text-success" : accuracy <= 100 ? "text-warning" : "text-destructive"
                  }`}
                />
                <span className="text-sm font-medium">GPS Accuracy</span>
              </div>
              <Badge
                className={
                  accuracy <= 50
                    ? "bg-success/20 text-success"
                    : accuracy <= 100
                      ? "bg-warning/20 text-warning"
                      : "bg-destructive/20 text-destructive"
                }
              >
                {accuracy}m ({accuracy <= 50 ? "Excellent" : accuracy <= 100 ? "Good" : "Low"})
              </Badge>
            </div>
          )}

          {/* Current Location Display */}
          {location?.address && (
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="text-muted-foreground">Your Location</p>
              <p className="font-medium mt-1">📍 {location.address}</p>
            </div>
          )}

          {/* Security Features Badge */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <Check className="h-4 w-4 text-primary" />
            <div className="text-sm">
              <p className="font-medium">Security Features Active</p>
              <p className="text-xs text-muted-foreground">Photo capture & geolocation verification enabled</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Capture Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              {checkInMode === "in" ? "Capture Check-in Photo" : "Capture Check-out Photo"}
            </DialogTitle>
            <DialogDescription>
              Take a photo for security verification. Ensure good lighting and your face is visible.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Camera Preview */}
            {!photoData ? (
              <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-primary/50 rounded-lg" />
              </div>
            ) : (
              <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                <img src={photoData || "/placeholder.svg"} alt="Captured" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Hidden Canvas for Photo Capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!photoData ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      stopCamera()
                      setShowPhotoDialog(false)
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button className="flex-1 gap-2" onClick={capturePhoto}>
                    <Camera className="h-4 w-4" />
                    Capture Photo
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setPhotoData(null)}>
                    <X className="h-4 w-4 mr-2" />
                    Retake
                  </Button>
                  <Button className="flex-1 gap-2" onClick={finalizeCheckIn} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        {checkInMode === "in" ? "Check In" : "Check Out"}
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* Security Info */}
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-muted-foreground">
              <p className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <span>Your photo and location data are securely stored and used only for attendance verification.</span>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
