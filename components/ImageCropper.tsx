"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, RotateCw, ZoomIn, ZoomOut, Check, Maximize2 } from "lucide-react";
import { CUSTOM_ORDER_SIZES, CustomOrderSize } from "@/types";

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price * 20000); // BASE_CUSTOM_ORDER_PRICE
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
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 rounded-lg border-4 border-white bg-black p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-white sm:text-xl">
              Ajustar Imagen al Lienzo
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Tamaño: {canvasHeight}x{canvasWidth} cm ({formatPrice(selectedSize.priceMultiplier)})
            </p>
          </div>
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-white bg-white px-3 py-2 text-sm font-bold text-black transition-all hover:bg-gray-200 sm:self-start"
          >
            <X className="h-4 w-4" />
            <span>Cancelar</span>
          </button>
        </div>

        {/* Size Selector */}
        <div className="mb-4 rounded-lg border-4 border-white bg-black p-4">
          <div className="mb-3 flex items-center gap-2">
            <Maximize2 className="h-5 w-5 text-white" />
            <h3 className="text-sm font-bold uppercase text-white">
              Tamaño del Lienzo
            </h3>
          </div>
          <select
            value={currentSizeIndex}
            onChange={(e) => onSizeChange(parseInt(e.target.value))}
            className="w-full rounded border-2 border-white bg-black px-4 py-3 text-sm font-bold text-white transition-all focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            {CUSTOM_ORDER_SIZES.map((size, index) => {
              const orientation =
                size.width < size.height
                  ? "Vertical"
                  : size.width > size.height
                    ? "Horizontal"
                    : "Cuadrado";
              return (
                <option key={index} value={index}>
                  {size.name} cm ({size.height}x{size.width}) - {orientation} - {formatPrice(size.priceMultiplier)}
                </option>
              );
            })}
          </select>
        </div>

        {/* Cropper Area */}
        <div className="relative mb-4 h-[50vh] w-full overflow-hidden rounded-lg border-4 border-white bg-black sm:h-[60vh]">
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

        {/* Controls */}
        <div className="space-y-3 rounded-lg border-4 border-white bg-black p-4">
          {/* Zoom Control */}
          <div className="flex items-center gap-3">
            <ZoomOut className="h-5 w-5 text-white" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1"
            />
            <ZoomIn className="h-5 w-5 text-white" />
            <span className="min-w-[3rem] text-center text-sm font-bold text-white">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Rotation Control */}
          <div className="flex items-center gap-3">
            <RotateCw className="h-5 w-5 text-white" />
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="min-w-[3rem] text-center text-sm font-bold text-white">
              {rotation}°
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-3 sm:flex-row">
            <button
              onClick={handleApplyCrop}
              disabled={isProcessing}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border-4 border-green-600 bg-green-600 px-6 py-3 text-base font-black text-white transition-all hover:bg-green-700 disabled:opacity-50 sm:text-lg"
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
          </div>

          {/* Help Text */}
          <p className="text-center text-xs text-gray-400">
            Usa los controles para ajustar zoom y rotación. Arrastra para reposicionar la imagen.
          </p>
        </div>
      </div>
    </div>
  );
}
