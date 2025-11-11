"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, RotateCw, ZoomIn, ZoomOut, Check, Maximize2 } from "lucide-react";
import { CUSTOM_ORDER_SIZES, CustomOrderSize } from "@/types";
import { formatPrice as formatCLP } from "@/lib/utils";

interface ImageCropperProps {
  image: string;
  aspectRatio: number; // width / height (e.g., 1.5 for 60x40)
  currentSizeIndex: number;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onSizeChange: (newSizeIndex: number) => void;
  onCancel: () => void;
}

export default function ImageCropper({
  image,
  aspectRatio,
  currentSizeIndex,
  onCropComplete,
  onSizeChange,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedSize = CUSTOM_ORDER_SIZES[currentSizeIndex];
  const canvasWidth = selectedSize.width;
  const canvasHeight = selectedSize.height;

  const formatPrice = (multiplier: number) => {
    return formatCLP(multiplier * 20000); // BASE_CUSTOM_ORDER_PRICE
  };

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropCompleteCallback = useCallback(
    (_croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createCroppedImage = async (): Promise<Blob> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2d context");

    const imageObj = new Image();
    imageObj.src = image;

    return new Promise((resolve, reject) => {
      imageObj.onload = () => {
        // Set canvas size to the cropped area size
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        // Apply rotation
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        // Draw the cropped image
        ctx.drawImage(
          imageObj,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          canvas.width,
          canvas.height
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas to Blob failed"));
            }
          },
          "image/jpeg",
          0.95
        );
      };

      imageObj.onerror = () => {
        reject(new Error("Failed to load image"));
      };
    });
  };

  const handleApplyCrop = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedBlob = await createCroppedImage();
      onCropComplete(croppedBlob);
    } catch (error) {
      console.error("Error cropping image:", error);
      alert("Error al recortar la imagen. Por favor intenta de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4">
      <div className="relative h-full w-full max-w-6xl">
        {/* Header - Ultra Compact Single Row */}
        <div className="mb-3 flex flex-col gap-2 rounded-lg border-4 border-white bg-black p-3 sm:flex-row sm:items-center sm:gap-3">
          {/* Title */}
          <h2 className="text-base font-black text-white sm:text-lg">
            Ajustar Imagen
          </h2>

          {/* Divider */}
          <div className="hidden h-8 w-px bg-white/30 sm:block"></div>

          {/* Current Size - Inline */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-gray-400">Tamaño:</span>
            <span className="text-sm font-black text-white">
              {canvasHeight}x{canvasWidth} cm
            </span>
            <span className="text-xs font-bold text-green-400">
              {formatPrice(selectedSize.priceMultiplier)}
            </span>
          </div>

          {/* Divider */}
          <div className="hidden h-8 w-px bg-white/30 sm:block"></div>

          {/* Size Selector - Inline */}
          <div className="flex flex-1 items-center gap-2">
            <label className="text-xs font-bold uppercase text-gray-400 sm:whitespace-nowrap">
              Cambiar:
            </label>
            <select
              value={currentSizeIndex}
              onChange={(e) => onSizeChange(parseInt(e.target.value))}
              className="flex-1 rounded border-2 border-white bg-black px-2 py-1.5 text-xs font-bold text-white transition-all focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 sm:text-sm"
            >
              {CUSTOM_ORDER_SIZES.map((size, index) => {
                const orientation =
                  size.width < size.height
                    ? "V"
                    : size.width > size.height
                      ? "H"
                      : "C";
                return (
                  <option key={index} value={index}>
                    {size.height}x{size.width}cm [{orientation}] - {formatPrice(size.priceMultiplier)}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-1.5 rounded-lg border-2 border-white bg-white px-3 py-1.5 text-sm font-bold text-black transition-all hover:bg-gray-200 sm:ml-auto"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Cancelar</span>
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative mb-4 h-[40vh] w-full overflow-hidden rounded-lg border-4 border-white bg-black sm:h-[50vh] md:h-[60vh]">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        {/* Controls - Compact Layout */}
        <div className="rounded-lg border-4 border-white bg-black p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Zoom Control */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <ZoomIn className="h-4 w-4 text-white" />
                <label className="text-xs font-bold uppercase text-gray-400">Zoom</label>
                <span className="ml-auto text-sm font-bold text-white">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Rotation Control */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <RotateCw className="h-4 w-4 text-white" />
                <label className="text-xs font-bold uppercase text-gray-400">Rotación</label>
                <span className="ml-auto text-sm font-bold text-white">
                  {rotation}°
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleApplyCrop}
            disabled={isProcessing}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-4 border-green-600 bg-green-600 px-6 py-3 text-base font-black text-white transition-all hover:bg-green-700 disabled:opacity-50 sm:text-lg"
          >
            {isProcessing ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                <span>Aplicar Ajuste</span>
              </>
            )}
          </button>

          {/* Help Text */}
          <p className="mt-3 text-center text-xs text-gray-400">
            Arrastra para reposicionar • Usa los controles para ajustar zoom y rotación
          </p>
        </div>
      </div>
    </div>
  );
}
