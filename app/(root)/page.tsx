"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Camera } from "lucide-react";
import clsx from "clsx";
import { MaxWidthWrapper } from "@/components/max-width-wrapper";
import Dropdown from "@/components/dropdown";
import { intervals } from "@/constants/dropdown";
import { detectEmotionAndRefreshUser } from "@/lib/api-services/emotion-api";
import { toast } from "sonner";
import { userStorage } from "@/lib/storage-service";
import EmojiConfetti from "@/components/EmojiConfetti";
import UserListing from "@/components/UserListing";
import EmotionHistory from "@/components/EmotionHistory";
import { getEmoji } from "@/constants/emoji";
import { Button } from "@/components/ui/button";

const Page = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [hasHydrated, setHasHydrated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [emotionDetectionEnabled, setEmotionDetectionEnabled] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState(intervals[0].value);
  const [videoReady, setVideoReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [liveReportEnabled, setLiveReportEnabled] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [emotion, setEmotion] = useState<string | null>(getEmoji("happy"));

  const currentUser = userStorage.getUser();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    if (cameraEnabled) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((err) => {
          console.error("Error accessing camera: ", err);
          toast.error("Camera Error", {
            description: "Could not access your camera. Please check permissions.",
          });
          setCameraEnabled(false);
        });
    } else {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setVideoReady(false);
      setEmotionDetectionEnabled(false);
    }
  }, [cameraEnabled, hasHydrated]);

  const handleVideoLoaded = useCallback(() => {
    setVideoReady(true);
  }, []);

  const captureImageFromVideo = useCallback((): Promise<{ blob: Blob; base64: string }> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current) return reject("No video element");
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No 2D context");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return reject("Failed to convert canvas to Blob");
        const base64 = canvas.toDataURL("image/png");
        resolve({ blob, base64 });
      }, "image/png");
    });
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (emotionDetectionEnabled) {
      const intervalSeconds = Number(selectedInterval) || 5;
      captureIntervalRef.current = setInterval(async () => {
        if (isProcessing) return;
        try {
          const { base64 } = await captureImageFromVideo();
          setCapturedImage(base64);
          setIsProcessing(true);

          const result = await detectEmotionAndRefreshUser(base64);
          setEmotion(getEmoji(result.data?.emotion || "happy"));
          setShowConfetti(true);

          toast.success("Emotion Detected", {
            description: `You appear to be feeling ${result.data?.emotion || ""} (${Math.round(
              (result.data?.confidence || 0) * 100
            )}% confidence)`,
          });
        } catch (err) {
          toast.error("Detection Failed", {
            description: err instanceof Error ? err.message : "Could not detect emotion",
          });
        } finally {
          setIsProcessing(false);
        }
      }, intervalSeconds * 1000);
    } else {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
    }
    return () => {
      if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
    };
  }, [emotionDetectionEnabled, selectedInterval, captureImageFromVideo, hasHydrated, isProcessing]);

  return (
    <MaxWidthWrapper className="flex flex-col w-full h-screen md:h-[calc(100vh-64px)] gap-6 py-4">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row w-full h-full gap-4 md:gap-8 border-b border-b-gray-200 pb-4 md:pb-8">
        {/* Camera Preview */}
        <div className="relative flex flex-col items-center justify-center w-full md:w-1/2 h-80 md:h-full overflow-hidden bg-gray-900 rounded-lg mb-4 md:mb-0">
          <video
            ref={videoRef}
            onLoadedMetadata={handleVideoLoaded}
            autoPlay
            playsInline
            muted
            className={clsx(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
              videoReady ? "opacity-100" : "opacity-0",
              "transform scale-x-[-1]"
            )}
          />
          <div
            className={clsx(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-500",
              videoReady ? "opacity-0" : "opacity-100"
            )}
          >
            <Camera size={64} className="text-white" />
          </div>
          {isProcessing && (
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              Processing...
            </div>
          )}
          {showConfetti && (
            <EmojiConfetti
              emoji={emotion || ""}
              onComplete={() => setShowConfetti(false)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            />
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col w-full md:w-1/2 h-auto md:h-full space-y-4 md:space-y-6 overflow-auto">
          <ControlCard
            label="Camera"
            description="Enable or disable the camera."
            control={<Switch checked={cameraEnabled} onCheckedChange={setCameraEnabled} />}
          />
          <ControlCard
            label="Interval"
            description="Set the interval for emotion detection."
            control={
              <div className="w-full md:w-40">
                <Dropdown
                  datas={intervals}
                  hint="Search interval..."
                  placeholder="Select interval"
                  notfound="No interval found"
                  selectedValue={selectedInterval}
                  onSelect={(value) => setSelectedInterval(value as string)}
                  disabled={!cameraEnabled}
                />
              </div>
            }
          />
          <ControlCard
            label="Start Emotion Detection"
            description="Start or stop detection."
            control={
              <Switch
                checked={emotionDetectionEnabled}
                onCheckedChange={setEmotionDetectionEnabled}
                disabled={!cameraEnabled}
              />
            }
          />
          {/* <ControlCard
            label="Live Report"
            description="View your live report."
            control={
              <Button
                className="w-full md:w-auto"
                disabled={!liveReportEnabled}
                onClick={() => setLiveReportEnabled(!liveReportEnabled)}
              >
                {liveReportEnabled ? "Hide Live Report" : "View Live Report"}
              </Button>
            }
          /> */}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col w-full h-auto md:h-1/2 space-y-4 md:space-y-6 overflow-visible">
        {currentUser?.role === "admin" ? <UserListing /> : <EmotionHistory />}
      </div>
    </MaxWidthWrapper>
  );
};

interface ControlCardProps {
  label: string;
  description?: string;
  control?: React.ReactNode;
}

const ControlCard: React.FC<ControlCardProps> = ({ label, description, control }) => (
  <div className="flex flex-row items-center justify-between rounded-lg border p-3 md:p-4 shadow-sm w-full">
    <div className="space-y-0.5">
      <Label className="font-medium">{label}</Label>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
    {control}
  </div>
);

export default Page;
