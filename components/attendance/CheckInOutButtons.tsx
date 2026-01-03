"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/contexts/AuthContext"
import { useAttendance } from "@/app/contexts/AttendanceContext"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useToast } from "@/hooks/use-toast"
import { LogIn, LogOut, MapPin, Loader2, Target, Building2, MapPinOff } from "lucide-react"
import { format } from "date-fns"
import { isAtOffice, OFFICE_LOCATION } from "@/app/config/officeLocation"
import { PermissionDialog } from "./PermissionDialog"
import { CameraDialog } from "./CameraDialog"

export function CheckInOutButtons() {
  const { user } = useAuth()
  const { checkIn, checkOut, getTodayRecordForEmployee } = useAttendance()
  const { getCurrentLocation, isLoading: isLoadingLocation, accuracy, location } = useGeolocation()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPermissionDialog, setShowPermissionDialog] = useState(false)
  const [showCameraDialog, setShowCameraDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<"checkin" | "checkout" | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)

  const todayRecord = user ? getTodayRecordForEmployee(user.id) : null
  const isCheckedIn = todayRecord?.status === "checked-in"
  const isCheckedOut = todayRecord?.status === "checked-out"

  const handleCheckInClick = () => {
    setPendingAction("checkin")
    setShowPermissionDialog(true)
  }

  const handleCheckOutClick = () => {
    setPendingAction("checkout")
    setShowPermissionDialog(true)
  }

  const handlePermissionConfirm = () => {
    setShowPermissionDialog(false)
    setShowCameraDialog(true)
  }

  const handlePhotoCapture = async (photoData: string) => {
    setCapturedPhoto(photoData)
    const today = format(new Date(), "yyyy-MM-dd")
    const photoKey = `employee_photos_${user?.id}`
    const existingPhotos = JSON.parse(localStorage.getItem(photoKey) || "{}")
    existingPhotos[today] = photoData
    localStorage.setItem(photoKey, JSON.stringify(existingPhotos))
    console.log("[v0] Photo stored in localStorage as backup - Key:", photoKey, "Date:", today)

    setShowCameraDialog(false)

    if (pendingAction === "checkin") {
      await performCheckIn(photoData)
    } else if (pendingAction === "checkout") {
      await performCheckOut(photoData)
    }
  }

  const performCheckIn = async (photoData: string) => {
    if (!user) return

    setIsProcessing(true)
    try {
      const locationData = await getCurrentLocation()

      const finalLocationData = locationData || {
        latitude: 0,
        longitude: 0,
        address: "Location not available",
        accuracy: null,
      }

      const record = await checkIn(user.id, user.name, finalLocationData, photoData)

      toast({
        title: "✅ Check-in Successful!",
        description: `Checked in at ${format(record.checkInTime!, "h:mm a")}`,
      })
    } catch (error: any) {
      toast({
        title: "Check-in Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setPendingAction(null)
    }
  }

  const performCheckOut = async (photoData: string) => {
    if (!todayRecord) return

    setIsProcessing(true)
    try {
      console.log(
        "[v0] CheckInOutButtons - performCheckOut called with photoData:",
        photoData ? `${photoData.substring(0, 50)}...` : "no photo",
      )
      if (!photoData) {
        throw new Error("No photo captured. Please try again.")
      }

      const locationData = await getCurrentLocation()

      const finalLocationData = locationData || {
        latitude: 0,
        longitude: 0,
        address: "Location not available",
        accuracy: null,
      }

      console.log("[v0] CheckInOutButtons - About to call checkOut API with photo length:", photoData.length)
      const record = await checkOut(todayRecord.id, finalLocationData, photoData)

      console.log("[v0] CheckInOutButtons - API returned record with checkOutPhotoData:", !!record.checkOutPhotoData)
      console.log("[v0] CheckInOutButtons - Record status:", record.status)

      toast({
        title: "👋 Check-out Successful!",
        description: `Checked out at ${format(record.checkOutTime!, "h:mm a")} • ${record.totalHours?.toFixed(1)} hours worked`,
      })
    } catch (error: any) {
      console.error("[v0] CheckInOutButtons - Check-out error:", error)
      toast({
        title: "Check-out Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setPendingAction(null)
    }
  }

  const isLoading = isProcessing || isLoadingLocation

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Check In Button */}
          <Button
            variant="checkin"
            size="jumbo"
            onClick={handleCheckInClick}
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
            onClick={handleCheckOutClick}
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

        {/* Location Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Your location and photo will be captured</span>
          </div>

          {/* Office Location Status */}
          {location &&
            (() => {
              const officeCheck = isAtOffice(location.latitude, location.longitude)
              return (
                <div
                  className={`flex items-center justify-center gap-3 p-4 rounded-lg border ${
                    officeCheck.isWithinGeofence ? "bg-success/10 border-success/30" : "bg-warning/10 border-warning/30"
                  }`}
                >
                  {officeCheck.isWithinGeofence ? (
                    <Building2 className="h-5 w-5 text-success" />
                  ) : (
                    <MapPinOff className="h-5 w-5 text-warning" />
                  )}
                  <div className="text-left">
                    <p
                      className={`text-sm font-semibold ${officeCheck.isWithinGeofence ? "text-success" : "text-warning"}`}
                    >
                      {officeCheck.isWithinGeofence ? "✓ At Office Location" : "⚠ Outside Office Area"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {officeCheck.distanceFromOffice < 1000
                        ? `${officeCheck.distanceFromOffice}m from office`
                        : `${(officeCheck.distanceFromOffice / 1000).toFixed(1)}km from office`}
                    </p>
                  </div>
                </div>
              )
            })()}

          {/* GPS Accuracy Indicator */}
          {accuracy !== null && location && (
            <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2">
                <Target
                  className={`h-4 w-4 ${accuracy <= 50 ? "text-success" : accuracy <= 100 ? "text-warning" : "text-destructive"}`}
                />
                <span className="text-sm font-medium">
                  GPS Accuracy:{" "}
                  <span
                    className={accuracy <= 50 ? "text-success" : accuracy <= 100 ? "text-warning" : "text-destructive"}
                  >
                    {accuracy}m
                  </span>
                </span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  accuracy <= 50
                    ? "bg-success/20 text-success"
                    : accuracy <= 100
                      ? "bg-warning/20 text-warning"
                      : "bg-destructive/20 text-destructive"
                }`}
              >
                {accuracy <= 50 ? "Excellent" : accuracy <= 100 ? "Good" : "Low - try outdoors"}
              </span>
            </div>
          )}

          {/* Current Location Display */}
          {location?.address && <div className="text-center text-xs text-muted-foreground">📍 {location.address}</div>}

          {/* Office Address Reference */}
          <div className="text-center text-xs text-muted-foreground border-t pt-2">
            <span className="font-medium">Office:</span> {OFFICE_LOCATION.address}
          </div>
        </div>
      </div>

      {/* Permission Dialog */}
      <PermissionDialog
        isOpen={showPermissionDialog}
        onConfirm={handlePermissionConfirm}
        onCancel={() => {
          setShowPermissionDialog(false)
          setPendingAction(null)
        }}
        isLoading={isLoading}
      />

      {/* Camera Dialog */}
      <CameraDialog
        isOpen={showCameraDialog}
        onCapture={handlePhotoCapture}
        onCancel={() => {
          setShowCameraDialog(false)
          setPendingAction(null)
        }}
        action={pendingAction || "checkin"}
      />
    </>
  )
}
